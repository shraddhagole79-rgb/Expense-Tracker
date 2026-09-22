import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORIES = ['Stocks', 'Mutual Funds', 'Fixed Deposit', 'Gold', 'Crypto', 'Real Estate', 'Other'];
const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#f97316', '#eab308', '#64748b'];

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [allocation, setAllocation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ assetName: '', investedAmount: '', currentValue: '', category: CATEGORIES[0], notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [invRes, allocRes] = await Promise.all([
        API.get('/investments'),
        API.get('/investments/summary'),
      ]);
      setInvestments(invRes.data);
      setAllocation(allocRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ assetName: '', investedAmount: '', currentValue: '', category: CATEGORIES[0], notes: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (inv) => {
    setEditing(inv);
    setForm({ assetName: inv.assetName, investedAmount: inv.investedAmount, currentValue: inv.currentValue, category: inv.category, notes: inv.notes || '' });
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
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this investment?')) return;
    try {
      await API.delete(`/investments/${id}`);
      loadData();
    } catch (err) { console.error(err); }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getReturn = (invested, current) => {
    if (!invested || invested === 0) return 0;
    return ((current - invested) / invested * 100).toFixed(1);
  };

  const totalInvested = investments.reduce((sum, i) => sum + parseFloat(i.investedAmount || 0), 0);
  const totalCurrent = investments.reduce((sum, i) => sum + parseFloat(i.currentValue || 0), 0);
  const totalReturn = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested * 100).toFixed(1) : 0;

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Investments</h1>
          <p className="page-subtitle">Monitor your investment portfolio</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Investment</button>
      </div>

      <div className="summary-cards three-col">
        <div className="summary-card">
          <div className="summary-icon">💼</div>
          <div className="summary-info">
            <span className="summary-label">Total Invested</span>
            <span className="summary-value">{formatCurrency(totalInvested)}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-info">
            <span className="summary-label">Current Value</span>
            <span className="summary-value">{formatCurrency(totalCurrent)}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">{totalReturn >= 0 ? '🟢' : '🔴'}</div>
          <div className="summary-info">
            <span className="summary-label">Total Returns</span>
            <span className={`summary-value ${totalReturn >= 0 ? 'text-green' : 'text-red'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn}%
            </span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h3>Asset Allocation</h3>
          {allocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={allocation} dataKey="totalValue" nameKey="category" cx="50%" cy="50%"
                     outerRadius={100} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                  {allocation.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="empty-text">No allocation data</p>}
        </div>

        <div className="card chart-card">
          <h3>Portfolio</h3>
          {investments.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Category</th>
                    <th>Invested</th>
                    <th>Current</th>
                    <th>Return</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => {
                    const ret = getReturn(inv.investedAmount, inv.currentValue);
                    return (
                      <tr key={inv.id}>
                        <td>{inv.assetName}</td>
                        <td><span className="badge">{inv.category}</span></td>
                        <td>{formatCurrency(inv.investedAmount)}</td>
                        <td>{formatCurrency(inv.currentValue)}</td>
                        <td className={ret >= 0 ? 'text-green' : 'text-red'}>{ret >= 0 ? '+' : ''}{ret}%</td>
                        <td className="actions">
                          <button className="btn-icon" onClick={() => openEdit(inv)} title="Edit">✏️</button>
                          <button className="btn-icon" onClick={() => handleDelete(inv.id)} title="Delete">🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-text">No investments yet</p>}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Investment' : 'Add Investment'}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Asset Name</label>
            <input type="text" value={form.assetName} onChange={(e) => setForm({...form, assetName: e.target.value})} required placeholder="e.g. Nifty 50 ETF" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Invested Amount</label>
              <input type="number" step="0.01" min="0.01" value={form.investedAmount} onChange={(e) => setForm({...form, investedAmount: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Current Value</label>
              <input type="number" step="0.01" min="0" value={form.currentValue} onChange={(e) => setForm({...form, currentValue: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={2} />
          </div>
          <button type="submit" className="btn btn-primary btn-full">{editing ? 'Update' : 'Add'} Investment</button>
        </form>
      </Modal>
    </div>
  );
}
