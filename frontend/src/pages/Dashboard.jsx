import { useState, useEffect, useRef } from 'react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            {/* Custom Dropdown for Saved Searches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text-secondary)', fontWeight: 500 }}>Jobs for</h2>
              
              <div className="search-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    background: dropdownOpen ? 'var(--bg-hover)' : 'transparent',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => { if(!dropdownOpen) e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={(e) => { if(!dropdownOpen) e.currentTarget.style.background = 'transparent' }}
                >
                  {searches.find(s => s.id === selectedSearchId)?.name || 'Select a Profile'}
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </button>
                
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: '220px',
                    zIndex: 100,
                    overflow: 'hidden'
                  }}>
                    {searches.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedSearchId(s.id);
                          setDropdownOpen(false);
                        }}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          fontSize: '15px',
                          fontWeight: selectedSearchId === s.id ? 600 : 500,
                          color: selectedSearchId === s.id ? 'var(--primary-600)' : 'var(--text-secondary)',
                          background: selectedSearchId === s.id ? 'var(--primary-50)' : 'transparent',
                          transition: 'background 0.15s, color 0.15s'
                        }}
                        onMouseEnter={(e) => { if(selectedSearchId !== s.id) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                        onMouseLeave={(e) => { if(selectedSearchId !== s.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                      >
                        {s.name}
                      </div>
                    ))}
                    {searches.length === 0 && !isSearchesLoading && (
                      <div style={{ padding: '12px 16px', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                        No saved searches
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
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
