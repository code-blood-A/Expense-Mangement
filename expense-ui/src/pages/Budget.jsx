import { useState, useEffect } from 'react';
import api from '../api/axiosClient';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Education', 'Other'];
const CAT_ICON   = { Food:'restaurant', Travel:'flight', Shopping:'shopping_cart', Entertainment:'movie', Healthcare:'local_hospital', Utilities:'bolt', Education:'school', Other:'category' };
const fmt = (v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`;
const currentMonth = () => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; };

export default function Budget() {
  const [budgets, setBudgets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [monthYear, setMonthYear] = useState(currentMonth());
  const [form, setForm]         = useState({ category: 'Food', limitAmount: '', monthYear: currentMonth() });
  const [totalBurn, setTotalBurn] = useState(0);

  const fetchBudgets = async (my = monthYear) => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/api/budgets', { params: { monthYear: my } });
      setBudgets(data);
      setTotalBurn(data.reduce((s,b) => s + (b.currentSpend ?? 0), 0));
    } catch { setError('Could not load budgets. Is BudgetMS running on port 8083?'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(monthYear); }, [monthYear]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/api/budgets', { ...form, limitAmount: parseFloat(form.limitAmount) });
      setSuccess(`Budget for "${form.category}" saved!`);
      setForm(f => ({ ...f, limitAmount: '' }));
      fetchBudgets(monthYear);
    } catch (err) { setError(err.response?.data || 'Failed to save budget.'); }
    finally { setSaving(false); }
  };

  const pct = (b) => b.limitAmount ? Math.min(100, ((b.currentSpend ?? 0) / b.limitAmount) * 100) : 0;
  const barColor = (p) => p >= 90 ? 'bg-error' : p >= 60 ? 'bg-tertiary' : 'bg-primary';

  return (
    <div className="p-8 lg:p-10 space-y-10 fade-in">
      {/* Page header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Master Allocation</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface dark:text-[#e1e2e5]">Budgets &amp; Limits</h2>
          <p className="text-on-surface-variant dark:text-[#a0a3b1] max-w-md text-sm">Orchestrate your capital with surgical precision. Adjust thresholds in real-time.</p>
        </div>
        <div className="bg-surface-container-low dark:bg-[#1a1d26] px-6 py-4 rounded-xl border border-outline-variant/10 dark:border-[#2a2d38] flex flex-col items-end">
          <span className="text-[10px] font-bold text-outline-variant uppercase">Current Month Burn</span>
          <span className="text-2xl font-black text-on-surface dark:text-[#e1e2e5]">{fmt(totalBurn)}</span>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Set Budget form */}
        <div className="md:col-span-4 bg-surface-container-low dark:bg-[#1a1d26] p-8 rounded-xl flex flex-col space-y-6 border border-outline-variant/10 dark:border-[#2a2d38]">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Set Limit</h3>
            <p className="text-xs text-on-surface-variant dark:text-[#a0a3b1]">Define category budget thresholds</p>
          </div>

          {error   && <div className="p-3 bg-error-container rounded-lg text-on-error-container text-xs flex gap-2 items-center"><span className="material-symbols-outlined text-sm">error</span>{error}</div>}
          {success && <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 text-xs flex gap-2 items-center"><span className="material-symbols-outlined text-sm">check_circle</span>{success}</div>}

          <form id="budget-form" className="flex flex-col gap-4" onSubmit={handleSave}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Month</label>
              <input id="budget-month" type="month" value={form.monthYear}
                onChange={e => setForm(f => ({ ...f, monthYear: e.target.value }))} required
                className="w-full bg-surface-container-lowest dark:bg-[#25282f] p-3 rounded-lg text-sm focus:ring-1 focus:ring-primary/40 outline-none border border-outline-variant/20 text-on-surface dark:text-[#e1e2e5]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Category</label>
              <select id="budget-category" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-surface-container-lowest dark:bg-[#25282f] p-3 rounded-lg text-sm focus:ring-1 focus:ring-primary/40 outline-none border border-outline-variant/20 text-on-surface dark:text-[#e1e2e5] cursor-pointer">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Limit Amount (₹)</label>
              <input id="budget-limit" type="number" min="1" step="1" placeholder="e.g. 5000"
                value={form.limitAmount} onChange={e => setForm(f => ({ ...f, limitAmount: e.target.value }))} required
                className="w-full bg-surface-container-lowest dark:bg-[#25282f] p-3 rounded-lg text-sm focus:ring-1 focus:ring-primary/40 outline-none border border-outline-variant/20 text-on-surface dark:text-[#e1e2e5]" />
            </div>
            <button id="submit-budget" type="submit" disabled={saving}
              className="w-full py-3 border border-outline-variant/30 dark:border-[#3a3d48] rounded-lg text-sm font-bold hover:bg-surface-container-high dark:hover:bg-[#25282f] transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : 'Apply New Limit'}
            </button>
          </form>

          {/* Month view filter */}
          <div className="mt-auto pt-4 border-t border-outline-variant/10 dark:border-[#2a2d38]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">View Month</label>
            <input id="view-month" type="month" value={monthYear}
              onChange={e => setMonthYear(e.target.value)}
              className="w-full bg-surface-container-lowest dark:bg-[#25282f] p-2.5 rounded-lg text-sm focus:ring-1 focus:ring-primary/40 outline-none border border-outline-variant/20 text-on-surface dark:text-[#e1e2e5]" />
          </div>
        </div>

        {/* Budget overview */}
        <div className="md:col-span-8 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-4">
              <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm">Loading budgets…</span>
            </div>
          ) : budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl opacity-30 mb-4">account_balance_wallet</span>
              <p className="text-sm">No budgets set for {monthYear}. Use the form to add one.</p>
            </div>
          ) : (
            <>
              {/* 3-up quick view cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {budgets.slice(0,3).map(b => {
                  const p = pct(b);
                  return (
                    <div key={b.id} className="bg-surface-container-lowest dark:bg-[#1e2230] p-5 rounded-xl border border-outline-variant/10 dark:border-[#2a2d38] flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-primary bg-surface-container dark:bg-[#25282f]`}>
                          <span className="material-symbols-outlined">{CAT_ICON[b.category] || 'category'}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-outline-variant block">{b.category}</span>
                          <span className="text-base font-black text-on-surface dark:text-[#e1e2e5]">{fmt(b.currentSpend ?? 0)} / {fmt(b.limitAmount)}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${p >= 90 ? 'text-error' : 'text-outline'}`}>{p.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Detailed list */}
              <div className="bg-surface-container-lowest dark:bg-[#1e2230] rounded-xl border border-outline-variant/10 dark:border-[#2a2d38]">
                <div className="flex justify-between items-center px-6 pt-6 mb-4">
                  <h4 className="text-base font-bold tracking-tight">Active Allocation Sub-Vaults</h4>
                  <button className="text-xs font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">filter_list</span> Filter
                  </button>
                </div>
                <div className="space-y-3 px-6 pb-6">
                  {budgets.map(b => {
                    const p = pct(b);
                    const over = p >= 90;
                    return (
                      <div key={b.id} className="bg-surface-container-low dark:bg-[#25282f] hover:bg-surface-container-high dark:hover:bg-[#2a2d38] transition-colors p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4 w-1/3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest dark:bg-[#1e2230] flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-on-surface-variant text-base">{CAT_ICON[b.category] || 'category'}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{b.category}</p>
                            <p className="text-[10px] text-outline uppercase tracking-wider">{b.monthYear}</p>
                          </div>
                        </div>
                        <div className="flex-1 px-6">
                          <div className="w-full h-1.5 bg-surface-container-highest dark:bg-[#1e2230] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${barColor(p)}`} style={{width:`${p}%`}}></div>
                          </div>
                        </div>
                        <div className="w-1/4 text-right">
                          <p className="text-sm font-black">{fmt(b.currentSpend??0)} <span className="text-outline-variant font-medium">/ {fmt(b.limitAmount)}</span></p>
                          <p className={`text-[10px] font-bold ${over ? 'text-error' : 'text-primary'}`}>{over ? 'AlertZone' : 'Stable'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
