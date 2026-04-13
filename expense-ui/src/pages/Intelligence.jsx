import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosClient';

/* ── Category icon mapping ── */
const CAT_ICONS = {
  Food: 'restaurant',
  Shopping: 'shopping_bag',
  Travel: 'flight',
  Utilities: 'bolt',
  Healthcare: 'local_hospital',
  Entertainment: 'movie',
  Education: 'school',
  'Money Transfer': 'payments',
  'Bill Payments': 'receipt',
  'Metro Recharge': 'subway',
  MISCELLANEOUS: 'category',
};

function catIcon(cat = '') {
  return CAT_ICONS[cat] ?? 'category';
}

/* ── Tiny sparkline bar ── */
function MiniBar({ pct, color = 'bg-primary' }) {
  return (
    <div className="w-full bg-surface-container dark:bg-[#25282f] h-1.5 rounded-full overflow-hidden">
      <div
        className={`${color} h-full rounded-full transition-all duration-700`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

/* ── Animated count-up number display ── */
function MoneyLabel({ value, className = '' }) {
  const fmt = (v) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  return <span className={className}>₹{fmt(value ?? 0)}</span>;
}

/* ── Skeleton shimmer ── */
function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-container dark:bg-[#25282f] ${className}`}
    />
  );
}

/* ── Month picker helper: returns YYYY-MM string for current month ── */
function thisMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function buildMonthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    opts.push({ val, label });
  }
  return opts;
}

