import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // feel natural

    let result;
    if (mode === 'login') {
      result = login(email, password);
    } else {
      if (!name.trim()) {
        setError('Please enter your name.');
        setLoading(false);
        return;
      }
      result = register(name, email, password);
    }

    if (result.success) {
      navigate('/feed');
    } else {
      setError(result.error ?? 'Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F76902]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F76902] shadow-2xl shadow-orange-900/50 mb-4">
            <span className="text-3xl">🐯</span>
          </div>
          <h1 className="text-white" style={{ fontWeight: 800, fontSize: '1.75rem' }}>
            Tiger<span className="text-[#F76902]">Tail</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">The RIT micro-economy. Exclusively for Tigers.</p>
        </div>

        {/* Card */}
        <div className="bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] p-8 shadow-2xl">
          {/* Mode Toggle */}
          <div className="flex rounded-xl bg-[#0F0F0F] p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  mode === m
                    ? 'bg-[#F76902] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={{ fontWeight: 600 }}
              >
                {m === 'login' ? 'Sign In' : 'Join TigerTail'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5" style={{ fontWeight: 500 }}>Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Tiger McStudy"
                  required
                  className="w-full bg-[#0F0F0F] border border-[#3C3C3E] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1.5" style={{ fontWeight: 500 }}>RIT Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="abc1234@rit.edu"
                  required
                  className="w-full bg-[#0F0F0F] border border-[#3C3C3E] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                />
                {email.includes('@') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {email.endsWith('@rit.edu')
                      ? <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      : <ShieldCheck className="w-4 h-4 text-red-400" />
                    }
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">Must be a valid @rit.edu address</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5" style={{ fontWeight: 500 }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0F0F0F] border border-[#3C3C3E] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#F76902] text-white hover:bg-[#e05e00] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-900/30 mt-2"
              style={{ fontWeight: 600 }}
            >
              {loading
                ? '...'
                : mode === 'login'
                  ? 'Sign In to TigerTail'
                  : 'Create My Account'
              }
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-5 p-3 rounded-xl bg-[#F76902]/5 border border-[#F76902]/10">
              <p className="text-xs text-gray-500 text-center">
                <span className="text-[#F76902]" style={{ fontWeight: 600 }}>Demo:</span>{' '}
                Try <code className="text-gray-400">am1234@rit.edu</code> with any password
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          TigerTail is a student-to-student platform. TigerCredits are exchanged off-platform.
          <br />Not affiliated with RIT administration.
        </p>
      </div>
    </div>
  );
}
