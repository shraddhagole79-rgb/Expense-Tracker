import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { IconInvestment, IconSalary, IconIncome, IconExpense } from '../components/Icons';

const CATEGORIES = ['Stocks', 'Mutual Funds', 'Fixed Deposit', 'Gold', 'Crypto', 'Real Estate', 'Other'];
const COLORS = ['#2563eb', '#3b82f6', '#0284c7', '#0d9488', '#16a34a', '#d97706', '#64748b'];

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [allocation, setAllocation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    assetName: '',
    investedAmount: '',
    currentValue: '',
    category: CATEGORIES[0],
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invRes, allocRes] = await Promise.all([
        API.get('/investments'),
        API.get('/investments/summary'),
      ]);
      setInvestments(invRes.data);
      setAllocation(allocRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      assetName: '',
      investedAmount: '',
      currentValue: '',
      category: CATEGORIES[0],
      notes: '',
    });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (inv) => {
    setEditing(inv);
    setForm({
      assetName: inv.assetName,
      investedAmount: inv.investedAmount,
      currentValue: inv.currentValue,
      category: inv.category,
      notes: inv.notes || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await API.put(`/investments/${editing.id}`, form);
      } else {
        await API.post('/investments', form);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save investment');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this investment asset?')) return;
    try {
      await API.delete(`/investments/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const getReturn = (invested, current) => {
    if (!invested || invested === 0) return 0;
    return (((current - invested) / invested) * 100).toFixed(1);
  };

  const totalInvested = investments.reduce(
    (sum, i) => sum + parseFloat(i.investedAmount || 0),
    0
  );
  const totalCurrent = investments.reduce(
    (sum, i) => sum + parseFloat(i.currentValue || 0),
    0
  );
  const totalReturn =
    totalInvested > 0
      ? (((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Investment Portfolio</h1>
          <p className="page-subtitle">Track assets, holdings, and overall portfolio return</p>
        </div>
        <button type="button" className="btn-black-primary" onClick={openAdd}>
          + Add Investment
        </button>
      </div>

      <div className="summary-cards three-cards">
        <div className="summary-card">
          <div className="summary-card-inner">
            <div className="summary-icon" style={{ background: '#f1f5f9', color: '#0f172a' }}>
              <IconSalary size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Total Invested</span>
              <span className="summary-value">{formatCurrency(totalInvested)}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-inner">
            <div className="summary-icon income-icon">
              <IconInvestment size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Current Value</span>
              <span className="summary-value text-blue">{formatCurrency(totalCurrent)}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-inner">
            <div
              className="summary-icon"
              style={{
                background: totalReturn >= 0 ? '#f0fdf4' : '#fef2f2',
                color: totalReturn >= 0 ? '#16a34a' : '#dc2626',
              }}
            >
              {totalReturn >= 0 ? <IconIncome size={20} /> : <IconExpense size={20} />}
            </div>
            <div className="summary-info">
              <span className="summary-label">Total Return</span>
              <span
                className={`summary-value ${
                  totalReturn >= 0 ? 'text-blue' : 'text-danger'
                }`}
              >
                {totalReturn >= 0 ? '+' : ''}
                {totalReturn}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card-header-clean">
            <h3>Asset Allocation</h3>
            <span className="card-tag">Portfolio</span>
          </div>
          {allocation.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={210} minWidth={0}>
                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Pie
                    data={allocation}
                    dataKey="totalValue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {allocation.map((_, i) => (
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
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-legend">
                {allocation.map((cat, idx) => (
                  <div key={cat.category} className="legend-item">
                    <span
                      className="legend-color-dot"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="legend-name">{cat.category}</span>
                    <span className="legend-amt">{formatCurrency(cat.totalValue)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-chart-box">
              <p className="empty-text">No allocation data</p>
            </div>
          )}
        </div>

        <div className="card chart-card">
          <div className="card-header-clean">
            <h3>Holdings</h3>
            <span className="card-tag">{investments.length} assets</span>
          </div>
          {investments.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="table-wrapper desktop-only">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Category</th>
                      <th>Invested</th>
                      <th>Current</th>
                      <th>Return</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv) => {
                      const ret = getReturn(inv.investedAmount, inv.currentValue);
                      return (
                        <tr key={inv.id}>
                          <td className="font-medium">{inv.assetName}</td>
                          <td>
                            <span className="cat-chip">{inv.category}</span>
                          </td>
                          <td>{formatCurrency(inv.investedAmount)}</td>
                          <td className="font-semibold text-blue">{formatCurrency(inv.currentValue)}</td>
                          <td className={ret >= 0 ? 'text-blue' : 'text-danger'}>
                            {ret >= 0 ? '+' : ''}
                            {ret}%
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '3px 6px', fontSize: '0.75rem' }}
                                onClick={() => openEdit(inv)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-danger-outline"
                                style={{ padding: '3px 6px', fontSize: '0.75rem' }}
                                onClick={() => handleDelete(inv.id)}
                              >
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="mobile-cards-list mobile-only">
                {investments.map((inv) => {
                  const ret = getReturn(inv.investedAmount, inv.currentValue);
                  return (
                    <div key={inv.id} className="mobile-item-card">
                      <div className="mobile-card-top">
                        <div className="mobile-item-left">
                          <div className="mobile-item-icon investment">
                            <IconInvestment size={18} />
                          </div>
                          <div className="mobile-item-details">
                            <span className="mobile-item-title">{inv.assetName}</span>
                            <span className="cat-chip" style={{ width: 'fit-content', marginTop: '2px' }}>{inv.category}</span>
                          </div>
                        </div>
                        <div className="mobile-item-right">
                          <span className="mobile-item-amount text-blue">
                            {formatCurrency(inv.currentValue)}
                          </span>
                          <span
                            className={`mobile-item-sub-ret ${
                              ret >= 0 ? 'text-blue' : 'text-danger'
                            }`}
                          >
                            {ret >= 0 ? '+' : ''}{ret}%
                          </span>
                        </div>
                      </div>
                      <div className="mobile-card-bottom">
                        <div className="mobile-item-meta">
                          <span>Invested: {formatCurrency(inv.investedAmount)}</span>
                        </div>
                        <div className="mobile-item-actions">
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => openEdit(inv)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger-outline btn-sm"
                            onClick={() => handleDelete(inv.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="empty-chart-box">
              <p className="empty-text">No investments added yet</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Investment' : 'Add Investment'}
      >
        {error && <div className="quick-feedback error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Asset Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Nifty 50 Index Fund, Apple Inc, Sovereign Gold Bond"
              value={form.assetName}
              onChange={(e) => setForm({ ...form, assetName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              className="form-control"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Invested Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                min="0.01"
                value={form.investedAmount}
                onChange={(e) => setForm({ ...form, investedAmount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Current Value (₹)</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                min="0"
                value={form.currentValue}
                onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              className="form-control"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-black-primary">
              {editing ? 'Save Changes' : 'Add Investment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
