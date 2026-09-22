import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/expenses', icon: '💸', label: 'Expenses' },
    { to: '/income', icon: '💰', label: 'Income' },
    { to: '/savings', icon: '🎯', label: 'Savings' },
    { to: '/budgets', icon: '📋', label: 'Budgets' },
    { to: '/investments', icon: '📈', label: 'Investments' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">💎 FinTrack</h2>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
          <span className="sidebar-username">{user?.username}</span>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
