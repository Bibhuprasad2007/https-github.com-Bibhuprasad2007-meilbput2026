import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AuditorSidebar } from './AuditorSidebar';
import { AuditorTopBar } from './AuditorTopBar';

export const AuditorLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased selection:bg-purple-100 selection:text-purple-900">
      {/* Top Demo Notification Banner */}
      <div className="bg-slate-900 border-b border-purple-500/30 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/30 uppercase">
            Auditor Assurance Mode
          </span>
          <span className="text-slate-300">
            Connected to Live Verification Event Stream (<code className="text-sky-300 font-mono">/api/events</code>). Verified Records Only.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Assurer: <strong>Sanjay Deshmukh</strong></span>
          <span>Role: <strong>Statutory Auditor</strong></span>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Left Sidebar */}
        <AuditorSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[272px]'
          }`}
        >
          {/* Top Bar */}
          <AuditorTopBar
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
            onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          />

          {/* Page Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
