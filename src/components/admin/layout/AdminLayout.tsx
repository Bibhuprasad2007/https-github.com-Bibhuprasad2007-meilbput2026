import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { DemoModeBanner } from './DemoModeBanner';
import { ToastContainer } from '../../ui/Toast';
import type { ToastMessage } from '../../../types/auth';

export const AdminLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* Top Demo Banner */}
      <DemoModeBanner />

      <div className="flex-1 flex relative">
        {/* Left Sidebar (Collapsible Desktop & Mobile Drawer) */}
        <AdminSidebar
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
          <AdminTopBar
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
            onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          />

          {/* Page View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet context={{ addToast }} />
          </main>
        </div>
      </div>

      {/* Global Admin Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
