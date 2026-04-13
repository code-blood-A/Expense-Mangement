import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosClient';

const fmt = (v) => `₹${Number(v ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_STYLE = {
  SUCCESS:   { cls: 'text-green-600 dark:text-green-400', label: 'Success'   },
  COMPLETED: { cls: 'text-green-600 dark:text-green-400', label: 'Completed'  },
  FAILED:    { cls: 'text-error',                          label: 'Failed'    },
  PENDING:   { cls: 'text-tertiary',                       label: 'Pending'    },
};

export default function Ledger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '', period: '' });

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.status)   params.status   = filters.status;
      if (filters.period === 'weekly')  params.weekly  = true;
      if (filters.period === 'monthly') params.monthly = true;
      const { data } = await api.get('/api/transactions/history', { params });
      setTransactions(data);
    } catch { setError('Could not load transactions. Is TransactionMS running on port 8082?'); }
    finally  { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalSpent = transactions
    .filter(t => !['FAILED'].includes((t.status ?? '').toUpperCase()))
    .reduce((s, t) => s + (t.amount ?? 0), 0);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Filter panel */}
      <aside className="hidden lg:flex w-72 border-r border-outline-variant/10 dark:border-[#2a2d38] p-8 flex-col gap-8 overflow-y-auto bg-surface dark:bg-[#0f1115] flex-shrink-0">
        <section>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-outline font-bold mb-5">Filter by Period</h3>
          <div className="space-y-2">
            {[{ v: '', l: 'All Time' }, { v: 'weekly', l: 'This Week' }, { v: 'monthly', l: 'This Month' }].map(({ v, l }) => (
              <label key={v} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.period === v ? 'border-primary bg-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                  {filters.period === v && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                </div>
                <input type="radio" className="hidden" name="period" value={v} checked={filters.period === v} onChange={() => setFilters(f => ({ ...f, period: v }))} />
                <span className={`text-sm font-medium ${filters.period === v ? 'text-primary' : 'text-on-surface-variant dark:text-[#a0a3b1]'}`}>{l}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-outline font-bold mb-5">Status</h3>
          <div className="space-y-2">
            {[{ v: '', l: 'All' }, { v: 'SUCCESS', l: 'Success' }, { v: 'FAILED', l: 'Failed' }].map(({ v, l }) => (
              <label key={v} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.status === v ? 'border-primary bg-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                  {filters.status === v && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                </div>
                <input type="radio" className="hidden" name="status" value={v} checked={filters.status === v} onChange={() => setFilters(f => ({ ...f, status: v }))} />
                <span className={`text-sm font-medium ${filters.status === v ? 'text-primary' : 'text-on-surface-variant dark:text-[#a0a3b1]'}`}>{l}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-outline font-bold mb-5">Category</h3>
          <select id="filter-category" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-surface-container dark:bg-[#1a1d26] rounded-lg p-2.5 text-sm border border-outline-variant/20 focus:ring-1 focus:ring-primary/40 outline-none text-on-surface dark:text-[#e1e2e5]">
            <option value="">All Categories</option>
            {['Food','Travel','Shopping','Entertainment','Healthcare','Utilities','Education','Money Transfer', 'Bill Payments', 'Metro Recharge', 'MISCELLANEOUS'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </section>

        <div className="mt-auto bg-primary/5 rounded-2xl p-5 border border-primary/10">
          <h4 className="text-primary text-sm font-bold mb-2">Vault Security</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">Your ledger is end-to-end encrypted with architectural-grade protocols.</p>
        </div>
      </aside>

      {/* Main content */}
      <section className="flex-1 overflow-y-auto p-8 lg:p-10 bg-surface-container-low dark:bg-[#13151f] fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tighter text-on-surface dark:text-[#e1e2e5] mb-1">Transaction Ledger</h2>
              <p className="text-on-surface-variant dark:text-[#a0a3b1] text-sm">
                {transactions.length} entries · Total spent: <strong className="text-on-surface dark:text-[#e1e2e5]">{fmt(totalSpent)}</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button id="filter-period-mobile" onClick={() => setFilters({ category: '', status: '', period: '' })}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-outline border border-outline-variant/30 rounded-lg hover:bg-surface-container-lowest dark:hover:bg-[#1e2230] transition-all">
                Reset
              </button>
              <button id="refresh-ledger" onClick={fetch}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-primary bg-on-surface dark:bg-[#e1e2e5] dark:text-[#0f1115] rounded-lg hover:opacity-90 transition-all">
                ↻ Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container rounded-lg text-on-error-container text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>{error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-4">
              <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm">Loading ledger…</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl opacity-30 mb-4">receipt_long</span>
              <p className="text-sm">No transactions found for the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => {
                const s = STATUS_STYLE[(t.status ?? '').toUpperCase()] || { cls: 'text-outline', label: t.status };
                return (
                  <div key={t.id} className="bg-surface-container-lowest dark:bg-[#1e2230] p-5 rounded-xl flex items-center gap-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-shadow cursor-pointer border border-transparent hover:border-outline-variant/10">
                    <div className="w-11 h-11 bg-surface-container dark:bg-[#25282f] flex items-center justify-center rounded-lg flex-shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant">shopping_bag</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-on-surface dark:text-[#e1e2e5] truncate">{t.merchantName}</h4>
                        <span className="material-symbols-outlined text-primary icon-filled text-[14px]">verified</span>
                      </div>
                      <p className="text-xs text-outline">{t.category} · {fmtDate(t.transactionDate)}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-outline uppercase">Impact</span>
                      <div className="w-12 h-1.5 bg-surface-container dark:bg-[#25282f] rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{width:`${Math.min(100, (t.amount/500)*100)}%`}}></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-on-surface dark:text-[#e1e2e5]">{fmt(t.amount)}</div>
                      <div className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 ${s.cls}`}>{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
