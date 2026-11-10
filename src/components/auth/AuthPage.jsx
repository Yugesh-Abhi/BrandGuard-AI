import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Database,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const AuthPage = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginAsDemo, supabaseStatus, user } = useAuth();

  const isRegister = location.pathname === '/register' || initialMode === 'register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Brand Manager');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    if (!email || !email.includes('@')) {
      setError('Please provide a valid business email address.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return false;
    }
    if (isRegister && !name.trim()) {
      setError('Full name is required to set up your workspace profile.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password, role);
        setSuccessMessage('Account registered successfully! Redirecting...');
      } else {
        await login(email.trim(), password);
        setSuccessMessage('Welcome back! Loading workspace...');
      }
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 400);
    } catch (err) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPersona = async (personaRole) => {
    setLoading(true);
    setError('');
    try {
      await loginAsDemo(personaRole);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-900/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-900/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden bg-[#0D1326]/90 border border-[#1E294B] shadow-2xl shadow-purple-950/40 backdrop-blur-xl relative z-10">
        
        {/* Left Col: Brand Presentation */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-[#121A38] via-[#0E152E] to-[#090D1C] border-b lg:border-b-0 lg:border-r border-[#1C264D] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                  BrandGuard AI
                </h2>
                <span className="text-xs text-purple-400 font-medium">Enterprise SaaS</span>
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
              "Every piece of content. <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200 bg-clip-text text-transparent">
                One consistent brand."
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
              Automated brand voice governance, prohibited corporate jargon detection, and regulatory SLA claims compliance before publishing.
            </p>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Deterministic rule engine checking active brand guidelines</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Line-level diagnostics with 1-click suggested corrections</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Brand Governance approval queues with reviewer sign-offs</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Secure server-side LLM proxy architecture (no client key leaks)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#1C264D]/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              {supabaseStatus.configured ? 'Supabase Live' : 'Demo Local Mode Active'}
            </span>
            <span className="font-mono text-purple-300">v1.0.0</span>
          </div>
        </div>

        {/* Right Col: Auth Form & Demo Quick-Picks */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            
            {/* Header with Switcher Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {isRegister ? 'Create an Enterprise Account' : 'Welcome to BrandGuard'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isRegister ? 'Register to manage brand guidelines & audits' : 'Sign in to access your brand workspace'}
                </p>
              </div>

              {/* Toggle Link */}
              <Link
                to={isRegister ? '/login' : '/register'}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                {isRegister ? 'Sign In instead' : 'Need an account?'}
              </Link>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" /> {successMessage}
              </div>
            )}

            {/* Demo Personas Quick Access Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-[#121935] border border-[#1F2B54]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> 1-Click Demo Personas (Zero Setup)
                </span>
                <span className="text-[10px] text-slate-400">Demo Data</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoPersona('Brand Manager')}
                  className="px-2.5 py-2 rounded-xl bg-[#182245] hover:bg-[#223164] text-slate-200 text-xs font-medium border border-[#27366B] hover:border-purple-400 transition-all text-center cursor-pointer"
                >
                  <p className="font-semibold text-white">Alex Rivera</p>
                  <p className="text-[10px] text-purple-300">Brand Director</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoPersona('Content Creator')}
                  className="px-2.5 py-2 rounded-xl bg-[#182245] hover:bg-[#223164] text-slate-200 text-xs font-medium border border-[#27366B] hover:border-purple-400 transition-all text-center cursor-pointer"
                >
                  <p className="font-semibold text-white">Sarah Jenkins</p>
                  <p className="text-[10px] text-purple-300">Content Writer</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoPersona('Compliance Officer')}
                  className="px-2.5 py-2 rounded-xl bg-[#182245] hover:bg-[#223164] text-slate-200 text-xs font-medium border border-[#27366B] hover:border-purple-400 transition-all text-center cursor-pointer"
                >
                  <p className="font-semibold text-white">David Chen</p>
                  <p className="text-[10px] text-purple-300">Legal Officer</p>
                </button>
              </div>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1C264D]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0D1326] px-2 text-slate-500 font-semibold tracking-wider">
                  Or enter credentials
                </span>
              </div>
            </div>

            {/* Functional Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#111833] border border-[#1E294B] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Business Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="alex.rivera@acmeglobal.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#111833] border border-[#1E294B] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#111833] border border-[#1E294B] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30"
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Workspace Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-purple-500/60"
                  >
                    <option value="Brand Manager">Brand Manager / Director</option>
                    <option value="Content Creator">Content Creator / Copywriter</option>
                    <option value="Compliance Officer">Legal / Compliance Officer</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-[#111833] border-[#1E294B] text-purple-600 focus:ring-purple-500/50"
                  />
                  <span>Remember me on this browser</span>
                </label>

                {!isRegister && (
                  <span className="text-purple-400 hover:text-purple-300 cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2"
                size="md"
                icon={ArrowRight}
                iconPosition="right"
              >
                {isRegister ? 'Complete Registration' : 'Sign In to Workspace'}
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
