import { useState, useEffect } from 'react';
import { useJobs, useRunPipeline } from '../hooks/useJobs.js';
import { useSearches } from '../hooks/useSearches.js';
import JobCard from '../components/JobCard.jsx';

function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function Dashboard() {
  const [sort, setSort] = useState('score');
  const [tab, setTab] = useState('active');
  const [selectedSearchId, setSelectedSearchId] = useState(null);

  const { data: searchesData, isLoading: isSearchesLoading } = useSearches();
  const searches = searchesData || [];

  useEffect(() => {
    if (!selectedSearchId && searches.length > 0) {
      setSelectedSearchId(searches[0].id);
    }
  }, [searches, selectedSearchId]);

  const { data, isLoading, error, dataUpdatedAt } = useJobs({ sort, limit: 30, searchId: selectedSearchId });
  const pipeline = useRunPipeline();

  const jobs = data?.jobs || [];
  const stats = data?.stats || {};

  const handleRefresh = () => {
    pipeline.mutate();
  };

  return (
    <>
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <div className="last-updated">
            {dataUpdatedAt ? `Last updated ${timeAgo(new Date(dataUpdatedAt).toISOString())}` : 'Loading...'}
            <button
              className={`refresh-btn ${pipeline.isPending ? 'spinning' : ''}`}
              onClick={handleRefresh}
              disabled={pipeline.isPending}
              title="Refresh jobs"
            >
              🔄
            </button>
          </div>

          <div className="header-nav">
            <a href="#" className={tab === 'active' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('active'); }}>
              Active Feed
            </a>
            <a href="#" className={tab === 'history' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('history'); }}>
              History
            </a>
          </div>
        </div>

        <div className="header-right">
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>
            U
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="page-body">
        {/* Main Feed */}
        <div className="page-main">
          
          {/* Saved Searches Tabs */}
          <div className="sort-tabs" style={{ marginBottom: '24px', overflowX: 'auto', borderBottom: '2px solid var(--gray-800)' }}>
            {searches.map(s => (
              <button 
                key={s.id}
                className={`sort-tab ${selectedSearchId === s.id ? 'active' : ''}`} 
                onClick={() => setSelectedSearchId(s.id)}
                style={{ fontSize: '15px', fontWeight: 600, padding: '12px 20px', whiteSpace: 'nowrap' }}
              >
                {s.name}
              </button>
            ))}
            {searches.length === 0 && !isSearchesLoading && (
               <div style={{ padding: '12px', color: 'var(--text-secondary)' }}>No saved searches found.</div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Jobs for {searches.find(s => s.id === selectedSearchId)?.name || '...'}</h2>
            
            {/* Sort Tabs */}
            <div className="sort-tabs" style={{ margin: 0 }}>
              <button className={`sort-tab ${sort === 'score' ? 'active' : ''}`} onClick={() => setSort('score')}>
                Best match
              </button>
              <button className={`sort-tab ${sort === 'recency' ? 'active' : ''}`} onClick={() => setSort('recency')}>
                Most recent
              </button>
              <button className={`sort-tab ${sort === 'proposals' ? 'active' : ''}`} onClick={() => setSort('proposals')}>
                Lowest proposals
              </button>
            </div>
          </div>

          {/* Loading / Error States */}
          {isLoading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}

          {error && (
            <div className="empty-state">
              <div className="empty-icon">⚠️</div>
              <h3>Error loading jobs</h3>
              <p>{error.message}</p>
              <button className="btn btn-primary" onClick={handleRefresh}>Retry</button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && jobs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No jobs found yet</h3>
              <p>Set your preferences and fetch jobs to get started.</p>
              <button className="btn btn-primary" onClick={handleRefresh} disabled={pipeline.isPending}>
                {pipeline.isPending ? 'Fetching...' : 'Fetch Jobs Now'}
              </button>
            </div>
          )}

          {/* Job Cards */}
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} searchId={selectedSearchId} />
          ))}

          {pipeline.isSuccess && (
            <div style={{ textAlign: 'center', padding: '12px', color: 'var(--success)', fontSize: '14px' }}>
              ✅ Pipeline complete! Fetched {pipeline.data?.fetched || 0} jobs, scored {pipeline.data?.scored || 0}.
            </div>
          )}
        </div>

        {/* Right Sidebar - Curator Stats */}
        <div className="page-aside">
          <div className="stats-panel">
            <div className="stats-panel-title">Curator Stats</div>

            <div className="stat-big">
              <div className="stat-desc">Jobs Scanned Today</div>
              <div className="stat-number">{stats.totalJobsScanned?.toLocaleString() || '0'}</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: `${Math.min((stats.totalJobsScanned || 0) / 20, 100)}%` }}></div>
              </div>
            </div>

            <div className="stat-big">
              <div className="stat-desc">High Match Alerts</div>
              <div className="stat-number">{stats.highMatchAlerts || '0'}</div>
              <div className="stat-desc" style={{ marginTop: '4px' }}>
                Recommended actions for current hour based on proposal velocity.
              </div>
            </div>
          </div>

          <div className="stats-panel">
            <div className="stats-panel-title" style={{ marginBottom: '8px' }}>Refine Curator Intelligence</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Our AI learns from your "Mark Good" and "Mark Bad" actions to fine-tune match scores.
            </p>
            {/* <a href="/preferences" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              View Training Logic
            </a> */}
          </div>

          <div className="stats-panel" style={{ background: 'var(--gray-900)', color: 'white' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', opacity: 0.6 }}>Pro Tip</div>
            <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
              Clients with <strong>"Verified Payment"</strong> are 4x more likely to hire within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
