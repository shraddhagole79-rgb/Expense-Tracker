import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconDashboard,
  IconExpense,
  IconIncome,
  IconSavings,
  IconBudget,
  IconInvestment,
} from './Icons';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/', icon: <IconDashboard size={19} />, label: 'Dashboard' },
    { to: '/expenses', icon: <IconExpense size={19} />, label: 'Expenses' },
    { to: '/income', icon: <IconIncome size={19} />, label: 'Income' },
    { to: '/savings', icon: <IconSavings size={19} />, label: 'Savings' },
    { to: '/budgets', icon: <IconBudget size={19} />, label: 'Budgets' },
    { to: '/investments', icon: <IconInvestment size={19} />, label: 'Investments' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">₹</div>
          <span className="sidebar-logo-text">FinTrack</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="icon" style={{ display: 'flex', alignItems: 'center' }}>
              {link.icon}
            </span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
          <div className="user-meta">
            <span className="user-name">{user?.username || 'User'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>
        <button type="button" className="btn-logout" onClick={handleLogout} title="Sign Out">
          Exit
        </button>
      </div>
    </aside>
  );
}
