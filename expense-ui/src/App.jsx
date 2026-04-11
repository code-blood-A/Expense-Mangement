import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import Budget from './pages/Budget';
import Notifications from './pages/Notifications';
import Intelligence from './pages/Intelligence';

const TOPBAR_LABELS = {
  '/':               'Search Vault…',
  '/ledger':         'Search ledger…',
  '/budget':         'Search accounts or limits…',
  '/notifications':  'Search activities…',
  '/intelligence':   'Search insights…',
};

function ProtectedLayout({ children, path }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-surface dark:bg-[#0f1115]">
      <Sidebar />
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <TopBar searchPlaceholder={TOPBAR_LABELS[path] ?? 'Search Vault…'} />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}

function MobileNav() {
  const nav = [
    { path: '/',               icon: 'dashboard',              label: 'Home'        },
    { path: '/ledger',         icon: 'receipt_long',           label: 'Txns'        },
    { path: '/budget',         icon: 'account_balance_wallet', label: 'Budget'      },
    { path: '/notifications',  icon: 'notifications',          label: 'Alerts'      },
    { path: '/intelligence',   icon: 'insights',               label: 'Intel'       },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/80 dark:bg-[#0f1115]/80 backdrop-blur-xl border-t border-outline-variant/20 dark:border-[#2a2d38] flex items-center justify-around z-50">
      {nav.map(({ path, icon, label }) => (
        <a key={path} href={path} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
          <span className="text-[10px] font-bold uppercase">{label}</span>
        </a>
      ))}
    </nav>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/"               element={<ProtectedLayout path="/"><Dashboard /></ProtectedLayout>} />
      <Route path="/ledger"          element={<ProtectedLayout path="/ledger"><Ledger /></ProtectedLayout>} />
      <Route path="/budget"          element={<ProtectedLayout path="/budget"><Budget /></ProtectedLayout>} />
      <Route path="/notifications"   element={<ProtectedLayout path="/notifications"><Notifications /></ProtectedLayout>} />
      <Route path="/intelligence"    element={<ProtectedLayout path="/intelligence"><Intelligence /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