/* ══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════ */
export default function Intelligence() {
  const [month, setMonth] = useState(thisMonth);
  const monthOptions = buildMonthOptions();

  /* API state */
  const [monthly, setMonthly] = useState(null);
  const [topCat, setTopCat] = useState(null);
  const [trend, setTrend] = useState([]);
  const [compare, setCompare] = useState(null);
  const [insight, setInsight] = useState(null);
  const [breakdown, setBreakdown] = useState([]);

  const [loading, setLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [error, setError] = useState('');

  /* ── Fetch all metrics (Stale-While-Revalidate pattern) ── */
  const fetchMetrics = useCallback(async (m) => {
    setLoading(true);
    setError('');
    // Note: We don't wipe existing state here to prevent UI flickering/disappearance
    try {
      const [mRes, tRes, trRes, cRes] = await Promise.all([
        api.get(`/api/analysis/monthly-spend?month=${m}`),
        api.get(`/api/analysis/top-category?month=${m}`),
        api.get(`/api/analysis/trend?months=6`),
        api.get(`/api/analysis/compare?month=${m}`),
      ]);
      setMonthly(mRes.data);
      setTopCat(tRes.data);
      setTrend(trRes.data ?? []);
      setCompare(cRes.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load analysis metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Fetch Category Breakdown (Dedicated API) ── */
  const fetchBreakdown = useCallback(async (m) => {
    setBreakdownLoading(true);
    try {
      const { data } = await api.get(`/api/analysis/breakdown?month=${m}`);
      setBreakdown(data ?? []);
    } catch (e) {
      console.error('Failed to fetch breakdown', e);
    } finally {
      setBreakdownLoading(false);
    }
  }, []);

  /* ── Fetch AI insight separately ── */
  const fetchInsight = useCallback(async (m) => {
    setInsightLoading(true);
    try {
      const { data } = await api.get(`/api/analysis/insight?month=${m}`);
      setInsight(data);
    } catch (e) {
      setInsight({ insight: 'Vault AI is currently processing your transactions. Please check back shortly.' });
    } finally {
      setInsightLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reset states ONLY when month actually changes to prevent stale data between months
    setMonthly(null); setTopCat(null); setTrend([]); setCompare(null); setInsight(null); setBreakdown([]);
    
    fetchMetrics(month);
    fetchBreakdown(month);
    fetchInsight(month);
  }, [month, fetchMetrics, fetchBreakdown, fetchInsight]);

  /* ── Derived helpers ──*/
  const changeDir = compare?.changeDirection ?? 'UP';
  const changePct = compare?.changePercent ?? '0.0 %';
  const isUp = changeDir === 'UP';

  /* Max trend value for bar scaling */
  const maxTrend = trend.reduce((mx, t) => Math.max(mx, t.totalSpend ?? 0), 1);

  /* Total aggregate from breakdown */
  const totalBreak = breakdown.reduce((s, b) => s + (b.amount ?? 0), 0) || 1;


  return (
    <div className="p-8 lg:p-10 space-y-10 fade-in">

      {/* ══ PAGE HEADER ══ */}
      <header className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-1">
            Monthly Intel
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface dark:text-[#e1e2e5]">
            Intelligence Canvas
          </h1>
        </div>

        {/* Month picker */}
        <div className="flex items-center gap-3 bg-surface-container-lowest dark:bg-[#1e2230] border border-outline-variant/20 dark:border-[#2a2d38] px-4 py-2 rounded-lg">
          <span className="material-symbols-outlined text-outline text-base">calendar_today</span>
          <select
            id="month-picker"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent text-sm font-bold text-on-surface dark:text-[#e1e2e5] outline-none cursor-pointer"
          >
            {monthOptions.map(({ val, label }) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <span className="material-symbols-outlined text-outline text-base">expand_more</span>
        </div>
      </header>

      {/* ══ ERROR BANNER ══ */}
      {error && (
        <div className="p-4 bg-error-container/30 dark:bg-red-900/20 text-on-error-container dark:text-red-400 rounded-xl text-sm flex items-center gap-3 border border-error/20">
          <span className="material-symbols-outlined">error</span>
          {error}
          <button
            onClick={() => { fetchMetrics(month); fetchInsight(month); }}
            className="ml-auto text-xs font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ══ HERO SECTION ══ */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

        {/* ── Main Visualization Card ── */}
        <div className="md:col-span-8 bg-surface-container-lowest dark:bg-[#1e2230] rounded-xl p-8 editorial-shadow border border-outline-variant/10 dark:border-[#2a2d38] relative overflow-hidden">

          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <p className="text-on-surface-variant dark:text-[#a0a3b1] text-sm font-medium mb-1">
                Total Spent — {monthOptions.find(o => o.val === month)?.label}
              </p>
              {loading ? (
                <Skeleton className="h-12 w-52 mt-2" />
              ) : (
                <div className="flex items-baseline gap-3">
                  <MoneyLabel
                    value={monthly?.totalSpend}
                    className="text-4xl lg:text-5xl font-black tracking-tighter text-on-surface dark:text-[#e1e2e5]"
                  />
                  {compare && (
                    <span className={`font-bold text-sm flex items-center gap-0.5 ${isUp ? 'text-error' : 'text-green-500'}`}>
                      <span className="material-symbols-outlined text-sm">
                        {isUp ? 'trending_up' : 'trending_down'}
                      </span>
                      {changePct}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Trend sparkline bars ── */}
          <div className="relative z-10">
            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-3">
              6-Month Trend
            </p>
            {loading ? (
              <div className="flex items-end gap-2 h-28">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="flex-1 rounded-t-sm animate-pulse" style={{ height: `${40 + i * 10}%` }} />
                ))}
              </div>
            ) : (
              <div className="flex items-end gap-1.5 h-28 w-full">
                {trend.map((t, i) => {
                  const isCurrentMonth = t.month === month;
                  const pct = ((t.totalSpend ?? 0) / maxTrend) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface dark:bg-[#e1e2e5] text-surface dark:text-on-surface text-[9px] px-2 py-1 rounded whitespace-nowrap font-bold opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        ₹{(t.totalSpend ?? 0).toFixed(0)} · {t.month}
                      </div>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${isCurrentMonth
                            ? 'bg-primary shadow-[0_0_12px_rgba(46,91,255,0.35)]'
                            : 'bg-surface-container dark:bg-[#2a2d38] hover:bg-primary/30'
                          }`}
                        style={{ height: `${Math.max(pct, 8)}%` }}
                      />
                    </div>
                  );
                })}
                {/* Future placeholder bars */}
                <div className="flex-1 bg-outline-variant/20 dark:bg-[#1a1d26] h-[20%] rounded-t-sm border-t-2 border-dashed border-outline-variant/40" />
                <div className="flex-1 bg-outline-variant/20 dark:bg-[#1a1d26] h-[20%] rounded-t-sm border-t-2 border-dashed border-outline-variant/40" />
              </div>
            )}

            {/* Month labels */}
            <div className="flex gap-1.5 mt-2">
              {trend.map((t, i) => (
                <div key={i} className={`flex-1 text-center text-[8px] font-bold truncate ${t.month === month ? 'text-primary' : 'text-outline/60'}`}>
                  {t.month?.slice(5)}
                </div>
              ))}
              <div className="flex-1" /><div className="flex-1" />
            </div>
          </div>
        </div>

        {/* ── AI Insight Card ── */}
        <div className="md:col-span-4 self-start">
          <div className="bg-primary p-1 rounded-xl shadow-2xl shadow-primary/20">
            <div className="bg-primary p-6 rounded-lg text-on-primary dark:text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-xl icon-filled">auto_awesome</span>
                <span className="font-bold text-xs tracking-widest uppercase">Elara Intelligence</span>
              </div>

              {insightLoading ? (
                <div className="space-y-2 mb-6">
                  <div className="h-3 w-full bg-white/20 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-white/20 rounded animate-pulse" />
                  <div className="h-3 w-4/6 bg-white/20 rounded animate-pulse" />
                  <div className="h-3 w-full bg-white/20 rounded animate-pulse" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed font-medium mb-6 opacity-90">
                  "{insight?.insight ?? 'Fetching AI insights for your spending patterns…'}"
                </p>
              )}

              <button
                id="refresh-insight"
                onClick={() => fetchInsight(month)}
                disabled={insightLoading}
                className="w-full bg-on-primary text-primary py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-60"
              >
                {insightLoading ? 'Analyzing…' : 'Refresh Insight'}
              </button>
            </div>
          </div>

          {/* ── Top Category Card (below AI card) ── */}
          <div className="mt-4 bg-surface-container-lowest dark:bg-[#1e2230] rounded-xl p-5 border border-outline-variant/10 dark:border-[#2a2d38] editorial-shadow">
            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-3">
              Top Category
            </p>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined">{catIcon(topCat?.category)}</span>
                </div>
                <div>
                  <p className="text-lg font-black text-on-surface dark:text-[#e1e2e5] tracking-tight">
                    {topCat?.category ?? '—'}
                  </p>
                  <MoneyLabel value={topCat?.amount} className="text-xs font-bold text-on-surface-variant dark:text-[#a0a3b1]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ CATEGORY BREAKDOWN + COMPARISON ══ */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* ── Category Breakdown table ── */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-xl font-bold tracking-tight text-on-surface dark:text-[#e1e2e5]">
              Category Breakdown
            </h3>
            <button
              id="refresh-categories"
              onClick={() => fetchBreakdown(month)}
              className="text-primary text-xs font-bold uppercase tracking-widest hover:underline"
            >
              Refresh
            </button>
          </div>

          <div className="bg-surface-container-lowest dark:bg-[#1e2230] rounded-xl overflow-hidden border border-outline-variant/10 dark:border-[#2a2d38] editorial-shadow">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/60 dark:bg-[#25282f]/60">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-[0.15em]">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-[0.15em] text-right">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-[0.15em] text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 dark:divide-[#2a2d38]">
                {breakdownLoading && breakdown.length === 0 ? (
                  [1, 2, 3, 4].map(i => (
                    <tr key={i}>
                      <td className="px-6 py-5"><Skeleton className="h-9 w-full" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-20 ml-auto" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-14 ml-auto" /></td>
                    </tr>
                  ))
                ) : breakdown.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                      No transaction data for this month.
                    </td>
                  </tr>
                ) : (
                  breakdown.map((b, i) => {
                    const sharePct = ((b.amount ?? 0) / totalBreak) * 100;
                    return (
                      <tr
                        key={i}
                        className="hover:bg-surface-container-low/30 dark:hover:bg-[#25282f]/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-surface-container dark:bg-[#25282f] flex items-center justify-center text-primary flex-shrink-0">
                              <span className="material-symbols-outlined text-xl">{catIcon(b.category)}</span>
                            </div>
                            <div>
                              <span className="font-bold text-sm text-on-surface dark:text-[#e1e2e5]">{b.category}</span>
                              <div className="mt-1 w-24">
                                <MiniBar pct={sharePct} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-sm text-on-surface dark:text-[#e1e2e5]">
                          <MoneyLabel value={b.amount} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-xs bg-primary/10 dark:bg-primary/20 text-primary px-2 py-1 rounded">
                            {sharePct.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>


        {/* ── Right column: Comparison + Export ── */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight text-on-surface dark:text-[#e1e2e5] px-1">
            Trend Comparison
          </h3>

          {/* Month vs Month card */}
          <div className="bg-surface-container-lowest dark:bg-[#1e2230] p-6 rounded-xl border border-outline-variant/10 dark:border-[#2a2d38] editorial-shadow relative group hover:border-primary/20 transition-all">
            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">
              Vs. Previous Month
            </p>
            {loading ? (
              <Skeleton className="h-16 w-full mb-4" />
            ) : (
              <>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <p className={`text-2xl font-black ${isUp ? 'text-error' : 'text-green-500'}`}>
                      {isUp ? '+' : '-'}
                      <MoneyLabel value={Math.abs((compare?.currentSpend ?? 0) - (compare?.previousSpend ?? 0))} />
                    </p>
                    <p className="text-xs font-medium text-on-surface-variant dark:text-[#a0a3b1]">
                      {isUp ? 'Spending Increase' : 'Spending Decrease'}
                    </p>
                  </div>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${isUp ? 'bg-error/10 text-error' : 'bg-green-500/10 text-green-500'}`}>
                    <span className="material-symbols-outlined">{isUp ? 'trending_up' : 'trending_down'}</span>
                  </div>
                </div>

                {/* Two-tone progress bar */}
                <div className="w-full bg-surface-container dark:bg-[#25282f] h-2 rounded-full overflow-hidden">
                  <div
                    className={`${isUp ? 'bg-error' : 'bg-green-500'} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(parseFloat(changePct), 100)}%` }}
                  />
                </div>
                <p className={`mt-2 text-[10px] font-black uppercase ${isUp ? 'text-error' : 'text-green-500'}`}>
                  {changePct} vs {compare?.previousMonth}
                </p>
              </>
            )}
          </div>

          {/* Current vs Prev amounts card */}
          <div className="bg-surface-container-lowest dark:bg-[#1e2230] p-6 rounded-xl border border-outline-variant/10 dark:border-[#2a2d38] editorial-shadow">
            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">
              Monthly Figures
            </p>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-on-surface-variant dark:text-[#a0a3b1]">
                    {compare?.currentMonth}
                  </span>
                  <MoneyLabel value={compare?.currentSpend} className="text-sm font-black text-on-surface dark:text-[#e1e2e5]" />
                </div>
                <MiniBar pct={100} color="bg-primary" />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs font-medium text-on-surface-variant dark:text-[#a0a3b1]">
                    {compare?.previousMonth}
                  </span>
                  <MoneyLabel value={compare?.previousSpend} className="text-sm font-black text-on-surface dark:text-[#e1e2e5]" />
                </div>
                <MiniBar
                  pct={compare?.currentSpend > 0 ? ((compare?.previousSpend ?? 0) / compare?.currentSpend) * 100 : 50}
                  color="bg-outline-variant dark:bg-[#3a3e4d]"
                />
              </div>
            )}
          </div>

          {/* Export */}
          <button
            id="export-analysis"
            onClick={() => {
              const data = { month, monthly, topCat, trend, compare, insight };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `analysis-${month}.json`; a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full bg-surface-container-low dark:bg-[#25282f] text-on-surface dark:text-[#e1e2e5] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container dark:hover:bg-[#2e3240] transition-all border border-outline-variant/10 dark:border-[#2a2d38]"
          >
            <span className="material-symbols-outlined text-lg">ios_share</span>
            Export Analysis
          </button>
        </div>
      </section>

      {/* ══ VAULT AI INSIGHT — FULL RESPONSE SECTION ══ */}
      <section id="vault-ai-insight-section" className="space-y-6">
        {/* Section header */}
        <div className="flex items-end justify-between px-1 flex-wrap gap-3">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-1">
              AI · {monthOptions.find(o => o.val === month)?.label}
            </span>
            <h3 className="text-xl font-bold tracking-tight text-on-surface dark:text-[#e1e2e5]">
              Vault AI Insight Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="copy-insight"
              onClick={() => {
                const text = insight?.insight ?? '';
                navigator.clipboard.writeText(text).catch(() => { });
              }}
              disabled={!insight?.insight}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-on-surface-variant dark:text-[#a0a3b1] bg-surface-container-low dark:bg-[#25282f] hover:bg-surface-container dark:hover:bg-[#2e3240] rounded-lg border border-outline-variant/10 dark:border-[#2a2d38] transition-all disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              Copy
            </button>
            <button
              id="refresh-insight-section"
              onClick={() => fetchInsight(month)}
              disabled={insightLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 rounded-lg transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${insightLoading ? 'animate-spin' : ''}`}>
                {insightLoading ? 'refresh' : 'auto_awesome'}
              </span>
              {insightLoading ? 'Analyzing…' : 'Regenerate'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: AI Narrative Text ── (3/5 width) */}
          <div className="lg:col-span-3 bg-surface-container-lowest dark:bg-[#1e2230] rounded-xl border border-outline-variant/10 dark:border-[#2a2d38] editorial-shadow overflow-hidden">
            {/* Card top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-[#2e5bff] to-primary/40" />
            <div className="p-8">
              {/* Source badge */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-base icon-filled">auto_awesome</span>
                </div>
                <div>
                  <p className="text-xs font-black text-on-surface dark:text-[#e1e2e5] uppercase tracking-widest leading-none">
                    Elara Intelligence
                  </p>
                  <p className="text-[10px] text-on-surface-variant dark:text-[#a0a3b1] mt-0.5">
                    GET /api/analysis/insight · {monthOptions.find(o => o.val === month)?.label}
                  </p>
                </div>
                {/* Live dot */}
                {!insightLoading && insight && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Live</span>
                  </div>
                )}
              </div>

              {/* AI Text */}
              {insightLoading ? (
                <div className="space-y-3">
                  {[100, 90, 80, 95, 70].map((w, i) => (
                    <div
                      key={i}
                      className="h-3.5 bg-surface-container dark:bg-[#25282f] rounded-full animate-pulse"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              ) : (
                <blockquote className="relative">
                  {/* Opening quote mark */}
                  <span className="absolute -top-3 -left-2 text-6xl font-black text-primary/10 dark:text-primary/20 leading-none select-none pointer-events-none">
                    "
                  </span>
                  <p className="text-on-surface dark:text-[#e1e2e5] text-base leading-relaxed font-medium pl-4 relative z-10">
                    {insight?.insight ?? 'Fetching AI insight for this month…'}
                  </p>
                </blockquote>
              )}

              {/* Month tag footer */}
              {!insightLoading && insight && (
                <div className="mt-6 pt-4 border-t border-outline-variant/10 dark:border-[#2a2d38] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                    Analysis Period: {insight.month}
                  </span>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded">
                    {breakdown.length} categories tracked
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Category Breakdown from insight response ── (2/5 width) */}
          <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-[#1e2230] rounded-xl border border-outline-variant/10 dark:border-[#2a2d38] editorial-shadow overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-outline-variant/30 via-primary/30 to-outline-variant/10" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-black text-outline uppercase tracking-widest">
                  Breakdown
                </p>
                <span className="material-symbols-outlined text-outline text-base">pie_chart</span>
              </div>

              {breakdownLoading && breakdown.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : breakdown.length === 0 ? (

                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-outline/30">bar_chart</span>
                  <p className="text-sm text-on-surface-variant dark:text-[#a0a3b1]">
                    No breakdown available yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {breakdown.map((b, i) => {
                    const sharePct = ((b.amount ?? 0) / totalBreak) * 100;
                    // Cycle through accent colours for visual variety
                    const barColors = [
                      'bg-primary',
                      'bg-[#2e5bff]',
                      'bg-tertiary',
                      'bg-secondary',
                      'bg-green-500',
                      'bg-amber-500',
                    ];
                    const bar = barColors[i % barColors.length];
                    return (
                      <div key={i} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-on-surface-variant dark:text-[#a0a3b1]">
                              {catIcon(b.category)}
                            </span>
                            <span className="text-sm font-bold text-on-surface dark:text-[#e1e2e5]">
                              {b.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MoneyLabel
                              value={b.amount}
                              className="text-xs font-black text-on-surface dark:text-[#e1e2e5]"
                            />
                            <span className="text-[10px] font-bold text-outline w-10 text-right">
                              {sharePct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        {/* Stacked bar */}
                        <div className="w-full h-2 bg-surface-container dark:bg-[#25282f] rounded-full overflow-hidden">
                          <div
                            className={`${bar} h-full rounded-full transition-all duration-700 group-hover:opacity-80`}
                            style={{ width: `${Math.max(sharePct, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Total row */}
                  <div className="pt-3 mt-1 border-t border-outline-variant/10 dark:border-[#2a2d38] flex items-center justify-between">
                    <span className="text-[10px] font-black text-outline uppercase tracking-widest">Total</span>
                    <MoneyLabel
                      value={totalBreak}
                      className="text-sm font-black text-on-surface dark:text-[#e1e2e5]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER EDITORIAL ══ */}
      <footer className="pt-10 pb-24 border-t border-outline-variant/10 dark:border-[#2a2d38]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-3">
            <h4 className="text-2xl font-black tracking-tight leading-tight text-on-surface dark:text-[#e1e2e5]">
              Elite financial insights for the next generation of wealth managers.
            </h4>
            <p className="text-on-surface-variant dark:text-[#a0a3b1] text-sm leading-relaxed max-w-sm">
              Ethereal Vault's AnalysisMS queries your live transaction database to compute spending intelligence in real-time.
            </p>
          </div>
          <div className="relative h-44 bg-surface-container-lowest dark:bg-[#1e2230] rounded-xl overflow-hidden border border-outline-variant/10 dark:border-[#2a2d38] editorial-shadow">
            {/* Decorative mini-bar background */}
            <div className="absolute inset-0 flex items-end gap-1 px-4 pb-4 opacity-20">
              {trend.map((t, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary rounded-t-sm"
                  style={{ height: `${Math.max(((t.totalSpend ?? 0) / maxTrend) * 80, 8)}%` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col justify-center px-8">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">System Status</p>
              <p className="text-lg font-bold text-on-surface dark:text-[#e1e2e5]">Intelligence Engines Live</p>
              <p className="text-xs font-medium text-on-surface-variant dark:text-[#a0a3b1]">
                Powered by AnalysisMS · port 8086 · shared expense_db
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
