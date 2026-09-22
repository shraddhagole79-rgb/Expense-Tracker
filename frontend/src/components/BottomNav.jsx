import { NavLink } from 'react-router-dom';
import {
  IconDashboard,
  IconExpense,
  IconIncome,
  IconSavings,
  IconBudget,
} from './Icons';

export default function BottomNav() {
  const tabs = [
    { to: '/', icon: <IconDashboard size={20} />, label: 'Home' },
    { to: '/expenses', icon: <IconExpense size={20} />, label: 'Expenses' },
    { to: '/income', icon: <IconIncome size={20} />, label: 'Income' },
    { to: '/savings', icon: <IconSavings size={20} />, label: 'Savings' },
    { to: '/budgets', icon: <IconBudget size={20} />, label: 'Budgets' },
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon" style={{ display: 'flex', alignItems: 'center' }}>
              {tab.icon}
            </span>
            <span className="tab-label">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
