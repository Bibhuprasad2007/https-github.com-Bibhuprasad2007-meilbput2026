import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useDemoAuth } from '../../../context/DemoAuthContext';
import { useNexusData } from '../../../context/NexusDataContext';
import { useNavigate, Link } from 'react-router-dom';

interface AuditorTopBarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
}

export const AuditorTopBar: React.FC<AuditorTopBarProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileMenu,
}) => {
  const { session, logout } = useDemoAuth();
  const { auditFindings } = useNexusData();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const activeFindingsCount = auditFindings.filter((f) => f.status !== 'RESOLVED').length;

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
    <header className="h-[68px] sm:h-[72px] bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
      {/* Left Side: Mobile toggle + Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div className="hidden sm:block">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">
              MEIL Infrastructure ESG Assurance System
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Statutory SEBI BRSR Core Independent Assurer Portal
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: SSE status, Role tag, Profile */}
      <div className="flex items-center gap-3">
        {/* SSE Stream indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Verification Stream: Live</span>
        </div>

        {/* Cross portal quick links */}
        <Link
          to="/reviewer/review-queue"
          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Switch to Reviewer Queue"
        >
          <span>Reviewer View</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-expanded={isProfileOpen}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {session?.user?.name || 'Sanjay Deshmukh'}
              </p>
              <p className="text-[10px] text-purple-700 font-semibold leading-tight">
                Lead BRSR Assurer
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">
                  {session?.user?.name || 'Sanjay Deshmukh'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {session?.user?.email || 'auditor@demo.com'}
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                  Authorized BRSR Assurer
                </span>
              </div>

              <div className="py-1 text-xs">
                <div className="px-4 py-2 flex items-center justify-between text-slate-600">
                  <span>Active Discrepancies</span>
                  <span className="font-bold text-rose-600">{activeFindingsCount}</span>
                </div>
                <div className="px-4 py-2 flex items-center justify-between text-slate-600">
                  <span>Assurance Mandate</span>
                  <span className="font-semibold text-slate-800">SEBI BRSR Core</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
