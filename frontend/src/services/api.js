const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API Error: ${res.status}`);
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────
export const getAuthUrl = () => request('/auth/url');
export const getMe = () => request('/me');

// ── Jobs ─────────────────────────────────────────────────────────
export const getJobs = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/jobs?${qs}`);
};

export const getJobById = (id) => request(`/jobs/${encodeURIComponent(id)}`);

export const fetchJobs = () => request('/jobs/fetch', { method: 'POST' });

export const scoreJobs = (batch = 5) =>
  request(`/jobs/score?batch=${batch}`, { method: 'POST' });

export const runPipeline = () => request('/jobs/pipeline', { method: 'POST' });

export const refreshJob = (id, searchId) =>
  request(`/jobs/${encodeURIComponent(id)}/refresh`, {
    method: 'POST',
    body: JSON.stringify({ searchId }),
  });

export const generateProposal = (id, searchId) =>
  request(`/jobs/${encodeURIComponent(id)}/proposal`, {
    method: 'POST',
    body: JSON.stringify({ searchId }),
  });

// ── Feedback ─────────────────────────────────────────────────────
export const submitFeedback = (jobId, feedback, note = null) =>
  request(`/jobs/${encodeURIComponent(jobId)}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ feedback, note }),
  });

// ── Saved Searches ───────────────────────────────────────────────
export const getSearches = () => request('/searches');

export const updateSearch = (search) =>
  request('/searches', {
    method: 'POST',
    body: JSON.stringify(search),
  });

export const deleteSearch = (id) =>
  request(`/searches/${id}`, { method: 'DELETE' });

// ── Stats ────────────────────────────────────────────────────────
export const getStats = () => request('/jobs/stats');
