import { useState, useEffect } from 'react';
import API from '../api/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, totalSavings: 0, netBalance: 0 });
  const [recent, setRecent] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [sumRes, recRes, catRes, iveRes, dtRes] = await Promise.all([
        API.get('/dashboard/summary'),
        API.get('/dashboard/recent'),
        API.get('/dashboard/charts/category-spending'),
        API.get('/dashboard/charts/income-vs-expense'),
        API.get('/dashboard/charts/daily-trend'),
      ]);
      setSummary(sumRes.data);
      setRecent(recRes.data);
      setCategorySpending(catRes.data);
      setIncomeVsExpense(iveRes.data.data || []);
      setDailyTrend(dtRes.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Your financial overview at a glance</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <span className="summary-label">Total Income</span>
            <span className="summary-value">{formatCurrency(summary.totalIncome)}</span>
          </div>
        </div>
        <div className="summary-card expense">
          <div className="summary-icon">💸</div>
          <div className="summary-info">
            <span className="summary-label">Total Expenses</span>
            <span className="summary-value">{formatCurrency(summary.totalExpenses)}</span>
          </div>
        </div>
        <div className="summary-card savings">
          <div className="summary-icon">🎯</div>
          <div className="summary-info">
            <span className="summary-label">Total Savings</span>
            <span className="summary-value">{formatCurrency(summary.totalSavings)}</span>
          </div>
        </div>
        <div className="summary-card balance">
          <div className="summary-icon">📊</div>
          <div className="summary-info">
            <span className="summary-label">Net Balance</span>
            <span className="summary-value">{formatCurrency(summary.netBalance)}</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h3>Category Spending</h3>
          {categorySpending.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categorySpending} dataKey="amount" nameKey="category" cx="50%" cy="50%"
                     outerRadius={100} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                  {categorySpending.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="empty-text">No expense data yet</p>}
        </div>

        <div className="card chart-card">
          <h3>Income vs Expenses</h3>
          {incomeVsExpense.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="empty-text">No data yet</p>}
        </div>

        <div className="card chart-card full-width">
          <h3>Daily Spending Trend (Last 30 Days)</h3>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="empty-text">No spending data yet</p>}
        </div>
      </div>

      <div className="card">
        <h3>Recent Transactions</h3>
        {recent.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t, i) => (
                  <tr key={i}>
                    <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                    <td>{t.title}</td>
                    <td>{t.category}</td>
                    <td className={t.type === 'income' ? 'text-green' : 'text-red'}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td>{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty-text">No transactions yet. Start by adding some income or expenses!</p>}
      </div>
    </div>
  );
}
