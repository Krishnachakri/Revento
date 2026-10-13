import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Layers } from 'lucide-react';

export function LoginPage() {
  const { signIn, switchDemoAccount, isSupabaseConnected } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signIn(email, password);
      if (res.success) {
        showToast('Signed In', 'Welcome back to ReVento!', 'success');
        navigate('/planner');
      } else {
        showToast('Login Failed', res.error || 'Invalid credentials.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (profileId: string, role: string) => {
    switchDemoAccount(profileId);
    showToast('Switched Persona', `Active session set as ${role}.`, 'success');
    navigate(role === 'organizer' ? '/organizer-dashboard' : '/provider-dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto shadow-md">
            <span className="font-extrabold text-white text-xl">R</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to ReVento</h2>
          <p className="text-xs text-slate-500">
            B2B Event Resource Coordination Platform
          </p>
        </div>

        {/* Quick-Fill Persona Buttons */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Quick Persona Login (Testing & Review):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('usr-organizer-demo', 'organizer')}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-500 text-left transition shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 group-hover:text-sky-700">
                  Aditi Sharma
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Event Organizer</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('usr-provider-apex', 'provider')}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 text-left transition shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                  Karan Mehta
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Audio Provider</p>
            </button>
          </div>
        </div>

        {/* Standard Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="organizer@revento-events.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full text-xs"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In with Supabase Auth
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Register as Organizer or Provider
          </Link>
        </div>
      </div>
    </div>
  );
}
