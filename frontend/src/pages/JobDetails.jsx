import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useJobDetail, useGenerateProposal, useRefreshJob } from '../hooks/useJobs.js';
import ScoreBadge from '../components/ScoreBadge.jsx';
import FeedbackButtons from '../components/FeedbackButtons.jsx';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatBudget(job) {
  if (job.job_type === 'HOURLY' || job.hourly_min || job.hourly_max) {
    const min = job.hourly_min ? `$${job.hourly_min}` : '';
    const max = job.hourly_max ? `$${job.hourly_max}` : '';
    if (min && max) return `${min} - ${max} / hr`;
    return `${min || max} / hr`;
  }
  const min = job.budget_min ? `$${Number(job.budget_min).toLocaleString()}` : '';
  const max = job.budget_max ? `$${Number(job.budget_max).toLocaleString()}` : '';
  if (min && max && min !== max) return `${min} - ${max}`;
  return min || max || 'Not specified';
}

function getRiskLabel(risk) {
  if (risk == null) return 'Unknown';
  if (risk <= 30) return `Low (${Math.round(risk)}%)`;
  if (risk <= 60) return `Medium (${Math.round(risk)}%)`;
  return `High (${Math.round(risk)}%)`;
}

function generateInsights(job) {
  const pros = [];
  const cons = [];

  if (job.budget_max && job.budget_max >= 5000) pros.push('High Budget Opportunity');
  else if (job.hourly_max && job.hourly_max >= 80) pros.push('High Hourly Rate');

  if (job.proposal_count < 10) pros.push(`Low Competition (${job.proposal_count} applied)`);
  if (job.duration && (job.duration.includes('month') || job.duration.includes('year'))) pros.push('Long-term Potential');
  if (job.client_payment_verified) pros.push('Verified Payment Method');
  if (job.client_hires >= 20) pros.push('Experienced Client');

  if (!job.client_payment_verified) cons.push('Unverified Payment');
  if (job.proposal_count >= 50) cons.push('High Competition');
  if (job.client_hires === 0) cons.push('New Client (No hire history)');
  if (job.risk_score && job.risk_score > 50) cons.push('Elevated Risk Score');

  return { pros: pros.slice(0, 4), cons: cons.slice(0, 3) };
}

