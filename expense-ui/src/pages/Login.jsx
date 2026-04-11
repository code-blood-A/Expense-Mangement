import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.username, form.password);
      else await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-surface dark:bg-[#0f1115]">
      {/* Left decorative panel */}
      <section className="hidden md:flex w-1/2 relative bg-surface-container-low dark:bg-[#13151f] items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-fixed-dim blur-3xl"></div>
          <div className="absolute bottom-24 right-12 w-64 h-64 rounded-full bg-secondary-container blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <div className="mb-12">
            {/* Minimalist vault illustration */}
            <div className="w-64 h-64 rounded-3xl vault-gradient flex items-center justify-center mx-auto shadow-2xl">
              <span className="material-symbols-outlined text-white icon-filled" style={{fontSize:'8rem'}}>account_balance</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface dark:text-[#e1e2e5] mb-4">The Ethereal Vault</h1>
          <p className="text-on-surface-variant dark:text-[#a0a3b1] leading-relaxed">
            Architectural security for your digital assets. Experience a sanctuary designed for absolute peace of mind.
          </p>
          <div className="mt-16 flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-primary">256-bit</span>
              <span className="text-xs uppercase tracking-widest text-outline">Encryption</span>
            </div>
            <div className="h-8 w-px bg-outline-variant/30"></div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-primary">Biometric</span>
              <span className="text-xs uppercase tracking-widest text-outline">Standard</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right: Auth form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 bg-surface-container-lowest dark:bg-[#0f1115]">
        <div className="w-full max-w-md fade-in">
          {/* Mobile header */}
          <div className="md:hidden mb-12 flex flex-col items-center text-center">
            <div className="w-12 h-12 vault-gradient rounded-lg flex items-center justify-center text-white mb-4">
              <span className="material-symbols-outlined icon-filled">lock</span>
            </div>
            <h2 className="text-2xl font-black tracking-tighter">The Vault</h2>
          </div>

          {/* Tab switcher */}
          <div className="mb-8 flex gap-6 border-b border-outline-variant/30 dark:border-[#2a2d38]">
            <button
              id="tab-login"
              onClick={() => { setMode('login'); setError(''); }}
              className={`pb-3 text-sm font-bold transition-colors ${mode === 'login' ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-on-surface'}`}
            >Welcome Back</button>
            <button
              id="tab-register"
              onClick={() => { setMode('register'); setError(''); }}
              className={`pb-3 text-sm font-bold transition-colors ${mode === 'register' ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-on-surface'}`}
            >Create Account</button>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-on-surface dark:text-[#e1e2e5] tracking-tight mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Join the Vault'}
            </h2>
            <p className="text-on-surface-variant dark:text-[#a0a3b1] text-sm">
              {mode === 'login' ? 'Securely access your premium management dashboard.' : 'Create your account to start managing wealth.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-error-container rounded-lg text-on-error-container text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>{error}
            </div>
          )}

          <form id="auth-form" className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline dark:text-[#747688] mb-1.5 ml-1">Username</label>
              <input
                id="input-username"
                name="username"
                type="text"
                placeholder="your_username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 bg-surface-container-low dark:bg-[#1a1d26] border-none rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface dark:text-[#e1e2e5] placeholder:text-outline/50 transition-all outline-none"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-outline dark:text-[#747688] mb-1.5 ml-1">Email Address</label>
                <input
                  id="input-email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 bg-surface-container-low dark:bg-[#1a1d26] border-none rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface dark:text-[#e1e2e5] placeholder:text-outline/50 transition-all outline-none"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="text-xs font-bold uppercase tracking-wider text-outline dark:text-[#747688]">Password</label>
                {mode === 'login' && <button type="button" className="text-xs font-bold text-primary hover:opacity-80">Forgot?</button>}
              </div>
              <div className="relative">
                <input
                  id="input-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 bg-surface-container-low dark:bg-[#1a1d26] border-none rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface dark:text-[#e1e2e5] placeholder:text-outline/50 transition-all outline-none pr-12"
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline">
                  <span className="material-symbols-outlined text-[20px]">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              id="submit-auth"
              type="submit"
              disabled={loading}
              className="w-full py-4 vault-gradient text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing…' : (mode === 'login' ? 'Sign In to Vault' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant dark:text-[#a0a3b1] text-sm">
              {mode === 'login' ? 'New to the Vault? ' : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-primary font-bold hover:underline ml-1"
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-4 text-[10px] uppercase tracking-widest text-outline font-bold">
            <a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a>
            <span className="text-outline-variant/50">•</span>
            <a href="#" className="hover:text-on-surface transition-colors">Terms of Service</a>
          </div>
        </div>
      </section>
    </main>
  );
}
