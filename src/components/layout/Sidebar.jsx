import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  BookOpen,
  FileText,
  ScanEye,
  FileCheck2,
  GitBranch,
  BarChart3,
  CheckSquare,
  ChevronDown,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeBrand, brands, switchBrand } = useBrand();
  const { user, logout, supabaseStatus } = useAuth();
  const [brandDropdownOpen, setBrandDropdownOpen] = React.useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/guidelines', label: 'Brand Guidelines', icon: BookOpen },
    { path: '/submission', label: 'Submit Content', icon: FileText },
    { path: '/analysis', label: 'AI Scan Engine', icon: ScanEye },
    { path: '/report', label: 'Compliance Report', icon: FileCheck2 },
    { path: '/reviews', label: 'Review & Approvals', icon: CheckSquare, badge: '3' },
    { path: '/history', label: 'Revision History', icon: GitBranch },
    { path: '/analytics', label: 'Brand Analytics', icon: BarChart3 },
  ];

  const handleNavClick = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#090D1C] border-r border-[#192244] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-18 px-4 border-b border-[#161D3A]">
          <NavLink
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-base tracking-tight font-['Plus_Jakarta_Sans']">
                    BrandGuard
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    AI
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate">
                  Enterprise Brand Engine
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161D3A] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Brand Switcher Selector */}
        {!isCollapsed && activeBrand && (
          <div className="px-3 pt-3 pb-2 relative">
            <button
              onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#11172E] border border-[#202B52] hover:border-purple-500/40 text-left transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: activeBrand.primaryColor || '#8B5CF6' }}
                >
                  {activeBrand.logoInitial || 'BG'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">{activeBrand.name}</p>
                  <p className="text-[10px] text-slate-400">Score: {activeBrand.healthScore}%</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Switcher dropdown */}
            {brandDropdownOpen && (
              <div className="absolute top-16 left-3 right-3 z-50 bg-[#0E152E] border border-[#2B3968] rounded-xl shadow-2xl p-1.5 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Switch Brand Workspace
                </p>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      switchBrand(b.id);
                      setBrandDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      b.id === activeBrand.id
                        ? 'bg-purple-600/20 text-purple-200 font-semibold border border-purple-500/30'
                        : 'text-slate-300 hover:bg-[#162044]'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2">{b.healthScore}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation Links using NavLink */}
        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
            {!isCollapsed ? 'Platform' : '•'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive =
              item.path === '/'
                ? location.pathname === '/' || location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isItemActive
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/10 text-white border border-purple-500/40 shadow-sm shadow-purple-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B38]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isItemActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-300'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Backend & Architecture Status Pill */}
        {!isCollapsed && (
          <div className="px-4 py-2 mx-3 mb-2 rounded-xl bg-[#0E152D] border border-[#1A2548] text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                Backend Status
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseStatus.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-300 truncate font-mono">
              {supabaseStatus.configured ? 'Supabase Live' : 'Demo Local Mode'}
            </p>
          </div>
        )}

        {/* User Profile Bar with Sign Out */}
        <div className="p-3 border-t border-[#161D3A] bg-[#080B18]">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.avatar || 'U'}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Guest User'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Guest'}</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#161D3A] transition-colors cursor-pointer"
                title="Sign Out / Switch User"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
