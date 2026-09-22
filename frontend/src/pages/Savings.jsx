import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const QUICK_CONTRIB_CHIPS = [500, 1000, 2000, 5000, 10000];

export default function Savings() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [contribModal, setContribModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '50000', deadline: '' });
  const [contribAmount, setContribAmount] = useState('1000');
  const [error, setError] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const res = await API.get('/savings');
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', targetAmount: '50000', deadline: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setForm({
      name: goal.name,
      targetAmount: goal.targetAmount,
      deadline: goal.deadline || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...form };
      if (!data.deadline) delete data.deadline;
      if (editing) {
        await API.put(`/savings/${editing.id}`, data);
      } else {
        await API.post('/savings', data);
      }
      setModalOpen(false);
      loadGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/savings/${contribModal.id}/contribute`, {
        amount: parseFloat(contribAmount),
      });
      setContribModal(null);
      setContribAmount('');
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this savings goal?')) return;
    try {
      await API.delete(`/savings/${id}`);
      loadGoals();
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

  const getProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

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
          <h1>Savings Goals</h1>
          <p className="page-subtitle">Track, fund, and conquer your financial milestones</p>
        </div>
        <button type="button" className="btn-black-primary" onClick={openAdd}>
          + New Goal
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="cards-grid-responsive">
          {goals.map((goal) => {
            const progress = getProgress(goal.currentAmount, goal.targetAmount);
            return (
              <div key={goal.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{goal.name}</h3>
                    {goal.deadline && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Target: {goal.deadline}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      onClick={() => openEdit(goal)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-danger-outline"
                      onClick={() => handleDelete(goal.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    / {formatCurrency(goal.targetAmount)}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', margin: '10px 0' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: progress >= 100 ? '#16a34a' : '#2563eb',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '16px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {progress.toFixed(1)}% completed
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))} remaining
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-black-primary"
                  style={{ width: '100%', padding: '9px 16px', fontSize: '0.88rem' }}
                  onClick={() => {
                    setContribModal(goal);
                    setContribAmount('1000');
                  }}
                >
                  + Add Contribution
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty-chart-box">
            <p className="empty-text">No savings goals set yet</p>
            <span className="empty-subtext">Click "+ New Goal" to start saving toward a target</span>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Goal' : 'New Savings Goal'}
      >
        {error && <div className="quick-feedback error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Goal Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Emergency Fund, New Laptop, Vacation"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Target Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              step="1"
              min="1"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Target Deadline (Optional)</label>
            <input
              type="date"
              className="form-control"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
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
              {editing ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribution Modal */}
      <Modal
        isOpen={!!contribModal}
        onClose={() => setContribModal(null)}
        title={`Contribute to "${contribModal?.name}"`}
      >
        <form onSubmit={handleContribute}>
          <div className="form-group">
            <label>Quick Contribution Chips</label>
            <div className="chips-group">
              {QUICK_CONTRIB_CHIPS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="amount-chip"
                  onClick={() => setContribAmount(String(amt))}
                >
                  +₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Contribution Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              step="1"
              min="1"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setContribModal(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-black-primary">
              Confirm Contribution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
