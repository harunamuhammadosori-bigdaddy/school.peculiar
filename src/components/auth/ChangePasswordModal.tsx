import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface ChangePasswordModalProps {
  token: string;
  onComplete: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ token, onComplete }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to change password.');
      }
      onComplete();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to complete password update.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80" role="dialog" aria-modal="true" aria-labelledby="password-change-title">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-800" />
          <div>
            <h2 id="password-change-title" className="font-bold text-slate-900">Set your password</h2>
            <p className="text-xs text-slate-500">A new password is required before continuing.</p>
          </div>
        </div>
        {error && <p role="alert" className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Temporary password
            <span className="relative block mt-1"><Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg" /></span>
          </label>
          <label className="block text-xs font-semibold text-slate-700">New password (12 characters minimum)
            <input required minLength={12} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Confirm new password
            <input required minLength={12} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg" />
          </label>
          <button type="submit" disabled={isSaving} className="w-full px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg disabled:opacity-60">
            {isSaving ? 'Updating password...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
};