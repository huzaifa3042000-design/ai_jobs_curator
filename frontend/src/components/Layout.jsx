import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const isPrefs = location.pathname === '/preferences';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Editorial Intelligence</h1>
          <p>AI Job Curator</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `sidebar-nav-item ${isActive && !isPrefs ? 'active' : ''}`} end>
            <span className="nav-icon">🏠</span>
            Jobs
          </NavLink>
          <NavLink to="/preferences" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">⚙️</span>
            Preferences
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/preferences" className="sidebar-nav-item">
            <span className="nav-icon">❓</span>
            Help
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
