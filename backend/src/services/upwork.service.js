import { logger } from '../utils/logger.js';
import { upworkLimiter } from '../utils/rateLimiter.js';
import { parseMoneyValue, hashObject } from '../utils/helpers.js';
import {
  UPWORK_API_BASE,
  UPWORK_AUTH_URL,
  UPWORK_TOKEN_URL,
} from '../../../shared/constants.js';

// ── Token Management ─────────────────────────────────────────────

let tokens = {
  accessToken: process.env.UPWORK_ACCESS_TOKEN || '',
  refreshToken: process.env.UPWORK_REFRESH_TOKEN || '',
};

export function setTokens(access, refresh) {
  tokens.accessToken = access;
  tokens.refreshToken = refresh;
}

export function getTokens() {
  return { ...tokens };
}

// ── OAuth2 Helpers ───────────────────────────────────────────────

export function getAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.UPWORK_CLIENT_ID,
    redirect_uri: process.env.UPWORK_REDIRECT_URI,
  });
  return `${UPWORK_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const res = await fetch(UPWORK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.UPWORK_CLIENT_ID,
      client_secret: process.env.UPWORK_CLIENT_SECRET,
      code,
      redirect_uri: process.env.UPWORK_REDIRECT_URI,
    }),
  });
  const data = await res.json();
  if (data.access_token) {
    setTokens(data.access_token, data.refresh_token);
    logger.info('Upwork tokens obtained successfully');
  } else {
    logger.error('Failed to obtain Upwork tokens', data);
  }
  return data;
}

export async function refreshAccessToken() {
  if (!tokens.refreshToken) {
    logger.warn('No refresh token available');
    return null;
  }
  const res = await fetch(UPWORK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.UPWORK_CLIENT_ID,
      client_secret: process.env.UPWORK_CLIENT_SECRET,
      refresh_token: tokens.refreshToken,
    }),
  });
  const data = await res.json();
  if (data.access_token) {
    setTokens(data.access_token, data.refresh_token);
    logger.info('Upwork tokens refreshed');
  } else {
    logger.error('Token refresh failed', data);
  }
  return data;
}

// ── GraphQL Caller ───────────────────────────────────────────────

async function callUpworkGraphQL(query, variables = {}) {
  await upworkLimiter.waitIfNeeded();

  if (!tokens.accessToken) {
    throw new Error('No Upwork access token. Please authenticate first via /api/auth/url');
  }

  const res = await fetch(UPWORK_API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 401) {
    logger.warn('Upwork token expired, attempting refresh...');
    const refreshResult = await refreshAccessToken();
    if (refreshResult?.access_token) {
      // Retry once
      const retryRes = await fetch(UPWORK_API_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });
      return retryRes.json();
    }
    throw new Error('Failed to refresh Upwork token');
  }

  if (res.status === 429) {
    logger.warn('Upwork rate limit hit, waiting 60s...');
    await new Promise((r) => setTimeout(r, 60000));
    return callUpworkGraphQL(query, variables);
  }

  return res.json();
}

// ── Job Search ───────────────────────────────────────────────────

const JOB_SEARCH_QUERY = `
query marketplaceJobPostingsSearch(
  $marketPlaceJobFilter: MarketplaceJobPostingsSearchFilter,
  $sortAttributes: [MarketplaceJobPostingSearchSortAttribute]
) {
  marketplaceJobPostingsSearch(
    marketPlaceJobFilter: $marketPlaceJobFilter,
    searchType: USER_JOBS_SEARCH,
    sortAttributes: $sortAttributes
  ) {
    totalCount
    edges {
      node {
        id
        title
        description
        ciphertext
        duration
        durationLabel
        engagement
        amount {
          rawValue
          currency
          displayValue
        }
        experienceLevel
        category
        subcategory
        totalApplicants
        createdDateTime
        publishedDateTime
        renewedDateTime
        enterprise
        applied
        skills {
          name
          prettyName
        }
        client {
          totalHires
          totalPostedJobs
          totalSpent {
            rawValue
            displayValue
          }
          verificationStatus
          location {
            city
            country
            timezone
          }
          totalReviews
          totalFeedback
          hasFinancialPrivacy
        }
        hourlyBudgetMin {
          rawValue
        }
        hourlyBudgetMax {
          rawValue
        }
        job {
          contractTerms {
            contractType
            experienceLevel
            fixedPriceContractTerms {
              amount {
                rawValue
              }
              maxAmount {
                rawValue
              }
              engagementDuration {
                label
                weeks
              }
            }
            hourlyContractTerms {
              engagementDuration {
                label
                weeks
              }
              engagementType
            }
          }
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}`;

export async function searchJobs(preferences, pagination = { after: '0', first: 50 }) {
  const filter = buildSearchFilter(preferences);

  const variables = {
    marketPlaceJobFilter: {
      ...filter,
      pagination_eq: pagination,
    },
    sortAttributes: [{ field: 'RECENCY' }],
  };

  logger.info('Searching Upwork jobs', { filter: Object.keys(filter) });

  const result = await callUpworkGraphQL(JOB_SEARCH_QUERY, variables);

  if (result.errors) {
    logger.error('Upwork GraphQL errors', result.errors);
    throw new Error(`Upwork API error: ${result.errors[0]?.message}`);
  }

  const edges = result.data?.marketplaceJobPostingsSearch?.edges || [];
  const totalCount = result.data?.marketplaceJobPostingsSearch?.totalCount || 0;

  logger.info(`Fetched ${edges.length} jobs (total: ${totalCount})`);

  return {
    jobs: edges.map((edge) => normalizeJob(edge.node)),
    totalCount,
    pageInfo: result.data?.marketplaceJobPostingsSearch?.pageInfo,
  };
}

// ── Filter Builder ───────────────────────────────────────────────

function buildSearchFilter(prefs) {
  const filter = {};

  if (prefs?.skills?.length) {
    filter.skillExpression_eq = prefs.skills.join(',');
  }

  if (prefs?.categories?.length) {
    filter.categoryIds_any = prefs.categories;
  }

  if (prefs?.subcategories?.length) {
    filter.subcategoryIds_any = prefs.subcategories;
  }

  if (prefs?.job_type) {
    filter.jobType_eq = prefs.job_type;
  }

  if (prefs?.experience_level) {
    filter.experienceLevel_eq = prefs.experience_level;
  }

  if (prefs?.budget_min != null || prefs?.budget_max != null) {
    filter.budgetRange_eq = {};
    if (prefs.budget_min != null) filter.budgetRange_eq.rangeStart = Number(prefs.budget_min);
    if (prefs.budget_max != null) filter.budgetRange_eq.rangeEnd = Number(prefs.budget_max);
  }

  if (prefs?.hourly_rate_min != null || prefs?.hourly_rate_max != null) {
    filter.hourlyRate_eq = {};
    if (prefs.hourly_rate_min != null) filter.hourlyRate_eq.rangeStart = Number(prefs.hourly_rate_min);
    if (prefs.hourly_rate_max != null) filter.hourlyRate_eq.rangeEnd = Number(prefs.hourly_rate_max);
  }

  if (prefs?.verified_payment_only) {
    filter.verifiedPaymentOnly_eq = true;
  }

  if (prefs?.locations?.length) {
    filter.locations_any = prefs.locations;
  }

  if (prefs?.engagement_type) {
    filter.workload_eq = prefs.engagement_type;
  }

  if (prefs?.proposal_min != null || prefs?.proposal_max != null) {
    filter.proposalRange_eq = {};
    if (prefs.proposal_min != null) filter.proposalRange_eq.rangeStart = Number(prefs.proposal_min);
    if (prefs.proposal_max != null) filter.proposalRange_eq.rangeEnd = Number(prefs.proposal_max);
  }

  if (prefs?.client_hires_min != null || prefs?.client_hires_max != null) {
    filter.clientHiresRange_eq = {};
    if (prefs.client_hires_min != null) filter.clientHiresRange_eq.rangeStart = Number(prefs.client_hires_min);
    if (prefs.client_hires_max != null) filter.clientHiresRange_eq.rangeEnd = Number(prefs.client_hires_max);
  }

  // Add free-text search from instructions
  if (prefs?.instructions) {
    // Extract key terms from instructions for search expression
    const terms = prefs.instructions.split(/\s+/).filter((t) => t.length > 3).slice(0, 5);
    if (terms.length) {
      filter.searchExpression_eq = terms.join(' ');
    }
  }

  return filter;
}

// ── Job Normalizer ───────────────────────────────────────────────

function normalizeJob(node) {
  const contractTerms = node.job?.contractTerms;
  const isFixed = contractTerms?.contractType === 'FIXED';

  let budgetMin = null;
  let budgetMax = null;
  let hourlyMin = null;
  let hourlyMax = null;

  if (isFixed && contractTerms?.fixedPriceContractTerms) {
    budgetMin = parseMoneyValue(contractTerms.fixedPriceContractTerms.amount);
    budgetMax = parseMoneyValue(contractTerms.fixedPriceContractTerms.maxAmount) || budgetMin;
  } else {
    // Use the amount field or hourly budget fields
    budgetMin = parseMoneyValue(node.amount);
    budgetMax = budgetMin;
  }

  hourlyMin = parseMoneyValue(node.hourlyBudgetMin);
  hourlyMax = parseMoneyValue(node.hourlyBudgetMax);

  const client = node.client || {};

  return {
    id: node.ciphertext || node.id,
    title: node.title,
    description: node.description,
    budget_min: budgetMin,
    budget_max: budgetMax,
    hourly_min: hourlyMin,
    hourly_max: hourlyMax,
    client_name: null, // Not available in search
    client_country: client.location?.country || null,
    client_rating: client.totalFeedback || null,
    client_hires: client.totalHires || 0,
    client_total_spent: client.totalSpent?.displayValue || null,
    client_payment_verified: client.verificationStatus === 'VERIFIED',
    proposal_count: node.totalApplicants || 0,
    job_type: contractTerms?.contractType || (isFixed ? 'FIXED' : 'HOURLY'),
    experience_level: node.experienceLevel || contractTerms?.experienceLevel || null,
    skills: (node.skills || []).map((s) => s.prettyName || s.name),
    category: node.category || null,
    subcategory: node.subcategory || null,
    duration: node.durationLabel || node.duration || null,
    engagement: node.engagement || null,
    ciphertext: node.ciphertext || null,
    posted_at: node.publishedDateTime || node.createdDateTime || null,
    expires_at: null,
    source_hash: hashObject({ id: node.id, title: node.title, description: node.description?.slice(0, 100) }),
    is_active: true,
  };
}
