
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--app-bg)] text-[var(--text-primary)] selection:bg-cyan-500 selection:text-white transition-colors duration-300">

      {/* Premium ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[140px]" />

        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />

        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Responsive Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header
          setMobileOpen={setMobileOpen}
          isCollapsed={isCollapsed}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Premium Footer */}
        <footer className="mt-auto border-t border-[var(--border)] py-6 px-6 bg-[var(--sidebar-bg)]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">

            <div className="flex items-center gap-2">
              <span className="font-semibold gradient-text">
                BrandGuard AI
              </span>

              <span>—</span>

              <span className="text-[var(--text-secondary)]">
                "Every piece of content. One consistent brand."
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="hover:text-cyan-400 transition-colors cursor-pointer">
                Security Architecture
              </span>

              <span className="hover:text-cyan-400 transition-colors cursor-pointer">
                Supabase Cloud
              </span>

              <span className="hover:text-cyan-400 transition-colors cursor-pointer">
                API Docs
              </span>

              <span className="text-purple-400/90 font-mono">
                v1.0.0-enterprise
              </span>
            </div>

          </div>
        </footer>
      </div>
    </div>
  );
};
