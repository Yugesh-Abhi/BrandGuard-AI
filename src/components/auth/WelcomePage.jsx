
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  FileCheck,
  Users,
  Loader2,
  CheckCircle2,
  Zap,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const [loadingRole, setLoadingRole] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const features = [
    {
      icon: ShieldCheck,
      title: 'Brand Protection',
      description: 'Check content against approved brand rules, guidelines and messaging standards.',
      color: 'text-[#00E5FF]',
      bg: 'bg-[#00E5FF]/10'
    },
    {
      icon: FileCheck,
      title: 'Content Compliance',
      description: 'Identify potential compliance issues before content reaches your audience.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      icon: Users,
      title: 'Team Governance',
      description: 'Organise reviews, manage approvals and maintain consistent team workflows.',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    }
  ];

  const steps = [
    { number: '01', title: 'Submit', description: 'Upload or paste your marketing content.' },
    { number: '02', title: 'Analyze', description: 'Check content against your brand rules.' },
    { number: '03', title: 'Review', description: 'Inspect detected issues and suggestions.' },
    { number: '04', title: 'Approve', description: 'Complete the review and track revisions.' }
  ];

  const personas = [
    { role: 'Brand Manager', name: 'Alex Rivera', title: 'Brand Director' },
    { role: 'Content Creator', name: 'Sarah Jenkins', title: 'Content Writer' },
    { role: 'Compliance Officer', name: 'David Chen', title: 'Legal Officer' }
  ];

  return (
    <main className="min-h-screen bg-[#0A0B10] text-[#EAF2FF] overflow-hidden relative isolate">




      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-40 w-[550px] h-[550px] bg-[#7000FF]/15 rounded-full blur-[150px]" />
        <div className="absolute top-40 -right-48 w-[550px] h-[550px] bg-[#00E5FF]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-purple-700/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">

        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-[#272A3B]/80 bg-[#0A0B10]/80 backdrop-blur-xl">
          <nav className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">

            <Link to="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00BFD6] to-[#7000FF] flex items-center justify-center shadow-lg shadow-cyan-950/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-lg font-extrabold text-white tracking-tight">
                  BrandGuard <span className="text-[#00E5FF]">AI</span>
                </h1>
                <p className="text-[10px] text-[#7D879C] tracking-wider uppercase">
                  Enterprise Brand Governance
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm text-[#B0B8CA]">
              <a href="#features" className="hover:text-[#00E5FF] transition">Features</a>
              <a href="#workflow" className="hover:text-[#00E5FF] transition">How It Works</a>
              <a href="#demo" className="hover:text-[#00E5FF] transition">Demo</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2.5 text-sm font-semibold text-[#B0B8CA] hover:text-white transition"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00BFD6] to-[#00E5FF] text-[#071018] text-sm font-bold shadow-lg shadow-cyan-950/30 hover:shadow-cyan-500/20 transition"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-[#1B1E2D]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </nav>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#272A3B] bg-[#121420] px-6 py-5 flex flex-col gap-4 text-sm">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)}>Demo</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-[#00E5FF] font-bold">Create Account</Link>
            </div>
          )}
        </header>

        {/* Hero */}
        
{/* Hero */}
{/* Hero */}
<section className="max-w-7xl mx-auto px-5 sm:px-8 pt-24 sm:pt-32 pb-20 text-center">

  


          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF] text-xs font-semibold mb-8">
            <Sparkles className="w-4 h-4" />
            Intelligent Brand Governance Platform
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>

          <h2 className="max-w-5xl mx-auto text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12] text-white">
            Every Word Matters.
            <span className="block mt-2 bg-gradient-to-r from-[#00E5FF] via-[#8B8AFF] to-[#A855F7] bg-clip-text text-transparent">
              Every Brand Deserves Protection.
            </span>
          </h2>

          <p className="max-w-2xl mx-auto mt-7 text-sm sm:text-lg text-[#B0B8CA] leading-relaxed">
            Bring consistency, confidence and control to your brand communication.
            Review content, identify compliance issues and keep every message
            aligned with your brand standards.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00BFD6] to-[#00E5FF] text-[#071018] font-bold text-sm shadow-xl shadow-cyan-950/30 hover:shadow-cyan-500/20 hover:-translate-y-0.5 transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[#272A3B] bg-[#121420]/80 text-[#EAF2FF] font-semibold text-sm hover:border-[#00BFD6]/50 hover:bg-[#1B1E2D] transition-all"
            >
              <Zap className="w-4 h-4 text-[#00E5FF]" />
              Explore Live Demo
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-9 text-xs text-[#7D879C]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Brand guideline checks
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Review workflows
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Revision tracking
            </span>
          </div>

          {/* Product Preview */}
          <div className="max-w-5xl mx-auto mt-20 relative">
            <div className="absolute -inset-5 bg-gradient-to-r from-[#00E5FF]/10 via-purple-500/10 to-[#7000FF]/10 blur-3xl rounded-full" />

            <div className="relative rounded-2xl border border-[#34364A] bg-[#121420] p-2 sm:p-3 shadow-2xl shadow-black/50">

              <div className="flex items-center justify-between px-3 py-3 border-b border-[#272A3B]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] sm:text-xs text-[#7D879C]">BrandGuard AI · Workspace Preview</span>
                <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 sm:p-5 text-left">

                <div className="sm:col-span-2 rounded-xl border border-[#272A3B] bg-[#0D0F19] p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs text-[#7D879C]">Compliance Overview</p>
                      <h3 className="text-lg font-bold text-white mt-1">Content Analysis</h3>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[#00E5FF]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="rounded-lg bg-[#121420] p-3 border border-[#272A3B]">
                      <p className="text-[10px] text-[#7D879C]">Passed</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">92%</p>
                    </div>
                    <div className="rounded-lg bg-[#121420] p-3 border border-[#272A3B]">
                      <p className="text-[10px] text-[#7D879C]">Warnings</p>
                      <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">05</p>
                    </div>
                    <div className="rounded-lg bg-[#121420] p-3 border border-[#272A3B]">
                      <p className="text-[10px] text-[#7D879C]">Critical</p>
                      <p className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">02</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#B0B8CA]">Brand alignment</span>
                      <span className="text-[#00E5FF]">92%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#272A3B] overflow-hidden">
                      <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#00BFD6] to-[#00E5FF]" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#B0B8CA]">Guideline adherence</span>
                      <span className="text-purple-400">86%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#272A3B] overflow-hidden">
                      <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-purple-600 to-[#A855F7]" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#272A3B] bg-[#0D0F19] p-4">
                  <p className="text-xs text-[#7D879C]">Recent Review</p>
                  <h3 className="text-sm font-bold text-white mt-1 mb-4">Content Status</h3>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[#121420] border border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-semibold">Approved</span>
                      </div>
                      <p className="text-[10px] text-[#7D879C] mt-2">Campaign content</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#121420] border border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangleIcon />
                        <span className="text-xs text-amber-400 font-semibold">Needs Review</span>
                      </div>
                      <p className="text-[10px] text-[#7D879C] mt-2">Social media copy</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[10px] text-[#00E5FF]">
                    <Lock className="w-3 h-3" />
                    Secure workspace
                  </div>
                </div>

              </div>
            </div>

            <p className="text-[10px] text-[#68738A] mt-4">
              Illustrative product preview · Sample values, not live analytics
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-5 sm:px-8 py-20 scroll-mt-24">

          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E5FF] mb-3">
              Powerful Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Everything Your Brand Needs
            </h2>
            <p className="text-sm text-[#7D879C] mt-4">
              A unified workspace for maintaining brand consistency and managing content compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group p-7 rounded-2xl bg-[#121420]/90 border border-[#272A3B] hover:border-[#00BFD6]/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/10 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-[#7D879C] leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#00BFD6]">
                    Explore capability
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="border-y border-[#272A3B] bg-[#0D0F19]/70 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">

            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400 mb-3">
                Simple Workflow
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                From Submission to Approval
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((step, index) => (
                <div key={step.number} className="relative p-6 rounded-2xl bg-[#121420] border border-[#272A3B]">
                  <p className="text-3xl font-extrabold text-[#00E5FF]/30">
                    {step.number}
                  </p>
                  <h3 className="text-lg font-bold text-white mt-4">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#7D879C] mt-2 leading-relaxed">
                    {step.description}
                  </p>

                  {index !== steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 w-5 h-5 text-[#00BFD6] z-10" />
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Demo */}
        <section id="demo" className="max-w-7xl mx-auto px-5 sm:px-8 py-20 scroll-mt-24">

          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold mb-5">
              <Sparkles className="w-4 h-4" />
              Explore without creating an account
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Experience BrandGuard AI
            </h2>

            <p className="text-sm text-[#7D879C] mt-4">
              Select a demonstration role and explore the available workspace experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {personas.map((persona) => (
              <button
                key={persona.role}
                type="button"
                disabled={Boolean(loadingRole)}
                onClick={() => handleDemo(persona.role)}
                className="group text-left p-6 rounded-2xl bg-[#121420] border border-[#272A3B] hover:border-[#7000FF]/60 hover:bg-[#171A29] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7000FF]/30 to-[#00BFD6]/20 border border-[#7000FF]/20 text-white flex items-center justify-center font-bold text-lg">
                    {persona.name[0]}
                  </div>

                  {loadingRole === persona.role ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#00E5FF]" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-[#7D879C] group-hover:text-[#00E5FF] group-hover:translate-x-1 transition-all" />
                  )}
                </div>

                <p className="font-bold text-white">{persona.name}</p>
                <p className="text-xs text-purple-300 mt-1">{persona.title}</p>

                <div className="mt-5 pt-4 border-t border-[#272A3B] flex items-center justify-between">
                  <span className="text-xs text-[#7D879C]">{persona.role}</span>
                  <span className="text-[10px] text-[#00BFD6] font-semibold">Explore Demo</span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-[#68738A] text-center mt-6">
            Demo personas use demonstration data, not a real authenticated account.
          </p>
        </section>

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-20">
          <div className="relative overflow-hidden rounded-3xl border border-[#00BFD6]/20 bg-gradient-to-br from-[#121420] via-[#151329] to-[#0D1822] p-9 sm:p-14 text-center">
            <div className="absolute -top-24 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[90px]" />
            <div className="absolute -bottom-24 -left-20 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-[90px]" />

            <div className="relative">
              <ShieldCheck className="w-10 h-10 text-[#00E5FF] mx-auto mb-5" />

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Your Brand. Your Standards. Your Control.
              </h2>

              <p className="text-sm text-[#B0B8CA] max-w-xl mx-auto mt-4">
                Bring your brand governance workflow into one organised workspace.
              </p>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00BFD6] to-[#00E5FF] text-[#071018] text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                Create Your Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#272A3B] bg-[#0D0F19]/70">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00BFD6] to-[#7000FF] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">BrandGuard AI</p>
                <p className="text-[10px] text-[#7D879C]">Enterprise Brand Governance</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-5 text-xs text-[#7D879C]">
              <a href="#features" className="hover:text-[#00E5FF] transition">Features</a>
              <a href="#workflow" className="hover:text-[#00E5FF] transition">How It Works</a>
              <Link to="/login" className="hover:text-[#00E5FF] transition">Sign In</Link>
            </div>

            <div className="text-xs text-[#68738A] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              © {new Date().getFullYear()} BrandGuard AI
            </div>

          </div>
        </footer>

      </div>
    </main>
  );
};

const AlertTriangleIcon = () => (
  <svg
    className="w-4 h-4 text-amber-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v4m0 4h.01M10.3 3.9 2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"
    />
  </svg>
);
