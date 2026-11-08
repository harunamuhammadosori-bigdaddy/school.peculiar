import React, { useState } from 'react';
import { SchoolLogo } from '../SchoolLogo';
import {
  X,
  Phone,
  KeyRound,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { ApiClient } from '../../services/apiClient';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLoginPrefill: (identifier: string, newPassword: string) => void;
  initialIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccessLoginPrefill,
  initialIdentifier = '',
}) => {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [step, setStep] = useState<'REQUEST_OTP' | 'VERIFY_OTP' | 'SUCCESS'>('REQUEST_OTP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP & Reset state
  const [maskedPhone, setMaskedPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await ApiClient.requestPasswordResetOtp(identifier);
      setMaskedPhone(res.maskedPhone);
      setStudentName(res.studentName);
      if (res.demoOtp) {
        setSimulatedOtp(res.demoOtp);
      }
      setStep('VERIFY_OTP');
    } catch (err: any) {
      setError(err.message || 'Unable to request password reset code. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('The passwords you entered do not match.');
      return;
    }

    setLoading(true);

    try {
      await ApiClient.verifyPasswordResetOtp(identifier, otpInput, newPassword);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishAndLogin = () => {
    onSuccessLoginPrefill(identifier, newPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" showText={false} />
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Student Password Recovery
              </h2>
              <p className="text-xs text-emerald-200">
                Peculiar College Doma • Parent Phone OTP Verification
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Identifier & Request OTP */}
          {step === 'REQUEST_OTP' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Secure Parent Verification</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Enter your student admission number or school email. A 6-digit OTP code will be dispatched to your registered parent's phone number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  School Email or Student Admission Number
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. PCD/2023/0084 or student@peculiarschools.edu.ng"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-mono sm:font-sans"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Example admission numbers: PCD/2023/0084, PCD/2022/0045, PCD/2024/0112
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>Locating student & sending OTP...</span>
                ) : (
                  <>
                    <span>Send OTP to Parent Phone</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP & Enter New Password */}
          {step === 'VERIFY_OTP' && (
            <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
              {/* Parent Phone Delivery Banner */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Parent Phone: {maskedPhone}</span>
                  </span>
                  <span className="bg-amber-200 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {studentName}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Please request the 6-digit verification code from your parent and enter it below.
                </p>
              </div>

              {/* Simulated SMS Alert Card (for instant testing convenience) */}
              {simulatedOtp && (
                <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 text-xs space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>📱 Simulated SMS Notification</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Just now</span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    "PCD Security: Your password reset OTP for <strong>{studentName}</strong> is{' '}
                    <span className="text-amber-400 font-mono font-bold text-sm tracking-wider">
                      {simulatedOtp}
                    </span>
                    . Valid for 10 minutes."
                  </p>
                  <button
                    type="button"
                    onClick={() => setOtpInput(simulatedOtp)}
                    className="mt-1 text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
                  >
                    Click to auto-fill OTP code ({simulatedOtp})
                  </button>
                </div>
              )}

              {/* 6-Digit OTP Code Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 584920"
                  className="w-full text-center text-xl font-bold tracking-widest py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Password (minimum 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new private password"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST_OTP')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span>Verifying and updating...</span>
                  ) : (
                    <>
                      <span>Verify OTP & Set New Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Password Reset Successful!</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Your student password has been changed. You can now log in using your{' '}
                  <span className="font-semibold text-slate-800">
                    Admission Number ({identifier})
                  </span>{' '}
                  and your newly configured password.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Default parent phone password has now been updated.</span>
              </div>

              <button
                onClick={handleFinishAndLogin}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
