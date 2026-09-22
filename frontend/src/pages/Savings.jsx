import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

export default function Savings() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [contribModal, setContribModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [contribAmount, setContribAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const res = await API.get('/savings');
      setGoals(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', targetAmount: '', deadline: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setForm({ name: goal.name, targetAmount: goal.targetAmount, deadline: goal.deadline || '' });
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
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/savings/${contribModal.id}/contribute`, { amount: parseFloat(contribAmount) });
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
    } catch (err) { console.error(err); }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Savings Goals</h1>
          <p className="page-subtitle">Track progress toward your financial goals</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ New Goal</button>
      </div>

      {goals.length > 0 ? (
        <div className="goals-grid">
          {goals.map((goal) => {
            const progress = getProgress(goal.currentAmount, goal.targetAmount);
            return (
              <div key={goal.id} className="card goal-card">
                <div className="goal-header">
                  <h3>{goal.name}</h3>
                  <div className="goal-actions">
                    <button className="btn-icon" onClick={() => openEdit(goal)} title="Edit">✏️</button>
                    <button className="btn-icon" onClick={() => handleDelete(goal.id)} title="Delete">🗑️</button>
                  </div>
                </div>
                <div className="goal-amounts">
                  <span className="goal-current">{formatCurrency(goal.currentAmount)}</span>
                  <span className="goal-target">/ {formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="goal-footer">
                  <span className="goal-percent">{progress.toFixed(1)}%</span>
                  {goal.deadline && <span className="goal-deadline">Due: {goal.deadline}</span>}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => { setContribModal(goal); setContribAmount(''); }}>
                  + Contribute
                </button>
              </div>
            );
          })}
        </div>
      ) : <div className="card"><p className="empty-text">No savings goals yet. Create one to start saving!</p></div>}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Goal' : 'New Savings Goal'}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Goal Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required placeholder="e.g. Emergency Fund" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Target Amount</label>
              <input type="number" step="0.01" min="0.01" value={form.targetAmount} onChange={(e) => setForm({...form, targetAmount: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Deadline (optional)</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full">{editing ? 'Update' : 'Create'} Goal</button>
        </form>
      </Modal>

      <Modal isOpen={!!contribModal} onClose={() => setContribModal(null)} title={`Contribute to "${contribModal?.name}"`}>
        <form onSubmit={handleContribute} className="modal-form">
          <div className="form-group">
            <label>Contribution Amount</label>
            <input type="number" step="0.01" min="0.01" value={contribAmount} onChange={(e) => setContribAmount(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Add Contribution</button>
        </form>
      </Modal>
    </div>
  );
}