export default function JobDetails() {
  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchId = searchParams.get('searchId');

  const navigate = useNavigate();
  const { data: job, isLoading, error } = useJobDetail(id, searchId);
  const proposalMutation = useGenerateProposal(searchId);
  const refreshMutation = useRefreshJob(searchId);
  const [proposal, setProposal] = useState(null);
  const [copied, setCopied] = useState(false);

  if (isLoading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (error) return <div className="empty-state"><h3>Error: {error.message}</h3></div>;
  if (!job) return <div className="empty-state"><h3>Job not found</h3></div>;

  const insights = generateInsights(job);
  const upworkUrl = job.ciphertext
    ? `https://www.upwork.com/jobs/${job.ciphertext}`
    : `https://www.upwork.com/jobs/${job.id}`;

  const handleGenerateProposal = async () => {
    const result = await proposalMutation.mutateAsync(id);
    setProposal(result.proposal);
  };

  const handleCopy = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back to Feed</button>
          <div className="header-nav">
            <a href="/">Jobs</a>
            <a href="/preferences">Preferences</a>
          </div>
        </div>
        <div className="header-right">
          <div className="last-updated">Last updated {timeAgo(job.scored_at)}</div>
        </div>
      </header>

      {/* Body */}
      <div className="page-body">
        {/* Main Content */}
        <div className="page-main" style={{ maxWidth: '700px' }}>
          {/* Header Block */}
          <div className="detail-header">
            <div className="detail-category">
              {job.category && <span className="cat-badge">{job.category}</span>}
              <span style={{ color: 'var(--text-tertiary)' }}>• Posted {timeAgo(job.posted_at)}</span>
            </div>

            <h1 className="detail-title">{job.title}</h1>

            <div className="detail-meta">
              <div className="detail-meta-item">
                💰 {formatBudget(job)}
              </div>
              {job.engagement && (
                <div className="detail-meta-item">
                  ⏱️ {job.engagement}
                </div>
              )}
              {job.duration && (
                <div className="detail-meta-item">
                  📅 {job.duration}
                </div>
              )}
              {job.client_country && (
                <div className="detail-meta-item">
                  📍 {job.client_country}
                </div>
              )}
            </div>

            <div className="detail-actions-row">
              <FeedbackButtons jobId={job.id} currentFeedback={job.feedback} />
              <a href={upworkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Open on Upwork ↗
              </a>
              <button
                className="btn btn-secondary"
                onClick={() => refreshMutation.mutate(id)}
                disabled={refreshMutation.isPending}
              >
                {refreshMutation.isPending ? 'Refreshing...' : '🔄 Re-score'}
              </button>
            </div>
          </div>

          {/* Job Overview */}
          <div className="detail-section">
            <h2 className="detail-section-title">Job Overview</h2>
            <div className="detail-description">
              {job.description?.split('\n').map((line, i) => (
                <p key={i} style={{ marginBottom: line.trim() ? '8px' : '4px' }}>{line}</p>
              ))}
            </div>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {job.skills.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>
            )}
          </div>

          {/* Client Information */}
          <div className="detail-section">
            <h2 className="detail-section-title">Client Information</h2>
            <div className="client-info-grid">
              <span className="client-info-label">Payment Status</span>
              <span className="client-info-value">
                {job.client_payment_verified ? '✅ Verified' : '🔴 Unverified'}
              </span>

              <span className="client-info-label">Location</span>
              <span className="client-info-value">{job.client_country || 'Unknown'}</span>

              <span className="client-info-label">Total Spent</span>
              <span className="client-info-value">{job.client_total_spent || 'Unknown'}</span>

              <span className="client-info-label">Hire Rate</span>
              <span className="client-info-value">
                {job.client_hires ? `${job.client_hires} hires` : 'No hires yet'}
              </span>

              {job.client_rating && (
                <>
                  <span className="client-info-label">Rating</span>
                  <span className="client-info-value">
                    {'⭐'.repeat(Math.round(job.client_rating))} {Number(job.client_rating).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Proposal Section */}
          <div className="proposal-section">
            <div className="proposal-header">
              <h2 className="proposal-title">
                ✏️ Proposal Draft
              </h2>
              {proposal && <span className="proposal-badge">AI Generated Draft</span>}
            </div>

            {!proposal && !proposalMutation.isPending && (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                  Generate a tailored AI proposal for this job.
                </p>
                <button className="btn btn-primary btn-lg" onClick={handleGenerateProposal}>
                  ✨ Generate Proposal
                </button>
              </div>
            )}

            {proposalMutation.isPending && (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            )}

            {proposal && (
              <>
                <div className="proposal-body">{proposal}</div>
                <div className="proposal-actions">
                  <button className="btn btn-secondary" onClick={() => setProposal(null)}>
                    ✏️ Re-generate
                  </button>
                  <button className="btn btn-primary" onClick={handleCopy}>
                    {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
                  </button>
                </div>
              </>
            )}

            {proposalMutation.isError && (
              <p style={{ color: 'var(--danger)', textAlign: 'center', padding: '16px' }}>
                Failed to generate proposal. Please try again.
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="page-aside">
          {/* Score Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <ScoreBadge score={job.score} size="lg" />
          </div>

          {/* AI Fit Analysis */}
          <div className="fit-analysis" style={{ marginBottom: '16px' }}>
            <h3 className="fit-analysis-title">🧠 AI Fit Analysis</h3>

            <div className="fit-bar">
              <div className="fit-bar-header">
                <span className="fit-bar-label">Skills Match</span>
                <span className="fit-bar-value">{Math.round(job.skill_match_score || 0)}%</span>
              </div>
              <div className="fit-bar-track">
                <div className="fit-bar-fill fill-blue" style={{ width: `${job.skill_match_score || 0}%` }}></div>
              </div>
            </div>

            <div className="fit-bar">
              <div className="fit-bar-header">
                <span className="fit-bar-label">Budget Match</span>
                <span className="fit-bar-value">{Math.round(job.budget_match_score || 0)}%</span>
              </div>
              <div className="fit-bar-track">
                <div className="fit-bar-fill fill-blue" style={{ width: `${job.budget_match_score || 0}%` }}></div>
              </div>
            </div>

            <div className="fit-bar">
              <div className="fit-bar-header">
                <span className="fit-bar-label">Risk Score</span>
                <span className="fit-bar-value">{getRiskLabel(job.risk_score)}</span>
              </div>
              <div className="fit-bar-track">
                <div className="fit-bar-fill fill-red" style={{ width: `${job.risk_score || 0}%` }}></div>
              </div>
            </div>

            {job.reasoning && (
              <div className="fit-insights">
                <div className="fit-insight-item">
                  <span className="insight-icon">✨</span>
                  <span>{job.reasoning}</span>
                </div>
              </div>
            )}
          </div>

          {/* Strategic Insights */}
          <div className="insights-card">
            <h3 className="insights-card-title">Strategic Insights</h3>

            {insights.pros.length > 0 && (
              <>
                <div className="insights-group-label pros">The Pros</div>
                {insights.pros.map((pro, i) => (
                  <div key={i} className="insight-item">
                    <span className="plus">+</span>
                    <span>{pro}</span>
                  </div>
                ))}
              </>
            )}

            {insights.cons.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div className="insights-group-label cons">The Cons</div>
                {insights.cons.map((con, i) => (
                  <div key={i} className="insight-item">
                    <span className="minus">−</span>
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
