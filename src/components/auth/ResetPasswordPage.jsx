
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

import { supabase } from "../../services/supabaseClient";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    const verifyRecoverySession = async () => {
      try {
        // Supabase processes the recovery link and establishes
        // a temporary authenticated recovery session.
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (active) {
          setValidSession(Boolean(data.session));
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Invalid or expired password reset link.'
          );
          setValidSession(false);
        }
      } finally {
        if (active) setChecking(false);
      }
    };

    verifyRecoverySession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(Boolean(session));
        setChecking(false);
        setError('');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Your password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password
        });

      if (updateError) throw updateError;

      setSuccess(
        'Your password has been updated successfully. Please sign in again.'
      );

      setPassword('');
      setConfirmPassword('');

      await supabase.auth.signOut();

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);

    } catch (err) {
      console.error('Password update error:', err);

      setError(
        err.message ||
        'Unable to update your password. Please request a new reset link.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex items-center justify-center p-5 relative overflow-hidden">

      <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-900/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-900/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        <div className="bg-[#0D1326]/95 border border-[#1E294B] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-purple-950/40">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-white">
                BrandGuard AI
              </h1>
              <p className="text-xs text-purple-400">
                Secure Account Recovery
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Reset your password
          </h2>

          <p className="text-sm text-slate-400 mb-7">
            Create a new password to regain access to your workspace.
          </p>

          {checking ? (
            <div className="flex items-center gap-3 text-sm text-purple-300 py-6">
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying your reset link...
            </div>
          ) : !validSession ? (
            <div>
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>
                  {error ||
                    'This password reset link is invalid or expired. Please request a new one.'}
                </span>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full mt-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form
              onSubmit={handlePasswordUpdate}
              className="space-y-5"
            >

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  New Password
                </label>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#111833] border border-[#1E294B] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#111833] border border-[#1E294B] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-5 border-t border-[#1E294B] text-center">
            <p className="text-xs text-slate-500">
              Protected account recovery · BrandGuard AI
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
