import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ source: '', amount: '', date: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadIncomes(); }, []);

  const loadIncomes = async () => {
    try {
      const res = await API.get('/income');
      setIncomes(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ source: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (inc) => {
    setEditing(inc);
    setForm({ source: inc.source, amount: inc.amount, date: inc.date, notes: inc.notes || '' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await API.put(`/income/${editing.id}`, form);
      } else {
        await API.post('/income', form);
      }
      setModalOpen(false);
      loadIncomes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this income record?')) return;
    try {
      await API.delete(`/income/${id}`);
      loadIncomes();
    } catch (err) { console.error(err); }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Income</h1>
          <p className="page-subtitle">Track your earnings and revenue</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Income</button>
      </div>

      <div className="card">
        {incomes.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((inc) => (
                  <tr key={inc.id}>
                    <td>{inc.source}</td>
                    <td className="text-green">+{formatCurrency(inc.amount)}</td>
                    <td>{inc.date}</td>
                    <td>{inc.notes || '—'}</td>
                    <td className="actions">
                      <button className="btn-icon" onClick={() => openEdit(inc)} title="Edit">✏️</button>
                      <button className="btn-icon" onClick={() => handleDelete(inc.id)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty-text">No income records yet. Click "Add Income" to start tracking!</p>}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Income' : 'Add Income'}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Source</label>
            <input type="text" value={form.source} onChange={(e) => setForm({...form, source: e.target.value})} required placeholder="e.g. Salary, Freelance" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Amount</label>
              <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={2} />
          </div>
          <button type="submit" className="btn btn-primary btn-full">{editing ? 'Update' : 'Add'} Income</button>
        </form>
      </Modal>
    </div>
  );
}
