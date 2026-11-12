
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

export const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
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
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col
          bg-[#0D0F19] border-r border-[#272A3B]
          shadow-[10px_0_40px_rgba(0,0,0,0.2)]
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >

        {/* Brand Header */}
        <div className="flex items-center justify-between h-[72px] px-4 border-b border-[#272A3B]">

          <NavLink
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/10 shrink-0 group-hover:scale-105 group-hover:shadow-cyan-500/25 transition-all duration-300">
              <ShieldAlert className="w-5 h-5" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-base tracking-tight">
                    BrandGuard
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                    AI
                  </span>
                </div>

                <span className="text-[11px] text-[#7D879C] truncate">
                  Enterprise Brand Engine
                </span>
              </div>
            )}
          </NavLink>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-[#7D879C] hover:text-cyan-300 hover:bg-[#1B1E2D] transition-all"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Brand Workspace Selector */}
        {!isCollapsed && activeBrand && (
          <div className="px-3 pt-4 pb-2 relative">

            <button
              onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#121420] border border-[#272A3B] hover:border-cyan-400/40 hover:bg-[#171A28] text-left transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: activeBrand.primaryColor || '#7000FF' }}
                >
                  {activeBrand.logoInitial || 'BG'}
                </div>

                <div className="truncate">
                  <p className="text-xs font-semibold text-[#EAF2FF] truncate">
                    {activeBrand.name}
                  </p>

                  <p className="text-[10px] text-[#7D879C]">
                    Score: {activeBrand.healthScore}%
                  </p>
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-[#7D879C] shrink-0" />
            </button>

            {/* Brand Dropdown */}
            {brandDropdownOpen && (
              <div className="absolute top-16 left-3 right-3 z-50 bg-[#121420] border border-[#272A3B] rounded-xl shadow-2xl p-1.5 space-y-1">

                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7D879C] px-2 py-1">
                  Switch Brand Workspace
                </p>

                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      switchBrand(b.id);
                      setBrandDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all ${
                      b.id === activeBrand.id
                        ? 'bg-cyan-400/10 text-cyan-200 font-semibold border border-cyan-400/20'
                        : 'text-[#B0B8CA] hover:bg-[#1B1E2D] hover:text-white'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>

                    <span className="text-[10px] text-[#7D879C] ml-2">
                      {b.healthScore}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-1">

          <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] px-3 py-2">
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
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isItemActive
                    ? 'bg-gradient-to-r from-cyan-400/15 to-purple-500/10 text-white border border-cyan-400/25 shadow-[0_0_18px_rgba(0,229,255,0.06)]'
                    : 'text-[#8D98AE] border border-transparent hover:text-white hover:bg-[#171A28]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                {isItemActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-cyan-400 to-purple-500" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isItemActive
                      ? 'text-cyan-300'
                      : 'text-[#7D879C] group-hover:text-cyan-300'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Backend Status */}
        {!isCollapsed && (
          <div className="px-3 py-2 mx-3 mb-3 rounded-xl bg-[#121420] border border-[#272A3B] text-xs">

            <div className="flex items-center justify-between text-[11px] text-[#8D98AE] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Backend Status
              </span>

              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseStatus.configured
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
            </div>

            <p className="text-[10px] text-[#B0B8CA] truncate font-mono">
              {supabaseStatus.configured ? 'Supabase Live' : 'Demo Local Mode'}
            </p>
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-[#272A3B] bg-[#0A0B10]">

          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.avatar || 'U'}
              </div>

              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#EAF2FF] truncate">
                    {user?.name || 'Guest User'}
                  </p>

                  <p className="text-[10px] text-[#7D879C] truncate">
                    {user?.role || 'Guest'}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#7D879C] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
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
