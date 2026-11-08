import React, { useState } from 'react';
import { Lock, ShieldCheck, X } from 'lucide-react';

interface ChangePasswordModalProps {
  token: string;
  onComplete: () => void;
  onClose?: () => void;
  isVoluntary?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  token,
  onComplete,
  onClose,
  isVoluntary = false,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword.length < 6) {
      setError('The new password must be at least 6 characters long.');
      return;
    }
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
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        onComplete();
      }, 900);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to complete password update.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="password-change-title">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 relative">
        {onClose && isVoluntary && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 id="password-change-title" className="font-bold text-slate-900 text-base">
              {isVoluntary ? 'Change Account Password' : 'Set Your Password'}
            </h2>
            <p className="text-xs text-slate-500">
              {isVoluntary
                ? 'Update your password to a private password of your choice.'
                : 'A new password is required before continuing.'}
            </p>
          </div>
        </div>

        {error && <p role="alert" className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg">{error}</p>}
        {success && <p className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg font-medium">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <label className="block text-xs font-semibold text-slate-700">
            Current or default password (Parent Phone for students)
            <span className="relative block mt-1">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                required
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter current password or parent phone"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </span>
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            New password (6 characters minimum)
            <input
              required
              minLength={6}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter new strong password"
              className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Confirm new password
            <input
              required
              minLength={6}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter new password"
              className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </label>
          <div className="pt-2 flex gap-2">
            {onClose && isVoluntary && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg disabled:opacity-60 transition-colors shadow-sm"
            >
              {isSaving ? 'Updating password...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};