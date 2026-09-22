import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import QuickAddWidget from '../components/QuickAddWidget';
import {
  IconIncome,
  IconExpense,
  IconSavings,
  IconWallet,
  IconRefresh,
} from '../components/Icons';

// Clean curated light-theme chart colors (blue-anchored palette)
const COLORS = [
  '#2563eb', // royal blue
  '#3b82f6', // bright blue
  '#0284c7', // sky blue
  '#0d9488', // teal
  '#16a34a', // emerald
  '#d97706', // amber
  '#dc2626', // rose red
  '#7c3aed', // violet
  '#64748b', // slate
];

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    netBalance: 0,
  });
  const [recent, setRecent] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      // Use allSettled so one chart or endpoint doesn't fail the whole dashboard
      const results = await Promise.allSettled([
        API.get('/dashboard/summary'),
        API.get('/dashboard/recent'),
        API.get('/dashboard/charts/category-spending'),
        API.get('/dashboard/charts/income-vs-expense'),
        API.get('/dashboard/charts/daily-trend'),
      ]);

      if (results[0].status === 'fulfilled') {
        setSummary(results[0].value.data || { totalIncome: 0, totalExpenses: 0, totalSavings: 0, netBalance: 0 });
      }
      if (results[1].status === 'fulfilled') {
        setRecent(Array.isArray(results[1].value.data) ? results[1].value.data : []);
      }
      if (results[2].status === 'fulfilled') {
        setCategorySpending(Array.isArray(results[2].value.data) ? results[2].value.data : []);
      }
      if (results[3].status === 'fulfilled') {
        const ive = results[3].value.data;
        setIncomeVsExpense(ive?.data || (Array.isArray(ive) ? ive : []));
      }
      if (results[4].status === 'fulfilled') {
        setDailyTrend(Array.isArray(results[4].value.data) ? results[4].value.data : []);
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadDashboard();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Financial Overview</h1>
          <p className="page-subtitle">Track, budget, and optimize your personal wealth</p>
        </div>
        <button
          type="button"
          className="btn-refresh"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <IconRefresh size={14} className={isRefreshing ? 'spin' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-card-inner">
            <div className="summary-icon income-icon">
              <IconIncome size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Total Income</span>
              <span className="summary-value text-blue">{formatCurrency(summary.totalIncome)}</span>
            </div>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="summary-card-inner">
            <div className="summary-icon expense-icon">
              <IconExpense size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Total Expenses</span>
              <span className="summary-value">{formatCurrency(summary.totalExpenses)}</span>
            </div>
          </div>
        </div>

        <div className="summary-card savings">
          <div className="summary-card-inner">
            <div className="summary-icon savings-icon">
              <IconSavings size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Total Savings</span>
              <span className="summary-value">{formatCurrency(summary.totalSavings)}</span>
            </div>
          </div>
        </div>

        <div className="summary-card balance">
          <div className="summary-card-inner">
            <div className="summary-icon balance-icon">
              <IconWallet size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Net Balance</span>
              <span
                className={`summary-value ${
                  summary.netBalance >= 0 ? 'text-blue' : 'text-danger'
                }`}
              >
                {formatCurrency(summary.netBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Click Quick Entry Widget */}
      <QuickAddWidget onEntryAdded={loadDashboard} />

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Category Spending Donut */}
        <div className="card chart-card">
          <div className="card-header-clean">
            <h3>Spending by Category</h3>
            <span className="card-tag">Expenses</span>
          </div>
          {categorySpending.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categorySpending}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categorySpending.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      color: '#0f172a',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-legend">
                {categorySpending.map((cat, idx) => (
                  <div key={cat.category} className="legend-item">
                    <span
                      className="legend-color-dot"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="legend-name">{cat.category}</span>
                    <span className="legend-amt">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-chart-box">
              <p className="empty-text">No category spending data yet</p>
              <span className="empty-subtext">Use Quick Log above to add an expense</span>
            </div>
          )}
        </div>

        {/* Income vs Expenses Bar Chart */}
        <div className="card chart-card">
          <div className="card-header-clean">
            <h3>Income vs Expenses</h3>
            <span className="card-tag">Monthly</span>
          </div>
          {incomeVsExpense.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={incomeVsExpense} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="income" name="Income" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart-box">
              <p className="empty-text">No monthly comparison yet</p>
              <span className="empty-subtext">Will appear once transactions are logged</span>
            </div>
          )}
        </div>

        {/* Daily Spending Trend (30 Days) */}
        <div className="card chart-card full-width">
          <div className="card-header-clean">
            <h3>Daily Spending Velocity (Last 30 Days)</h3>
            <span className="card-tag">Daily Trend</span>
          </div>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={dailyTrend} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Spent"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart-box">
              <p className="empty-text">No daily spending recorded in the last 30 days</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card recent-transactions-card">
        <div className="card-header-clean">
          <h3>Recent Transactions</h3>
          <span className="card-tag">{recent.length} logged</span>
        </div>
        {recent.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="table-wrapper desktop-only">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title / Source</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t, i) => (
                    <tr key={`${t.type}-${t.id || i}`}>
                      <td>
                        <span className={`badge-pill badge-${t.type}`}>
                          {t.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="font-medium">{t.title}</td>
                      <td>
                        <span className="cat-chip">{t.category}</span>
                      </td>
                      <td className="text-secondary">{t.date}</td>
                      <td
                        style={{ textAlign: 'right' }}
                        className={`font-semibold ${
                          t.type === 'income' ? 'text-blue' : 'text-slate'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="mobile-cards-list mobile-only">
              {recent.map((t, i) => (
                <div key={`${t.type}-${t.id || i}`} className="mobile-item-card">
                  <div className="mobile-item-left">
                    <div className={`mobile-item-icon ${t.type}`}>
                      {t.type === 'income' ? <IconIncome size={18} /> : <IconExpense size={18} />}
                    </div>
                    <div className="mobile-item-details">
                      <span className="mobile-item-title">{t.title}</span>
                      <div className="mobile-item-sub">
                        <span className="cat-chip">{t.category}</span>
                        <span className="dot">•</span>
                        <span>{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mobile-item-right">
                    <span
                      className={`mobile-item-amount ${
                        t.type === 'income' ? 'text-blue' : 'text-slate'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-chart-box">
            <p className="empty-text">No transactions recorded yet</p>
            <span className="empty-subtext">Use the Quick Log above to start tracking!</span>
          </div>
        )}
      </div>
    </div>
  );
}
