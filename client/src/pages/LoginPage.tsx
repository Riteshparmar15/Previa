import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@littlepearls.in');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExpired = searchParams.get('expired') === '1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@littlepearls.in');
    setPassword('Admin@123');
    setError(null);
    setLoading(true);
    try {
      await login('admin@littlepearls.in', 'Admin@123');
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-primary-700 text-white flex items-center justify-center shadow-md shadow-primary-700/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="font-black text-2xl tracking-tight text-slate-900 block leading-none">Previa</span>
            <span className="text-[11px] font-bold text-primary-800 tracking-wider uppercase block mt-1">Preschool OS</span>
          </div>
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Sign in to your Preschool Workspace</h2>
        <p className="mt-2 text-sm text-slate-600 font-medium">
          New preschool centre?{' '}
          <Link to="/register" className="font-bold text-primary-700 hover:text-primary-800 underline">
            Register your school free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 border border-slate-200 rounded-3xl sm:px-10">
          {/* Quick Demo Login Option Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-teal-800" />
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                1-Click Instant Demo Access
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Little Pearls Preschool, Vadodara (Pooja Shah, Owner)
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              type="button"
              className="w-full py-2.5 px-3 rounded-xl bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Demo Preschool Workspace</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-bold">Or sign in with email</span>
            </div>
          </div>

          {isExpired && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Your session has expired. Please sign in again.
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff / Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@littlepearls.in"
                  className="previa-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary-700 font-bold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="previa-input pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign in to Preschool Desk'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
