import { useState, useEffect } from 'react';
import { useSearches, useUpdateSearch, useDeleteSearch, useImproveSkills } from '../hooks/useSearches.js';
import { useRunPipeline } from '../hooks/useJobs.js';

function CollapsibleSection({ icon, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="prefs-section">
      <div className="prefs-section-header" onClick={() => setOpen(!open)}>
        <h2>
          <span className="section-icon">{icon}</span>
          {title}
        </h2>
        <span className={`chevron ${open ? 'open' : ''}`}>▼</span>
      </div>
      {open && <div className="prefs-section-body">{children}</div>}
    </div>
  );
}

export default function Preferences() {
  const { data: searches, isLoading } = useSearches();
  const updateSearch = useUpdateSearch();
  const deleteSearch = useDeleteSearch();
  const improveSkills = useImproveSkills();
  const pipeline = useRunPipeline();

  const [activeSearchId, setActiveSearchId] = useState('new');
  const [suggestedSkills, setSuggestedSkills] = useState([]);

  const defaultForm = {
    name: 'New Search',
    skills: [],
    instructions: '',
    job_type: '',
    experience_level: '',
    budget_min: 1000,
    budget_max: 10000,
    hourly_rate_min: 50,
    hourly_rate_max: 150,
    client_hires_min: null,
    verified_payment_only: false,
    weight_high_budget: 1,
    weight_low_competition: 1,
    weight_client_quality: 1,
    weight_long_term: 1,
    risk_tolerance: 2,
    categories: [],
  };

  const [form, setForm] = useState(defaultForm);

  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const handleImproveSkills = async () => {
  try {
    const data = await improveSkills.mutateAsync({
      profileName: form.name,
      currentSkills: form.skills,
    });

    const filtered = (data.suggestedSkills || []).filter(
      (s) => !form.skills.includes(s)
    );

    setSuggestedSkills(filtered);

  } catch (err) {
    console.error(err);
    alert(err.message || 'AI failed to suggest skills');
  }
};

  useEffect(() => {
    if (searches && searches.length > 0 && activeSearchId === 'new' && !form.id && form.name === 'New Search') {
       // if we just loaded, default to the first one instead of 'new' unless there were none
       setActiveSearchId(searches[0].id);
    }
  }, [searches]);

  useEffect(() => {
    if (activeSearchId === 'new') {
      setForm(defaultForm);
    } else if (searches) {
      const target = searches.find(s => s.id === activeSearchId);
      if (target) {
        setForm({ ...defaultForm, ...target, skills: target.skills || [] });
      }
    }
  }, [activeSearchId, searches]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !form.skills.includes(skill)) {
      handleChange('skills', [...form.skills, skill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    handleChange('skills', form.skills.filter((s) => s !== skill));
  };

  const handleSave = async () => {
    const saved = await updateSearch.mutateAsync(form);
    if (activeSearchId === 'new' && saved?.id) {
       setActiveSearchId(saved.id);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (confirm('Delete this saved search?')) {
      await deleteSearch.mutateAsync(activeSearchId);
      setActiveSearchId('new');
    }
  };

  const handleApplyAndRefresh = async () => {
    await updateSearch.mutateAsync(form);
    pipeline.mutate();
  };

  if (isLoading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <div className="header-nav">
            <a href="/">Jobs</a>
            <a href="/preferences" className="active">Preferences</a>
          </div>
        </div>
        <div className="header-right">
          <div className="last-updated">Configure your intelligence</div>
        </div>
      </header>

      <div className="page-body">
        {/* Sidebar */}
        <div className="page-aside" style={{ flex: '0 0 250px' }}>
          <div className="stats-panel">
            <div className="stats-panel-title">Saved Searches</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {(searches || []).map(s => (
                <button
                  key={s.id}
                  className={`btn ${activeSearchId === s.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => setActiveSearchId(s.id)}
                >
                  {s.name}
                </button>
              ))}
              <hr style={{ borderColor: 'var(--gray-800)', margin: '8px 0' }} />
              <button
                className={`btn ${activeSearchId === 'new' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'center' }}
                onClick={() => setActiveSearchId('new')}
              >
                + Create New Search
              </button>
            </div>
          </div>
        </div>

        <div className="page-main" style={{ maxWidth: '750px' }}>
          {/* Title */}
          <div className="prefs-header">
            {activeSearchId === 'new' ? (
              <h1>Create Intelligence Customization</h1>
            ) : (
              <h1>Refine '{form.name}'</h1>
            )}
            <p>Configure how Curator AI identifies and prioritizes opportunities for this profile.</p>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Search Profile Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. React High Value"
                value={form.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{ fontSize: '16px', fontWeight: 'bold' }}
              />
            </div>
          </div>

          {/* Skills & Keywords */}
          <CollapsibleSection icon="🎯" title="Skills & Keywords" defaultOpen={true}>
            <div className="form-group">
              <label className="form-label">Core Expertise</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {form.skills.map((skill) => (
                  <span key={skill} className="skill-tag skill-tag-primary skill-tag-removable" onClick={() => removeSkill(skill)}>
                    {skill}
                    <span className="remove-btn">×</span>
                  </span>
                ))}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    style={{ width: '140px', padding: '4px 12px', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {suggestedSkills.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <label className="form-label">AI Suggestions</label>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {suggestedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="skill-tag skill-tag-secondary skill-tag-removable"
                      onClick={() =>
                        setSuggestedSkills((prev) => prev.filter((s) => s !== skill))
                      }
                    >
                      {skill}
                      <span className="remove-btn">×</span>
                    </span>
                  ))}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ marginTop: '8px' }}
                  onClick={() => {
                    handleChange('skills', [...form.skills, ...suggestedSkills]);
                    setSuggestedSkills([]);
                  }}
                >
                  ➕ Add Selected Skills
                </button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Editorial Intent (Free-form)</label>
              <textarea
                className="form-input form-textarea"
                placeholder="e.g., Prefer SaaS, long-term clients, avoid crypto-related projects..."
                value={form.instructions || ''}
                onChange={(e) => handleChange('instructions', e.target.value)}
              />
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleImproveSkills}
              disabled={improveSkills.isPending}
              style={{ marginTop: '8px' }}
            >
              {improveSkills.isPending ? 'Improving...' : '✨ Improve with AI'}
            </button>
          </CollapsibleSection>

          {/* Core Job Filters */}
          <CollapsibleSection icon="🔽" title="Core Job Filters" defaultOpen={true}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Job Type */}
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <div className="toggle-group">
                  <button
                    className={`toggle-btn ${form.job_type === 'HOURLY' ? 'active' : ''}`}
                    onClick={() => handleChange('job_type', form.job_type === 'HOURLY' ? '' : 'HOURLY')}
                  >
                    Hourly
                  </button>
                  <button
                    className={`toggle-btn ${form.job_type === 'FIXED' ? 'active' : ''}`}
                    onClick={() => handleChange('job_type', form.job_type === 'FIXED' ? '' : 'FIXED')}
                  >
                    Fixed Price
                  </button>
                </div>
              </div>

              {/* Experience Level */}
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <div className="segmented-control">
                  {['ENTRY_LEVEL', 'INTERMEDIATE', 'EXPERT'].map((lvl) => (
                    <button
                      key={lvl}
                      className={`segment ${form.experience_level === lvl ? 'active' : ''}`}
                      onClick={() => handleChange('experience_level', form.experience_level === lvl ? '' : lvl)}
                    >
                      {lvl === 'ENTRY_LEVEL' ? 'Entry' : lvl === 'INTERMEDIATE' ? 'Intermediate' : 'Expert'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Range */}
            <div className="form-group">
              <div className="range-header">
                <label className="form-label" style={{ marginBottom: 0 }}>Budget Range ($)</label>
                <span className="range-value">${(form.budget_min || 0).toLocaleString()} - ${(form.budget_max || 10000).toLocaleString()}{form.budget_max >= 10000 ? '+' : ''}</span>
              </div>
              <div className="range-slider" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={form.budget_min || 0}
                  onChange={(e) => handleChange('budget_min', Number(e.target.value))}
                />
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={form.budget_max || 10000}
                  onChange={(e) => handleChange('budget_max', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="form-group">
              <div className="range-header">
                <label className="form-label" style={{ marginBottom: 0 }}>Hourly Rate ($)</label>
                <span className="range-value">${form.hourly_rate_min || 0} - ${form.hourly_rate_max || 150}/hr</span>
              </div>
              <div className="range-slider" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="5"
                  value={form.hourly_rate_min || 0}
                  onChange={(e) => handleChange('hourly_rate_min', Number(e.target.value))}
                />
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="5"
                  value={form.hourly_rate_max || 150}
                  onChange={(e) => handleChange('hourly_rate_max', Number(e.target.value))}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Client Criteria */}
          <CollapsibleSection icon="🛡️" title="Client Criteria">
            <div className="form-group">
              <label className="form-label">Minimum Client Hires</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 5"
                value={form.client_hires_min || ''}
                onChange={(e) => handleChange('client_hires_min', e.target.value ? Number(e.target.value) : null)}
                style={{ maxWidth: '200px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.verified_payment_only}
                  onChange={(e) => handleChange('verified_payment_only', e.target.checked)}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Verified Payment Only</span>
              </label>
            </div>
          </CollapsibleSection>

          {/* Scoring Intelligence */}
          <CollapsibleSection icon="✨" title="Scoring Intelligence">
            {[
              { key: 'weight_high_budget', label: 'High Budget Priority' },
              { key: 'weight_low_competition', label: 'Low Competition Priority' },
              { key: 'weight_client_quality', label: 'Client Quality Priority' },
              { key: 'weight_long_term', label: 'Long-term Priority' },
            ].map(({ key, label }) => (
              <div className="form-group" key={key}>
                <div className="range-header">
                  <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
                  <span className="range-value">{form[key] || 1}</span>
                </div>
                <div className="range-slider">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={form[key] || 1}
                    onChange={(e) => handleChange(key, Number(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </CollapsibleSection>

          {/* Risk Tolerance */}
          <CollapsibleSection icon="🔒" title="Risk Tolerance">
            <div className="form-group">
              <div className="range-slider">
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={form.risk_tolerance || 2}
                  onChange={(e) => handleChange('risk_tolerance', Number(e.target.value))}
                />
              </div>
              <div className="risk-labels">
                <div className="risk-label">
                  <strong>Conservative</strong>
                  <span>Only proven clients</span>
                </div>
                <div className="risk-label">
                  <strong style={{ color: form.risk_tolerance === 2 ? 'var(--primary-600)' : undefined }}>Balanced</strong>
                  <span>Mixed portfolio</span>
                </div>
                <div className="risk-label">
                  <strong>Aggressive</strong>
                  <span>High risk moonshots</span>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Actions */}
          <div className="prefs-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
            {activeSearchId !== 'new' && (
              <button
                className="btn btn-ghost"
                onClick={handleDelete}
                disabled={deleteSearch.isPending}
                style={{ color: 'var(--danger)' }}
              >
                {deleteSearch.isPending ? 'Deleting...' : 'Delete Search'}
              </button>
            )}
            <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
              {activeSearchId !== 'new' && (
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={handleApplyAndRefresh}
                  disabled={pipeline.isPending || updateSearch.isPending}
                >
                  {pipeline.isPending ? 'Refreshing...' : 'Apply & Fetch Jobs'}
                </button>
              )}
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSave}
                disabled={updateSearch.isPending}
              >
                {saved ? '✅ Saved!' : updateSearch.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
