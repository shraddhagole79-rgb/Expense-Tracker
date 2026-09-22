import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Bills', 'Other'];
const QUICK_BUDGET_CHIPS = [1000, 2000, 3000, 5000, 10000, 15000, 25000];

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    monthlyLimit: '5000',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');

  useEffect(() => {
    loadBudgets();
  }, [viewMonth, viewYear]);

  const loadBudgets = async () => {
    try {
      const res = await API.get(`/budgets?month=${viewMonth}&year=${viewYear}`);
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({
      category: CATEGORIES[0],
      monthlyLimit: '5000',
      month: viewMonth,
      year: viewYear,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/budgets', form);
      setModalOpen(false);
      loadBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await API.delete(`/budgets/${id}`);
      loadBudgets();
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

  const getSpendPercent = (spent, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min(100, (spent / limit) * 100);
  };

  const getBarColor = (percent) => {
    if (percent >= 90) return '#dc2626';
    if (percent >= 70) return '#d97706';
    return '#2563eb';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

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
          <h1>Category Budgets</h1>
          <p className="page-subtitle">Set monthly limits to keep your spending controlled</p>
        </div>
        <button type="button" className="btn-black-primary" onClick={openAdd}>
          + Set Budget
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            if (viewMonth === 1) {
              setViewMonth(12);
              setViewYear(viewYear - 1);
            } else {
              setViewMonth(viewMonth - 1);
            }
          }}
        >
          ← Previous
        </button>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {monthNames[viewMonth - 1]} {viewYear}
        </span>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            if (viewMonth === 12) {
              setViewMonth(1);
              setViewYear(viewYear + 1);
            } else {
              setViewMonth(viewMonth + 1);
            }
          }}
        >
          Next →
        </button>
      </div>

      {budgets.length > 0 ? (
        <div className="cards-grid-responsive">
          {budgets.map((b) => {
            const percent = getSpendPercent(b.spent, b.monthlyLimit);
            return (
              <div key={b.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{b.category}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {formatCurrency(b.spent)} of {formatCurrency(b.monthlyLimit)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={() => handleDelete(b.id)}
                    title="Delete Budget"
                  >
                    Delete
                  </button>
                </div>

                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', margin: '14px 0 8px 0' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${percent}%`,
                      backgroundColor: getBarColor(percent),
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '6px' }}>
                  <span style={{ fontWeight: 600, color: percent >= 90 ? '#dc2626' : '#2563eb' }}>
                    {percent.toFixed(0)}% used
                  </span>
                  <span style={{ color: b.remaining >= 0 ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                    {b.remaining >= 0 ? `${formatCurrency(b.remaining)} left` : `${formatCurrency(Math.abs(b.remaining))} exceeded`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty-chart-box">
            <p className="empty-text">No budgets set for {monthNames[viewMonth - 1]} {viewYear}</p>
            <span className="empty-subtext">Click "+ Set Budget" above to define spending limits</span>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Set Category Budget">
        {error && <div className="quick-feedback error">{error}</div>}
        <form onSubmit={handleSubmit}>
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

          {/* Quick preset chips */}
          <div className="form-group">
            <label>Quick Limit Presets</label>
            <div className="chips-group">
              {QUICK_BUDGET_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`amount-chip ${parseFloat(form.monthlyLimit) === chip ? 'active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, monthlyLimit: String(chip) }))}
                >
                  ₹{chip >= 1000 ? `${chip / 1000}k` : chip}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Monthly Limit (₹)</label>
            <input
              type="number"
              className="form-control"
              step="0.01"
              min="1"
              value={form.monthlyLimit}
              onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Month</label>
              <select
                className="form-control"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                className="form-control"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                required
              />
            </div>
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
              Save Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
