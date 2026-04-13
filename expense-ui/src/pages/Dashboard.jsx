import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';

const CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities',
  'Education', 'Money Transfer', 'Bill Payments', 'Metro Recharge', 'MISCELLANEOUS'
];

const CAT_ICON = {
  Food: 'restaurant', Travel: 'flight', Shopping: 'shopping_cart',
  Entertainment: 'movie', Healthcare: 'local_hospital', Utilities: 'bolt',
  Education: 'school', 'Money Transfer': 'payments', 'Bill Payments': 'receipt',
  'Metro Recharge': 'subway', MISCELLANEOUS: 'category',
};


export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ merchantName: '', description: '', amount: '', category: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.merchantName || !form.amount) {
      setError('Merchant name and amount are required.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const payload = { 
        ...form, 
        amount: parseFloat(form.amount),
        // Normalize categories for backend if needed, but here we just pass as is
      };
      const { data } = await api.post('/api/transactions/payment', payload);
      setResult(data);
      setForm({ merchantName: '', description: '', amount: '', category: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Transaction failed.');
    } finally { setLoading(false); }
  };


  const statusColor = (s = '') => {
    const m = s.toUpperCase();
    if (m === 'SUCCESS' || m === 'COMPLETED') return 'text-green-600 dark:text-green-400';
    if (m === 'FAILED') return 'text-error';
    return 'text-primary';
  };

  return (
    <div className="p-8 lg:p-10 space-y-10 fade-in">
      {/* Page hero */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Net Worth hero */}
        <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-[#1e2230] rounded-xl p-8 editorial-shadow border border-outline-variant/20 dark:border-[#2a2d38] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant/60 mb-1">Welcome Back</h2>
            <div className="flex items-end gap-4 mb-2">
              <span className="text-4xl font-extrabold tracking-tighter text-on-surface dark:text-[#e1e2e5]">
                {user?.username}
              </span>
              <span className="text-primary font-bold flex items-center mb-1">
                <span className="material-symbols-outlined text-sm">verified</span> Vault Member
              </span>
            </div>
            <p className="text-on-surface-variant dark:text-[#a0a3b1] text-sm">Your financial control centre is ready. Make your next move below.</p>
            {/* Bar chart decoration */}
            <div className="w-full h-28 flex items-end gap-1 mt-6">
              {[50, 65, 60, 75, 55, 80, 100, 85, 65, 80].map((h, i) => (
                <div key={i} style={{height:`${h}%`}} className={`flex-1 rounded-t-sm transition-all ${i === 9 ? 'bg-primary shadow-[0_0_15px_rgba(46,91,255,0.3)]' : 'bg-primary-container/10 hover:bg-primary-container/20'}`} />
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Quick links column */}
        <div className="space-y-4">
          {[
            { label: 'Transaction Ledger', sub: 'View full payment history', icon: 'receipt_long', path: '/ledger', color: 'text-primary bg-primary/10' },
            { label: 'Budget Manager',     sub: 'Set category spending limits', icon: 'account_balance_wallet', path: '/budget', color: 'text-tertiary bg-tertiary/10' },
            { label: 'Notifications',      sub: 'Budget alerts & activity', icon: 'notifications', path: '/notifications', color: 'text-secondary bg-secondary/10' },
          ].map(({ label, sub, icon, path, color }) => (
            <div
              key={path}
              id={`goto-${label.toLowerCase().replace(/ /g,'-')}`}
              onClick={() => navigate(path)}
              className="bg-surface-container-lowest dark:bg-[#1e2230] border border-outline-variant/10 dark:border-[#2a2d38] rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-primary/20 transition-all group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} flex-shrink-0`}>
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{label}</div>
                <div className="text-xs text-on-surface-variant dark:text-[#a0a3b1] mt-0.5">{sub}</div>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Transact */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-surface-container-lowest dark:bg-[#1e2230] rounded-xl p-8 editorial-shadow border border-outline-variant/20 dark:border-[#2a2d38]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight mb-1">Quick Transact</h3>
              <p className="text-sm text-on-surface-variant dark:text-[#a0a3b1]">Instant payment — wired to your microservice</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-error-container dark:bg-red-900/20 rounded-lg text-on-error-container dark:text-red-400 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>{error}
            </div>
          )}
          {result && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              Txn <strong>#{result.id}</strong> — ₹{result.amount?.toFixed(2)} to {result.merchantName}
              <span className={`ml-auto font-bold ${statusColor(result.status)}`}>{result.status}</span>
            </div>
          )}

          <form id="transact-form" className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Merchant</label>
                <input id="merchant-name" name="merchantName" value={form.merchantName} onChange={handleChange} required
                  placeholder="e.g. Amazon" className="w-full bg-surface-container-low dark:bg-[#25282f] p-3 rounded-lg text-sm focus:ring-1 focus:ring-primary/40 outline-none text-on-surface dark:text-[#e1e2e5] border border-transparent hover:border-primary/20 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange}
                  className="w-full bg-surface-container-low dark:bg-[#25282f] p-3 rounded-lg text-sm focus:ring-1 focus:ring-primary/40 outline-none text-on-surface dark:text-[#e1e2e5] border border-transparent hover:border-primary/20 transition-colors cursor-pointer">
                  <option value="">Auto-Categorize (AI)</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                  <input id="amount" name="amount" type="number" min="0.01" step="0.01" required
                    value={form.amount} onChange={handleChange} placeholder="0.00"
                    className="w-full bg-surface-container-low dark:bg-[#25282f] pl-8 pr-4 py-3 rounded-lg text-sm font-bold focus:ring-1 focus:ring-primary/40 outline-none text-on-surface dark:text-[#e1e2e5] border border-transparent hover:border-primary/20 transition-colors" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Description</label>
              <input id="description" name="description" value={form.description} onChange={handleChange}
                placeholder="Brief description" className="w-full bg-surface-container-low dark:bg-[#25282f] p-3 rounded-lg text-sm focus:ring-1 focus:ring-primary/40 outline-none text-on-surface dark:text-[#e1e2e5] border border-transparent hover:border-primary/20 transition-colors" />
            </div>

            <div className="flex items-center justify-between p-4 bg-primary-container/5 rounded-lg border border-primary-container/10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary icon-filled">info</span>
                <span className="text-xs text-on-surface-variant">Transfer posts via <strong className="text-on-surface">TransactionMS</strong> in real-time.</span>
              </div>
              <button id="submit-transact" type="submit" disabled={loading}
                className="vault-gradient text-on-primary px-8 py-2.5 rounded-lg text-sm font-bold editorial-shadow hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Processing…' : 'Initiate Transfer'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Card */}
        <div className="lg:col-span-4 bg-surface-container-lowest dark:bg-[#1e2230] rounded-xl p-8 editorial-shadow border border-outline-variant/20 dark:border-[#2a2d38] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary icon-filled">verified_user</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight">Vault Security</h3>
          </div>
          <div className="flex-1 space-y-5">
            {[
              { icon: 'fingerprint', title: 'Biometric Vault Access', sub: 'Active and encrypted', on: true },
              { icon: 'key', title: 'Hardware Key Sync', sub: 'YubiKey connected', on: true },
            ].map(({ icon, title, sub, on }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-surface-container dark:bg-[#25282f]">
                  <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{title}</p>
                  <p className="text-xs text-on-surface-variant dark:text-[#a0a3b1]">{sub}</p>
                </div>
                {on && <span className="material-symbols-outlined text-primary icon-filled text-lg">check_circle</span>}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-outline-variant/10 dark:border-[#2a2d38]">
            <div className="bg-surface-container-low dark:bg-[#25282f] p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase text-on-surface-variant">Trust Score</span>
                <span className="text-xs font-bold text-primary">98/100</span>
              </div>
              <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
                <div className="w-[98%] h-full bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
