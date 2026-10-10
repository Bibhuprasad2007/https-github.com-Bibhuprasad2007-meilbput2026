import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';
import { Logo } from '../../ui/Logo';
import { useDemoAuth } from '../../../context/DemoAuthContext';
import { ADMIN_NAV_ITEMS } from '../../../constants/adminNav';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { logout, session } = useDemoAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#0C192C] text-slate-200 border-r border-[#1a2d47] select-none">
      {/* Top Header / Branding */}
      <div>
        <div className="h-[68px] px-4 flex items-center justify-between border-b border-[#1a2d47]">
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo className="w-8 h-8 shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <span className="font-bold text-sm tracking-tight text-white truncate">
                  MEIL <span className="text-[#E31E24]">BRSR</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-300 truncate">
                  ESG Admin Portal
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
          aria-label="ESG Admin Navigation"
          className="p-3 space-y-1 overflow-y-auto custom-scrollbar max-h-[calc(100vh-210px)]"
        >
          {ADMIN_NAV_ITEMS.map((item) => {
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
                      ? 'bg-[#003B73] text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-[#15253e] hover:text-white'
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
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#E31E24] rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t border-[#1a2d47] bg-[#091322] space-y-2">
        {/* Admin Profile Details */}
        <div
          className={`flex items-center gap-2.5 p-2 rounded-lg bg-[#111f35] border border-[#1d3150] ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={session?.user?.email || 'ESG Administrator'}
        >
          <div className="w-8 h-8 rounded-full bg-[#003B73] border border-sky-400/30 flex items-center justify-center text-white shrink-0">
            <Shield className="w-4 h-4 text-sky-300" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {session?.user?.name || 'ESG Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {session?.user?.email || 'demo.admin@meil.test'}
              </p>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleLogout}
            title="Logout of ESG Admin Portal"
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
            className="hidden lg:flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-[#15253e] rounded-lg transition-colors focus:outline-none"
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
