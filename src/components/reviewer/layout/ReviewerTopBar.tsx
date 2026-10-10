import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  User,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { ReviewerBreadcrumbs } from './ReviewerBreadcrumbs';
import { SearchModal } from '../../admin/common/SearchModal';
import { NotificationsPopover } from '../../admin/common/NotificationsPopover';
import { useDemoAuth } from '../../../context/DemoAuthContext';
import { useNavigate } from 'react-router-dom';

interface ReviewerTopBarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
}

export const ReviewerTopBar: React.FC<ReviewerTopBarProps> = ({
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
            <ReviewerBreadcrumbs />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reporting Period Selector (Disabled - No Active Cycle) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500" title="No active reporting period assigned">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-600">Period:</span>
            <select
              disabled
              className="bg-transparent text-slate-400 font-medium text-xs focus:outline-none cursor-not-allowed"
            >
              <option>No active period</option>
            </select>
          </div>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
            aria-label="Search portal"
            title="Search (Opens backend notice)"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Trigger */}
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

          {/* Profile Dropdown Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                RA
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-800 leading-tight">
                  Reviewer
                </span>
                <span className="block text-[10px] text-slate-500">
                  Prototype Mode
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {session?.user?.name || 'Demo Reviewer'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {session?.user?.email || 'demo.reviewer@meil.test'}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    <UserCheck className="w-3 h-3" />
                    Role: Reviewer / Approver
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/reviewer/settings');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Reviewer Settings</span>
                  </button>
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
