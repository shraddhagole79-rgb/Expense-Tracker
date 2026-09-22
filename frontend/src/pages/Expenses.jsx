import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Bills', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other'];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', date: '', category: CATEGORIES[0], paymentMethod: PAYMENT_METHODS[0], notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadExpenses(); }, []);

  const loadExpenses = async () => {
    try {
      const res = await API.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', amount: '', date: new Date().toISOString().split('T')[0], category: CATEGORIES[0], paymentMethod: PAYMENT_METHODS[0], notes: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setForm({ title: exp.title, amount: exp.amount, date: exp.date, category: exp.category, paymentMethod: exp.paymentMethod || '', notes: exp.notes || '' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await API.put(`/expenses/${editing.id}`, form);
      } else {
        await API.post('/expenses', form);
      }
      setModalOpen(false);
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await API.delete(`/expenses/${id}`);
      loadExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p className="page-subtitle">Track and manage your spending</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Expense</button>
      </div>

      <div className="card">
        {expenses.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.title}</td>
                    <td><span className="badge">{exp.category}</span></td>
                    <td>{exp.paymentMethod || '—'}</td>
                    <td className="text-red">{formatCurrency(exp.amount)}</td>
                    <td>{exp.date}</td>
                    <td className="actions">
                      <button className="btn-icon" onClick={() => openEdit(exp)} title="Edit">✏️</button>
                      <button className="btn-icon" onClick={() => handleDelete(exp.id)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty-text">No expenses yet. Click "Add Expense" to get started!</p>}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
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
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value})}>
                {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={2} />
          </div>
          <button type="submit" className="btn btn-primary btn-full">{editing ? 'Update' : 'Add'} Expense</button>
        </form>
      </Modal>
    </div>
  );
}
