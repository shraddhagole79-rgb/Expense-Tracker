import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconInvestment, IconBudget } from './Icons';

export default function MobileHeader() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="mobile-header">
      <div className="mobile-header-left">
        <div className="mobile-app-icon">₹</div>
        <div className="mobile-header-titles">
          <span className="mobile-app-name">FinTrack</span>
          <span className="mobile-greeting">
            {user?.username ? `Hi, ${user.username.split(' ')[0]}` : 'Welcome'}
          </span>
        </div>
      </div>

      <div className="mobile-header-right">
        <button
          type="button"
          className="mobile-avatar-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle user menu"
        >
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-dropdown-menu" onClick={() => setMenuOpen(false)}>
          <div className="dropdown-user-info">
            <span className="dropdown-user-name">{user?.username || 'User'}</span>
            <span className="dropdown-user-email">{user?.email || ''}</span>
          </div>
          <div className="dropdown-divider"></div>
          <NavLink to="/investments" className="dropdown-item">
            <IconInvestment size={16} />
            <span>Investments</span>
          </NavLink>
          <NavLink to="/budgets" className="dropdown-item">
            <IconBudget size={16} />
            <span>Budgets</span>
          </NavLink>
          <div className="dropdown-divider"></div>
          <button type="button" className="dropdown-item logout" onClick={handleLogout}>
            Exit / Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
