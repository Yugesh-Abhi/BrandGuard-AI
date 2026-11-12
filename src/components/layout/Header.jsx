
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
    if (location.pathname.startsWith('/report')) {
      return 'Detailed Compliance Report';
    }
    return pathTitles[location.pathname] || 'BrandGuard AI';
  };

  const notifications = [
    {
      id: 1,
      title: 'Violations Flagged',
      text: 'Black Friday Email draft flagged for 2 critical SLA claims.',
      time: '12m ago'
    },
    {
      id: 2,
      title: 'Submission Approved',
      text: 'Q4 Product Showcase approved by Brand Director.',
      time: '1h ago'
    },
    {
      id: 3,
      title: 'Guidelines Updated',
      text: 'Prohibited terms updated in Core Brand Identity v2.4.',
      time: '4h ago'
    }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between min-h-[72px] px-4 sm:px-6 bg-[#0D0F19]/90 backdrop-blur-xl border-b border-[#272A3B] transition-all duration-300">

      {/* Left Section */}
      <div className="flex items-center gap-3.5 min-w-0">

        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-[#B0B8CA] hover:text-cyan-300 hover:bg-[#1B1E2D] transition-all"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {getPageTitle()}
            </h1>

            <span className="hidden md:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 truncate">
              {activeBrand?.name}
            </span>
          </div>

          <p className="hidden sm:block text-[11px] text-[#7D879C]">
            Every piece of content. One consistent brand.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-4">
        <div className="relative w-full">

          <Search className="w-4 h-4 text-[#7D879C] absolute left-3.5 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            placeholder="Search audited content, rules, or guidelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121420] border border-[#272A3B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#EAF2FF] placeholder-[#718096] focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition-all"
          />

        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[#272A3B] bg-[#121420] text-cyan-400 hover:bg-[#1B1E2D] hover:border-cyan-400/40 transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* Backend Status */}
        <button
          onClick={() => setShowStatusModal(!showStatusModal)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#121420] border border-[#272A3B] text-[11px] font-medium text-[#B0B8CA] hover:border-cyan-400/40 hover:bg-[#1B1E2D] transition-all"
          title="System Architecture & Database Status"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              supabaseStatus.configured
                ? 'bg-emerald-400'
                : 'bg-amber-400 animate-pulse'
            }`}
          />

          <span>
            {supabaseStatus.configured ? 'Supabase Live' : 'Demo Mode'}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-[#B0B8CA] hover:text-cyan-300 hover:bg-[#1B1E2D] border border-transparent hover:border-[#272A3B] transition-all"
            title="Notifications"
            aria-label="Toggle notifications"
          >
            <Bell className="w-4 h-4" />

            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full ring-2 ring-[#0D0F19]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-[#121420] border border-[#272A3B] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">

              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#272A3B]">

                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Compliance Alerts
                </span>

                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-[#171A28] border border-[#272A3B] hover:border-cyan-400/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">

                      <span className="text-xs font-semibold text-[#EAF2FF]">
                        {n.title}
                      </span>

                      <span className="text-[10px] text-[#7D879C] shrink-0">
                        {n.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#9AABC2] mt-1 leading-snug">
                      {n.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* New Audit */}
        <Button
          size="sm"
          icon={Plus}
          onClick={() => navigate('/submission')}
          className="shadow-lg shadow-cyan-950/30 text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">New Audit</span>
          <span className="sm:hidden">Audit</span>
        </Button>
      </div>

      {/* Architecture Inspector Modal */}
      {showStatusModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#121420] border border-[#272A3B] rounded-2xl p-6 shadow-2xl text-[#EAF2FF]"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center gap-3 pb-3 border-b border-[#272A3B]">

              <div className="p-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
                <Server className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-bold text-white text-base">
                  BrandGuard Architecture
                </h3>

                <p className="text-xs text-[#7D879C]">
                  Database & LLM Security Status
                </p>
              </div>
            </div>

            <div className="space-y-4 my-5 text-xs">

              {/* Database Status */}
              <div className="p-3.5 rounded-xl bg-[#171A28] border border-[#272A3B]">

                <div className="flex items-center justify-between mb-1 gap-2">

                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    Supabase PostgreSQL
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      supabaseStatus.configured
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-amber-500/10 text-amber-300'
                    }`}
                  >
                    {supabaseStatus.configured ? 'Connected' : 'Demo Local Mode'}
                  </span>
                </div>

                <p className="text-[#9AABC2] text-[11px] leading-relaxed break-words">
                  {supabaseStatus.configured
                    ? `Live Supabase host: ${supabaseStatus.url}`
                    : 'Running in demo mode with persistent browser storage and pre-loaded sample datasets. To connect live PostgreSQL, configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'}
                </p>
              </div>

              {/* Compliance Engine Status */}
              <div className="p-3.5 rounded-xl bg-[#171A28] border border-[#272A3B]">

                <div className="flex items-center justify-between mb-1 gap-2">

                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Compliance Engine
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300">
                    Deterministic Engine Active
                  </span>
                </div>

                <p className="text-[#9AABC2] text-[11px] leading-relaxed">
                  Current audits execute via the client-side deterministic rule engine against active brand guidelines. An external AI service requires a configured secure backend integration.
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
