import { useNavigate } from 'react-router-dom';
import ScoreBadge from './ScoreBadge.jsx';
import FeedbackButtons from './FeedbackButtons.jsx';

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

export default function JobCard({ job, searchId }) {
  const navigate = useNavigate();
  const proposalCount = job.proposal_count || 0;
  const isHighProposals = proposalCount >= 50;
  const isLowProposals = proposalCount < 5;
  const isUnverified = job.client_payment_verified === false;

  const upworkUrl = job.ciphertext
    ? `https://www.upwork.com/jobs/${job.ciphertext}`
    : `https://www.upwork.com/jobs/${job.id}`;

  return (
    <div className="job-card" id={`job-${job.id}`}>
      <div className="job-card-top">
        <div className="job-card-info">
          {/* Title */}
          <div className="job-card-title">
            {job.title}
            <span className={`type-badge ${job.job_type === 'HOURLY' ? 'type-badge-hourly' : 'type-badge-fixed'}`}>
              {job.job_type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}
            </span>
          </div>

          {/* Meta: client info */}
          <div className="job-card-meta">
            {job.client_payment_verified ? (
              <span className="client-badge verified">
                <span className="badge-icon">✅</span> Client Verified
              </span>
            ) : (
              <span className="client-badge unverified">
                <span className="badge-icon">🔴</span> Unverified Payment
              </span>
            )}
            {job.client_country && (
              <span className="client-badge">
                <span className="badge-icon">📍</span> {job.client_country}
              </span>
            )}
            {job.client_rating && (
              <span className="client-badge">
                <span className="badge-icon">⭐</span> {Number(job.client_rating).toFixed(1)}
              </span>
            )}
            <span className="client-badge">
              <span className="badge-icon">🕐</span> Posted {timeAgo(job.posted_at)}
            </span>
          </div>

          {/* Alert Badges */}
          <div className="job-card-alerts">
            {isHighProposals && (
              <span className="alert-badge alert-badge-warning">
                ⚠️ High proposals ({proposalCount}+)
              </span>
            )}
            {isLowProposals && proposalCount > 0 && (
              <span className="alert-badge alert-badge-success">
                ✨ Low competition
              </span>
            )}
            {isUnverified && (
              <span className="alert-badge alert-badge-danger">
                🔴 Unverified Payment
              </span>
            )}
          </div>

          {/* AI Reasoning */}
          {job.reasoning && (
            <div className="ai-reasoning">
              <div className="ai-reasoning-header">
                🤖 AI Reasoning
              </div>
              <p>{job.reasoning}</p>
            </div>
          )}

          {/* Description */}
          {!job.reasoning && job.description && (
            <p className="job-card-description">{job.description}</p>
          )}

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="job-card-skills">
              {job.skills.slice(0, 6).map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
              {job.skills.length > 6 && (
                <span className="skill-tag">+{job.skills.length - 6}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="job-card-actions">
            <div className="job-card-actions-left">
              <a
                href={upworkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                ✏️ Open on Upwork
              </a>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/jobs/${encodeURIComponent(job.id)}${searchId ? `?searchId=${searchId}` : ''}`)}
              >
                View Details
              </button>
            </div>
            <FeedbackButtons jobId={job.id} currentFeedback={job.feedback} />
          </div>
        </div>

        {/* Right column: Score + Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <ScoreBadge score={job.score} />
          <div className="job-card-stats">
            <div className="stats-box">
              <div className="stat-row">
                <span className="stat-label">Budget:</span>
                <span className="stat-value">{formatBudget(job)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Proposals:</span>
                <span className={`stat-value ${isHighProposals ? 'text-danger' : isLowProposals ? 'text-success' : ''}`}>
                  {proposalCount < 5 ? 'Less than 5' : proposalCount >= 50 ? '50 or more' : proposalCount}
                </span>
              </div>
              {job.client_total_spent && (
                <div className="stat-row">
                  <span className="stat-label">Client Spend:</span>
                  <span className="stat-value">{job.client_total_spent}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
