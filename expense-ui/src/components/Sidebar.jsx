import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path: '/',              label: 'Dashboard',     icon: 'dashboard' },
  { path: '/ledger',       label: 'Transactions',  icon: 'receipt_long' },
  { path: '/budget',       label: 'Budgets',       icon: 'account_balance_wallet' },
  { path: '/notifications', label: 'Notifications', icon: 'notifications' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col h-full py-8 bg-[#f8f9fb] dark:bg-[#0f1115] h-screen w-64 border-r border-[#c4c5d9]/20 font-sans text-sm tracking-tight fixed left-0 top-0 overflow-y-auto z-50">
      {/* Brand */}
      <div className="px-8 mb-10">
        <h1 className="text-xl font-bold tracking-tighter text-[#191c1e] dark:text-[#e1e2e5]">The Vault</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 font-semibold">Premium Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {NAV.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            id={`nav-${label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-[#2E5BFF] font-semibold border-r-2 border-[#2E5BFF] bg-[#f2f4f6] dark:bg-[#1a1d26]'
                  : 'text-[#434656] dark:text-[#a0a3b1] hover:bg-[#edeef0] dark:hover:bg-[#25282f]'
              }`
            }
          >
            <span className={`material-symbols-outlined text-xl`}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Add Expense CTA */}
      <div className="px-6 mt-6 mb-4">
        <button
          id="sidebar-add-expense"
          onClick={() => navigate('/')}
          className="w-full py-3 vault-gradient text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Expense
        </button>
      </div>

      {/* User row */}
      {user && (
        <div className="px-6 mt-2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full vault-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">{user.username}</span>
              <span className="text-[10px] text-on-surface-variant">Tier 1 Member</span>
            </div>
            <button
              id="sidebar-logout"
              onClick={() => { logout(); navigate('/login'); }}
              title="Sign out"
              className="ml-auto text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
