import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';
import { IconExpense } from '../components/Icons';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Bills', 'Other'];
const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Other'];
const QUICK_AMOUNT_CHIPS = [50, 100, 200, 500, 1000, 2000, 5000];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    date: '',
    category: CATEGORIES[0],
    paymentMethod: PAYMENT_METHODS[0],
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadExpenses();
  }, []);

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
    setForm({
      title: '',
      amount: '250',
      date: new Date().toISOString().split('T')[0],
      category: CATEGORIES[0],
      paymentMethod: PAYMENT_METHODS[0],
      notes: '',
    });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setForm({
      title: exp.title,
      amount: exp.amount,
      date: exp.date,
      category: exp.category,
      paymentMethod: exp.paymentMethod || PAYMENT_METHODS[0],
      notes: exp.notes || '',
    });
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

  const handleChipAmount = (amt) => {
    setForm((prev) => ({
      ...prev,
      amount: String((parseFloat(prev.amount) || 0) + amt),
    }));
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

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
          <h1>Expenses</h1>
          <p className="page-subtitle">Track, filter, and control your daily spending</p>
        </div>
        <button type="button" className="btn-black-primary" onClick={openAdd}>
          + Add Expense
        </button>
      </div>

      <div className="card">
        <div className="card-header-clean">
          <h3>All Expense Entries</h3>
          <span className="card-tag">{expenses.length} records</span>
        </div>

        {expenses.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="table-wrapper desktop-only">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="font-medium">{exp.title}</td>
                      <td>
                        <span className="cat-chip">{exp.category}</span>
                      </td>
                      <td className="text-secondary">{exp.paymentMethod || '—'}</td>
                      <td className="text-secondary">{exp.date}</td>
                      <td style={{ textAlign: 'right' }} className="font-semibold text-slate">
                        -{formatCurrency(exp.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                            onClick={() => openEdit(exp)}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger-outline"
                            onClick={() => handleDelete(exp.id)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="mobile-cards-list mobile-only">
              {expenses.map((exp) => (
                <div key={exp.id} className="mobile-item-card">
                  <div className="mobile-card-top">
                    <div className="mobile-item-left">
                      <div className="mobile-item-icon expense">
                        <IconExpense size={18} />
                      </div>
                      <div className="mobile-item-details">
                        <span className="mobile-item-title">{exp.title}</span>
                        <span className="cat-chip" style={{ width: 'fit-content', marginTop: '2px' }}>{exp.category}</span>
                      </div>
                    </div>
                    <div className="mobile-item-right">
                      <span className="mobile-item-amount text-slate">
                        -{formatCurrency(exp.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="mobile-card-bottom">
                    <div className="mobile-item-meta">
                      {exp.paymentMethod ? `${exp.paymentMethod} • ` : ''}{exp.date}
                    </div>
                    <div className="mobile-item-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => openEdit(exp)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger-outline btn-sm"
                        onClick={() => handleDelete(exp.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-chart-box">
            <p className="empty-text">No expenses recorded yet</p>
            <span className="empty-subtext">Click "+ Add Expense" above to add your first one</span>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Expense' : 'Add Expense'}
      >
        {error && <div className="quick-feedback error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Quick Amount Chips */}
          <div className="form-group">
            <label>Quick Amount Chips (+ Add)</label>
            <div className="chips-group">
              {QUICK_AMOUNT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="amount-chip"
                  onClick={() => handleChipAmount(chip)}
                >
                  +{chip >= 1000 ? `₹${chip / 1000}k` : `₹${chip}`}
                </button>
              ))}
              <button
                type="button"
                className="amount-chip reset"
                onClick={() => setForm((prev) => ({ ...prev, amount: '0' }))}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Title / Merchant</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Grocery store, Uber, Electricity bill"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
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

            <div className="form-group">
              <label>Payment Method</label>
              <select
                className="form-control"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              className="form-control"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
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
              {editing ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
