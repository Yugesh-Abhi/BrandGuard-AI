import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ShieldCheck,
  Server,
  Database,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useBrand } from '../../context/BrandContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Header = ({ setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeBrand } = useBrand();
  const { supabaseStatus } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pathTitles = {
    '/': 'Brand Health Dashboard',
    '/dashboard': 'Brand Health Dashboard',
    '/guidelines': 'Brand Guidelines & Rules Manager',
    '/submission': 'Submit Content for Audit',
    '/analysis': 'AI Compliance Scan Engine',
    '/report': 'Detailed Compliance Report',
    '/reviews': 'Review & Approvals Queue',
    '/history': 'Version Control & Revision Diff',
    '/analytics': 'Enterprise Brand Analytics',
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith('/report')) return 'Detailed Compliance Report';
    return pathTitles[location.pathname] || 'BrandGuard AI';
  };

  const notifications = [
    { id: 1, title: 'Violations Flagged', text: 'Black Friday Email draft flagged for 2 critical SLA claims.', time: '12m ago' },
    { id: 2, title: 'Submission Approved', text: 'Q4 Product Showcase approved by Brand Director.', time: '1h ago' },
    { id: 3, title: 'Guidelines Updated', text: 'Prohibited terms updated in Core Brand Identity v2.4.', time: '4h ago' }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-6 bg-[#070A14]/80 backdrop-blur-xl border-b border-[#161D3A] transition-all duration-300">
      
      {/* Left section: Mobile Hamburger & Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#131B38] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              {getPageTitle()}
            </h1>
            <span className="hidden md:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {activeBrand?.name}
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-slate-400">
            "Every piece of content. One consistent brand."
          </p>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audited content, rules, or guidelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E152D] border border-[#1E294B] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Dark / Light Theme Toggle */}
<button
  onClick={toggleTheme}
  className="p-2 rounded-xl border border-[#24334b] bg-[#111b2e] text-sky-400 hover:bg-[#17243b] transition-all"
  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
  aria-label="Toggle color theme"
>
  {theme === 'dark' ? (
    <Sun className="w-4 h-4" />
  ) : (
    <Moon className="w-4 h-4" />
  )}
</button>
        {/* Backend Architecture Status Pill */}
        <button
          onClick={() => setShowStatusModal(!showStatusModal)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0D142B] border border-[#1D274B] text-[11px] font-medium text-slate-300 hover:border-purple-500/40 hover:bg-[#121B38] transition-all cursor-pointer"
          title="System Architecture & Database Status"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              supabaseStatus.configured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span>{supabaseStatus.configured ? 'Supabase Live' : 'Demo Mode'}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#131B38] border border-transparent hover:border-[#1E294B] transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-[#070A14]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-[#0E152E] border border-[#232F58] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1A2548]">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Compliance Alerts</span>
                <span
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] text-purple-400 cursor-pointer hover:underline"
                >
                  Dismiss
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-[#121935] border border-[#1C264D] hover:border-purple-500/40 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick New Scan Button */}
        <Button
          size="sm"
          icon={Plus}
          onClick={() => navigate('/submission')}
          className="shadow-md shadow-purple-950/40 text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">New Audit</span>
          <span className="sm:hidden">Audit</span>
        </Button>
      </div>

      {/* Backend & Architecture Modal Popover */}
      {showStatusModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#0D1326] border border-[#24315A] rounded-2xl p-6 shadow-2xl text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E294B]">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">BrandGuard Architecture</h3>
                <p className="text-xs text-slate-400">Database & LLM Security Status</p>
              </div>
            </div>

            <div className="space-y-4 my-5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#111833] border border-[#1C264C]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-purple-400" /> Supabase PostgreSQL
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${supabaseStatus.configured ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                    {supabaseStatus.configured ? 'Connected' : 'Demo Local Mode'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {supabaseStatus.configured
                    ? `Live Supabase host: ${supabaseStatus.url}`
                    : 'Running in zero-friction demo mode with persistent browser storage and pre-loaded sample datasets. To connect live PostgreSQL, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#111833] border border-[#1C264C]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Secure Server-Side LLM
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300">
                    Deterministic Engine Active
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Current audits execute via the client-side deterministic rule engine against active brand guidelines. To connect OpenAI/Anthropic, start the secure backend proxy in <code className="text-purple-300 font-mono">/server/llmProxyExample.js</code>.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full text-xs"
              onClick={() => setShowStatusModal(false)}
            >
              Close Inspector
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
