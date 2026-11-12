
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  FileCheck,
  Users,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const [loadingRole, setLoadingRole] = useState('');

  const handleDemo = async (role) => {
    try {
      setLoadingRole(role);
      await loginAsDemo(role);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Demo login failed:', error);
      alert(error.message || 'Unable to open demo account.');
    } finally {
      setLoadingRole('');
    }
  };

  return (
    <main className="min-h-screen bg-[#070913] text-slate-100 overflow-hidden relative">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-700/20 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-700/20 rounded-full blur-[140px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 sm:px-10">
        {/* Navbar */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/40">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white">
                BrandGuard AI
              </h1>
              <p className="text-[10px] text-purple-300">
                Enterprise Brand Governance
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl border border-[#344064] text-sm font-semibold text-slate-200 hover:bg-[#18213E] transition"
          >
            Sign In
          </Link>
        </nav>

        {/* Hero */}
        <section className="text-center max-w-4xl mx-auto pt-24 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold mb-7">
            <Sparkles className="w-4 h-4" />
            AI-Powered Brand Compliance Platform
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Protect Your Brand.
            <span className="block bg-gradient-to-r from-purple-400 via-indigo-300 to-violet-200 bg-clip-text text-transparent">
              Build Trust.
            </span>
          </h2>

          <p className="max-w-2xl mx-auto mt-6 text-sm sm:text-lg text-slate-400 leading-relaxed">
            Keep every piece of content consistent, compliant, and aligned
            with your brand guidelines using intelligent brand governance.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-9">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-950/40 hover:opacity-90 transition"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-[#344064] bg-[#111833] text-slate-100 font-bold text-sm hover:bg-[#1A2547] transition"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          <div className="p-6 rounded-2xl bg-[#0D1326]/90 border border-[#1E294B]">
            <ShieldCheck className="w-7 h-7 text-purple-400 mb-4" />
            <h3 className="font-bold text-white mb-2">Brand Protection</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Check content against approved brand rules and guidelines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1326]/90 border border-[#1E294B]">
            <FileCheck className="w-7 h-7 text-indigo-400 mb-4" />
            <h3 className="font-bold text-white mb-2">Content Compliance</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Review content and identify potential compliance issues.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1326]/90 border border-[#1E294B]">
            <Users className="w-7 h-7 text-violet-400 mb-4" />
            <h3 className="font-bold text-white mb-2">Team Governance</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Support structured reviews and approval workflows.
            </p>
          </div>
        </section>

        {/* Demo personas */}
        <section className="max-w-4xl mx-auto mb-16 p-6 sm:p-8 rounded-3xl bg-[#0D1326]/90 border border-[#29345B]">
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4" />
              Explore without creating an account
            </div>
            <h3 className="text-2xl font-bold text-white">
              Try the Demo Experience
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Choose a demo persona to explore the interface.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                role: 'Brand Manager',
                name: 'Alex Rivera',
                title: 'Brand Director'
              },
              {
                role: 'Content Creator',
                name: 'Sarah Jenkins',
                title: 'Content Writer'
              },
              {
                role: 'Compliance Officer',
                name: 'David Chen',
                title: 'Legal Officer'
              }
            ].map((persona) => (
              <button
                key={persona.role}
                type="button"
                disabled={Boolean(loadingRole)}
                onClick={() => handleDemo(persona.role)}
                className="p-5 rounded-2xl bg-[#141E3B] border border-[#2B3968] hover:border-purple-400 hover:bg-[#1B2850] transition text-left disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center font-bold">
                    {persona.name[0]}
                  </div>
                  {loadingRole === persona.role ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <p className="font-bold text-white">{persona.name}</p>
                <p className="text-xs text-purple-300 mt-1">
                  {persona.title}
                </p>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-5">
            Demo personas use demonstration data, not a real authenticated account.
          </p>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#1E294B] py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} BrandGuard AI</span>
          <span className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            Brand governance and compliance
          </span>
        </footer>
      </div>
    </main>
  );
};
