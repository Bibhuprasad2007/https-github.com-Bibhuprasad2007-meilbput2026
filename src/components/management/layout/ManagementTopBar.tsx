import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  Layers,
  GitCompare,
  ChevronDown,
  LogOut,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { ManagementBreadcrumbs } from './ManagementBreadcrumbs';
import { SearchModal } from '../../admin/common/SearchModal';
import { NotificationsPopover } from '../../admin/common/NotificationsPopover';
import { useDemoAuth } from '../../../context/DemoAuthContext';
import { useNavigate } from 'react-router-dom';

interface ManagementTopBarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
}

export const ManagementTopBar: React.FC<ManagementTopBarProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileMenu,
}) => {
  const { session, logout } = useDemoAuth();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="h-[68px] sm:h-[72px] bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
        {/* Left Side */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Toggle Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:block truncate">
            <ManagementBreadcrumbs />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reporting Cycle Selector */}
          <div
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500"
            title="Reporting Cycle"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-600">Cycle:</span>
            <span className="text-slate-500 font-medium">No reporting cycle</span>
          </div>

          {/* Organizational Scope Selector */}
          <div
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500"
            title="Organizational Scope"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-600">Scope:</span>
            <span className="text-slate-500 font-medium">No scope available</span>
          </div>

          {/* Comparison Period Selector */}
          <div
            className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500"
            title="Comparison Period"
          >
            <GitCompare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-600">Compare:</span>
            <span className="text-slate-500 font-medium">No comparison period</span>
          </div>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
            aria-label="Search portal"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Trigger (No fake badge count) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <NotificationsPopover
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          {/* Management Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                EX
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-800 leading-tight">
                  Management
                </span>
                <span className="block text-[10px] text-indigo-700 font-medium">
                  Demo Mode
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {session?.user?.name || 'Demo Management User'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {session?.user?.email || 'demo.management@meil.test'}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    <BarChart3 className="w-3 h-3" />
                    Role: Executive Management
                  </div>
                </div>

                <div className="px-4 py-2 text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Prototype session active</span>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
