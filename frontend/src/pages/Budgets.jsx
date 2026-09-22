import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Bills', 'Other'];

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ category: CATEGORIES[0], monthlyLimit: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');

  useEffect(() => { loadBudgets(); }, [viewMonth, viewYear]);

  const loadBudgets = async () => {
    try {
      const res = await API.get(`/budgets?month=${viewMonth}&year=${viewYear}`);
      setBudgets(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ category: CATEGORIES[0], monthlyLimit: '', month: viewMonth, year: viewYear });
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
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await API.delete(`/budgets/${id}`);
      loadBudgets();
    } catch (err) { console.error(err); }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getSpendPercent = (spent, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min(100, (spent / limit) * 100);
  };

  const getBarColor = (percent) => {
    if (percent >= 90) return 'var(--danger)';
    if (percent >= 70) return 'var(--warning)';
    return 'var(--success)';
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Budgets</h1>
          <p className="page-subtitle">Set spending limits by category</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Set Budget</button>
      </div>

      <div className="card month-selector">
        <button className="btn btn-ghost" onClick={() => {
          if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1); }
          else setViewMonth(viewMonth - 1);
        }}>← Prev</button>
        <span className="month-label">{monthNames[viewMonth - 1]} {viewYear}</span>
        <button className="btn btn-ghost" onClick={() => {
          if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1); }
          else setViewMonth(viewMonth + 1);
        }}>Next →</button>
      </div>

      {budgets.length > 0 ? (
        <div className="budget-list">
          {budgets.map((b) => {
            const percent = getSpendPercent(b.spent, b.monthlyLimit);
            return (
              <div key={b.id} className="card budget-card">
                <div className="budget-header">
                  <div>
                    <h3>{b.category}</h3>
                    <span className="budget-amounts">
                      {formatCurrency(b.spent)} / {formatCurrency(b.monthlyLimit)}
                    </span>
                  </div>
                  <div className="budget-actions">
                    <span className={`budget-status ${percent >= 90 ? 'over' : percent >= 70 ? 'warn' : 'good'}`}>
                      {percent >= 100 ? 'Over Budget!' : percent >= 90 ? 'Almost!' : 'On Track'}
                    </span>
                    <button className="btn-icon" onClick={() => handleDelete(b.id)} title="Delete">🗑️</button>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percent}%`, backgroundColor: getBarColor(percent) }}></div>
                </div>
                <div className="budget-footer">
                  <span>{percent.toFixed(0)}% used</span>
                  <span className={b.remaining >= 0 ? 'text-green' : 'text-red'}>
                    {b.remaining >= 0 ? `${formatCurrency(b.remaining)} remaining` : `${formatCurrency(Math.abs(b.remaining))} over`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : <div className="card"><p className="empty-text">No budgets set for {monthNames[viewMonth - 1]} {viewYear}. Click "Set Budget" to start!</p></div>}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Set Budget">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Monthly Limit</label>
            <input type="number" step="0.01" min="0.01" value={form.monthlyLimit} onChange={(e) => setForm({...form, monthlyLimit: e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Month</label>
              <select value={form.month} onChange={(e) => setForm({...form, month: parseInt(e.target.value)})}>
                {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm({...form, year: parseInt(e.target.value)})} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full">Set Budget</button>
        </form>
      </Modal>
    </div>
  );
}
