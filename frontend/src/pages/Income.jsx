import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';
import { IconIncome } from '../components/Icons';

const QUICK_INCOME_CHIPS = [500, 1000, 2000, 5000, 10000, 25000, 50000];

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    source: '',
    amount: '',
    date: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      const res = await API.get('/income');
      setIncomes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      source: '',
      amount: '5000',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (inc) => {
    setEditing(inc);
    setForm({
      source: inc.source,
      amount: inc.amount,
      date: inc.date,
      notes: inc.notes || '',
    });
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
      setError(err.response?.data?.message || 'Failed to save income');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this income record?')) return;
    try {
      await API.delete(`/income/${id}`);
      loadIncomes();
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
          <h1>Income</h1>
          <p className="page-subtitle">Track your revenue, salary, and earnings</p>
        </div>
        <button type="button" className="btn-black-primary" onClick={openAdd}>
          + Add Income
        </button>
      </div>

      <div className="card">
        <div className="card-header-clean">
          <h3>Income Records</h3>
          <span className="card-tag">{incomes.length} records</span>
        </div>

        {incomes.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="table-wrapper desktop-only">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((inc) => (
                    <tr key={inc.id}>
                      <td className="font-medium">{inc.source}</td>
                      <td className="text-secondary">{inc.date}</td>
                      <td className="text-secondary">{inc.notes || '—'}</td>
                      <td style={{ textAlign: 'right' }} className="font-semibold text-blue">
                        +{formatCurrency(inc.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                            onClick={() => openEdit(inc)}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger-outline"
                            onClick={() => handleDelete(inc.id)}
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
              {incomes.map((inc) => (
                <div key={inc.id} className="mobile-item-card">
                  <div className="mobile-card-top">
                    <div className="mobile-item-left">
                      <div className="mobile-item-icon income">
                        <IconIncome size={18} />
                      </div>
                      <div className="mobile-item-details">
                        <span className="mobile-item-title">{inc.source}</span>
                      </div>
                    </div>
                    <div className="mobile-item-right">
                      <span className="mobile-item-amount text-blue">
                        +{formatCurrency(inc.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="mobile-card-bottom">
                    <div className="mobile-item-meta">
                      {inc.date}{inc.notes ? ` • ${inc.notes}` : ''}
                    </div>
                    <div className="mobile-item-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => openEdit(inc)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger-outline btn-sm"
                        onClick={() => handleDelete(inc.id)}
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
            <p className="empty-text">No income records yet</p>
            <span className="empty-subtext">Click "+ Add Income" above to log your first income</span>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Income' : 'Add Income'}
      >
        {error && <div className="quick-feedback error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Quick Amount Chips */}
          <div className="form-group">
            <label>Quick Amount Chips (+ Add)</label>
            <div className="chips-group">
              {QUICK_INCOME_CHIPS.map((chip) => (
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
            <label>Source / Client</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Monthly Salary, Freelance project, Dividend"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              required
            />
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
              {editing ? 'Save Changes' : 'Add Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
