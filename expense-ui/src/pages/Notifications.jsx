import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosClient';

const fmtTime = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
};

export default function Notifications() {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [polling, setPolling] = useState(true);
  const intervalRef = useRef(null);

  const fetchAlerts = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/notifications');
      setAlerts(data);
    } catch {
      setError('Could not reach NotificationMS. Is it running on port 8084?');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, []);

  useEffect(() => {
    if (polling) intervalRef.current = setInterval(() => fetchAlerts(true), 10000);
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [polling]);

  const pct = (a) => a.limitAmount ? Math.min(100, (a.currentSpend / a.limitAmount) * 100).toFixed(1) : '—';
  const isCritical = (a) => parseFloat(pct(a)) >= 100;

  return (
    <div className="p-8 max-w-5xl mx-auto w-full fade-in">
      {/* Header editorial */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface dark:text-[#e1e2e5] mb-2">Notification Center</h1>
          <p className="text-on-surface-variant dark:text-[#a0a3b1] text-lg font-light leading-relaxed max-w-xl">
            Stay informed on your financial movements and critical budget alerts within the Vault.
          </p>
        </div>
        <div className="flex gap-3">
          <button id="toggle-polling"
            onClick={() => setPolling(p => !p)}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${polling ? 'vault-gradient text-white' : 'bg-surface-container-lowest dark:bg-[#1e2230] border border-outline-variant/20 text-on-surface dark:text-[#e1e2e5]'}`}>
            {polling ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button id="refresh-notifications" onClick={() => fetchAlerts()}
            className="px-5 py-2.5 rounded-lg bg-surface-container-lowest dark:bg-[#1e2230] border border-outline-variant/20 dark:border-[#2a2d38] text-xs font-bold uppercase tracking-widest text-on-surface dark:text-[#e1e2e5] hover:bg-surface-container transition-colors">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <span className={`w-2 h-2 rounded-full ${polling ? 'bg-green-500 animate-pulse' : 'bg-outline'}`}></span>
        <span className="text-xs font-medium text-on-surface-variant dark:text-[#a0a3b1]">
          {polling ? 'Live — polling every 10s' : 'Paused'} · {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container rounded-lg text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>{error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: alerts */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active alerts header */}
          <div className="flex items-center gap-2 px-2">
            <span className="w-1 h-1 rounded-full bg-error animate-pulse"></span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant dark:text-[#a0a3b1]">Active Budget Alerts</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-4">
              <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm">Connecting to alert stream…</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-surface-container-lowest dark:bg-[#1e2230] rounded-2xl border border-outline-variant/10 dark:border-[#2a2d38] p-12 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-5xl opacity-30 mb-4 text-on-surface-variant">notifications_off</span>
              <p className="font-bold text-on-surface dark:text-[#e1e2e5] mb-1">All Clear</p>
              <p className="text-sm text-on-surface-variant dark:text-[#a0a3b1]">No budget alerts yet. They will appear here in real-time once triggered.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, i) => {
                const p = pct(alert);
                const crit = isCritical(alert);
                return (
                  <div key={i} className={`bg-surface-container-lowest dark:bg-[#1e2230] p-6 rounded-xl border relative overflow-hidden ${crit ? 'border-error/20 dark:border-red-900/30' : 'border-outline-variant/10 dark:border-[#2a2d38]'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${crit ? 'bg-error' : 'bg-tertiary'}`}></div>
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${crit ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
                        <span className="material-symbols-outlined icon-filled">{crit ? 'warning' : 'account_balance'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-on-surface dark:text-[#e1e2e5]">
                            Budget {crit ? 'Exceeded' : 'Warning'} — {alert.category}
                          </h3>
                          <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded ml-2 flex-shrink-0 ${crit ? 'text-error bg-error-container' : 'text-tertiary bg-tertiary-fixed/50'}`}>
                            {crit ? 'Critical' : '⚠ 90%+'}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant dark:text-[#a0a3b1] mb-4 leading-relaxed">
                          {alert.monthYear} · Spent <strong className={crit ? 'text-error' : 'text-tertiary'}>₹{alert.currentSpend?.toLocaleString('en-IN')}</strong> of 
                          {' '}limit <strong>₹{alert.limitAmount?.toLocaleString('en-IN')}</strong> ({p}%)
                        </p>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-surface-container dark:bg-[#25282f] rounded-full overflow-hidden mb-3">
                          <div className={`h-full rounded-full transition-all ${crit ? 'bg-error' : 'bg-tertiary'}`} style={{width:`${Math.min(100, parseFloat(p))}%`}}></div>
                        </div>

                        <p className="text-[10px] text-outline">Received · {fmtTime(alert.receivedAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* System section */}
          {!loading && (
            <section className="mt-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant dark:text-[#a0a3b1] mb-4 px-2">System &amp; Security</h2>
              <div className="bg-surface-container-low dark:bg-[#1a1d26] rounded-2xl p-2 space-y-2">
                {[
                  { icon: 'verified_user', cls: 'text-primary bg-primary/10', title: '2FA Verification Successful', sub: "Security key 'Vault-Key-01' was used to authorize a transfer.", time: 'Yesterday' },
                  { icon: 'update', cls: 'text-secondary bg-secondary/10',    title: 'System Upgrade Scheduled', sub: 'Scheduled maintenance for next Sunday, 02:00 - 04:00 UTC.', time: 'Today' },
                ].map(({ icon, cls, title, sub, time }) => (
                  <div key={title} className="bg-surface-container-lowest dark:bg-[#1e2230] p-4 rounded-xl flex items-center gap-4 hover:bg-white dark:hover:bg-[#25282f] transition-all">
                    <span className={`material-symbols-outlined p-2 rounded-lg ${cls}`}>{icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{title}</p>
                      <p className="text-xs text-on-surface-variant dark:text-[#a0a3b1]">{sub}</p>
                    </div>
                    <span className="text-[10px] text-outline font-medium flex-shrink-0">{time}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: monthly trend */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant dark:text-[#a0a3b1]">Activity Summary</h2>
          </div>

          {/* Monthly trend card */}
          <div className="vault-gradient p-6 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Alerts This Session</h4>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-black">{alerts.length}</span>
              <span className="text-xs font-medium opacity-70 pb-1">budget breach events</span>
            </div>
            <div className="flex gap-1.5 h-14 items-end">
              {[40, 60, 30, 80, 70, 90, 100].map((h, i) => (
                <div key={i} style={{height:`${h}%`}} className={`flex-1 rounded-sm ${i === 6 ? 'bg-white' : `bg-white/${20 + i * 10}`}`}></div>
              ))}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest dark:bg-[#1e2230] p-5 rounded-xl border border-outline-variant/10 dark:border-[#2a2d38]">
              <p className="text-[10px] font-bold text-outline uppercase tracking-tighter">Critical</p>
              <p className="text-2xl font-black text-error mt-1">{alerts.filter(isCritical).length}</p>
            </div>
            <div className="bg-surface-container-lowest dark:bg-[#1e2230] p-5 rounded-xl border border-outline-variant/10 dark:border-[#2a2d38]">
              <p className="text-[10px] font-bold text-outline uppercase tracking-tighter">Warnings</p>
              <p className="text-2xl font-black text-tertiary mt-1">{alerts.filter(a => !isCritical(a)).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-outline-variant/10 dark:border-[#2a2d38] flex flex-col md:flex-row items-center justify-between text-[10px] text-outline uppercase tracking-widest font-bold gap-4">
        <p>© 2024 The Vault — Advanced Cryptographic Security</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">System Status</a>
          <a href="#" className="hover:text-primary transition-colors">Audit Logs</a>
        </div>
      </footer>
    </div>
  );
}
