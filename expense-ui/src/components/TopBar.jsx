import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ searchPlaceholder = 'Search Vault…' }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center px-8 py-4 sticky top-0 z-40 bg-[#f8f9fb]/80 dark:bg-[#0f1115]/80 backdrop-blur-xl border-b border-[#c4c5d9]/20 font-sans font-medium">
      {/* Left: search */}
      <div className="flex items-center gap-6">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-lg">search</span>
          <input
            id="topbar-search"
            className="pl-10 pr-4 py-2 bg-surface-container-low dark:bg-[#1a1d26] rounded-full border-none focus:ring-1 focus:ring-primary/40 w-64 text-sm outline-none text-on-surface dark:text-[#e1e2e5] placeholder:text-outline"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-5">
        <button className="text-on-surface-variant hover:opacity-80 transition-opacity text-sm font-medium">Support</button>

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          onClick={toggle}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-xl">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        {/* Notifications bell */}
        <button className="relative text-on-surface-variant hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* Avatar */}
        {user && (
          <div
            onClick={() => { logout(); navigate('/login'); }}
            title="Sign out"
            className="w-8 h-8 rounded-full vault-gradient flex items-center justify-center text-white font-bold text-xs cursor-pointer"
          >
            {user.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
        )}
      </div>
    </header>
  );
}
