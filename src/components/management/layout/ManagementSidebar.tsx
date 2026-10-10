import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../../ui/Logo';
import { useDemoAuth } from '../../../context/DemoAuthContext';
import { MANAGEMENT_NAV_ITEMS } from '../../../constants/managementNav';

interface ManagementSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const ManagementSidebar: React.FC<ManagementSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { logout } = useDemoAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#0B1D33] text-slate-200 border-r border-[#152d4a] select-none">
      {/* Top Header / Branding */}
      <div>
        <div className="h-[68px] px-4 flex items-center justify-between border-b border-[#152d4a]">
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo className="w-8 h-8 shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <span className="font-bold text-sm tracking-tight text-white truncate">
                  MEIL <span className="text-[#E31E24]">BRSR</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400 truncate">
                  Executive Management
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          aria-label="Management Navigation"
          className="p-3 space-y-1 overflow-y-auto custom-scrollbar max-h-[calc(100vh-220px)]"
        >
          {MANAGEMENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 group relative ${
                    isActive
                      ? 'bg-indigo-700 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-[#162c48] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-300 rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t border-[#152d4a] bg-[#081525] space-y-2">
        {/* Management Profile Details */}
        <div
          className={`flex items-center gap-2.5 p-2 rounded-lg bg-[#0f1f35] border border-[#1a3050] ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Demo Management User"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-800 border border-indigo-400/30 flex items-center justify-center text-white shrink-0">
            <BarChart3 className="w-4 h-4 text-indigo-200" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                Demo Management User
              </p>
              <p className="text-[10px] text-indigo-300 truncate">
                Management
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-indigo-400" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                  Demo Mode
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleLogout}
            title="Logout of Management Portal"
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-950/40 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-rose-400 flex-1 ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            {!isCollapsed && <span>Logout</span>}
          </button>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-[#162c48] rounded-lg transition-colors focus:outline-none"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[80px]' : 'w-[272px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer with Backdrop */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-[280px] max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
