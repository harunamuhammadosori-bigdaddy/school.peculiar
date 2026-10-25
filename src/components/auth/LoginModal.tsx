import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { SchoolLogo } from '../SchoolLogo';
import { X, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { ApiClient } from '../../services/apiClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = (roleEmail: string, rolePassword: string) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError(null);
  };

  const showDemoAccounts = true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await ApiClient.login(email, password);

      localStorage.setItem('pcd_token', data.token);
      localStorage.setItem('pcd_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" showText={false} />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                School Portal Authentication
              </h2>
              <p className="text-xs text-emerald-200">
                Peculiar College Doma • Secure Role-Based Access
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@peculiarschools.edu.ng"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating credentials...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {showDemoAccounts && <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Development demo sign-ins</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button type="button" onClick={() => handleQuickLogin('principal@peculiarschools.edu.ng', 'Peculiar@2026')} className="text-left p-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs transition-colors">
                <span className="font-bold text-teal-950 block">Principal</span>
                <span className="text-[10px] text-slate-500">Academic oversight</span>
              </button>
              <button type="button" onClick={() => handleQuickLogin('accountant@peculiarschools.edu.ng', 'Peculiar@2026')} className="text-left p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs transition-colors">
                <span className="font-bold text-amber-950 block">Bursar</span>
                <span className="text-[10px] text-slate-500">Fees and receipts</span>
              </button>
              <button type="button" onClick={() => handleQuickLogin('teacher@peculiarschools.edu.ng', 'Peculiar@2026')} className="text-left p-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs transition-colors">
                <span className="font-bold text-blue-950 block">Teacher</span>
                <span className="text-[10px] text-slate-500">Classes and results</span>
              </button>
              <button type="button" onClick={() => handleQuickLogin('parent@peculiarschools.edu.ng', 'Peculiar@2026')} className="text-left p-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs transition-colors">
                <span className="font-bold text-sky-950 block">Parent</span>
                <span className="text-[10px] text-slate-500">Family portal</span>
              </button>
              <button type="button" onClick={() => handleQuickLogin('student@peculiarschools.edu.ng', 'Peculiar@2026')} className="text-left p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs transition-colors">
                <span className="font-bold text-slate-900 block">Student</span>
                <span className="text-[10px] text-slate-500">Student portal</span>
              </button>
              <button type="button" onClick={() => handleQuickLogin('admin@peculiarschools.edu.ng', 'Peculiar@2026')} className="text-left p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs transition-colors">
                <span className="font-bold text-emerald-950 block">Admin</span>
                <span className="text-[10px] text-slate-500">School management</span>
              </button>
              <button type="button" onClick={() => handleQuickLogin('harunamuhammadosori@gmail.com', '@Admin2005')} className="text-left p-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-xs transition-colors col-span-2 sm:col-span-3">
                <span className="font-bold text-red-950 block">Super Admin</span>
                <span className="text-[10px] text-slate-500">System administration</span>
              </button>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
};
