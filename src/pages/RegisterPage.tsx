import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole } from '../types/database';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Lock, Mail, User, Building, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export function RegisterPage() {
  const { signUp } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('organizer');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUp({
        email,
        password,
        fullName: fullName.trim(),
        companyName: companyName.trim() || undefined,
        role,
        city,
      });

      if (res.success) {
        showToast(
          'Registration Successful',
          `Welcome to ReVento as a verified ${role}!`,
          'success'
        );
        navigate(role === 'organizer' ? '/planner' : '/provider-dashboard');
      } else {
        showToast('Registration Error', res.error || 'Could not register user.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto shadow-md">
            <span className="font-extrabold text-white text-xl">R</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Create Your ReVento Account</h2>
          <p className="text-xs text-slate-500">
            Join the coordinated B2B event resource network
          </p>
        </div>

        {/* Role Selection Segmented Control */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Select Account Type *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('organizer')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                role === 'organizer'
                  ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 text-sky-950 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs flex items-center justify-between">
                <span>Event Organizer</span>
                {role === 'organizer' && <Badge variant="info" size="sm">Active</Badge>}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Plan corporate events, match multi-provider gear, submit booking requests
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole('provider')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                role === 'provider'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs flex items-center justify-between">
                <span>Resource Provider</span>
                {role === 'provider' && <Badge variant="success" size="sm">Active</Badge>}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                List equipment inventory, receive requests, accept bookings
              </p>
            </button>
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Studio</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. SoundWave Productions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Business Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="contact@soundwave-events.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating City *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="emerald"
            isLoading={isLoading}
            className="w-full text-xs mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create {role === 'organizer' ? 'Organizer' : 'Provider'} Account
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
