import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  RotateCcw,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Radio,
  X,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '../../ui/Logo';
import { useDemoAuth } from '../../../context/DemoAuthContext';
import { useNexusData } from '../../../context/NexusDataContext';

interface AuditorSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AUDITOR_NAV_ITEMS = [
  {
    path: '/auditor/dashboard',
    label: 'Assurance Dashboard',
    icon: LayoutDashboard,
    badgeKey: 'none',
  },
  {
    path: '/auditor/findings',
    label: 'Discrepancies & Findings',
    icon: AlertTriangle,
    badgeKey: 'discrepancies',
  },
  {
    path: '/auditor/evidence',
    label: 'Evidence & Voucher Audit',
    icon: FileCheck2,
    badgeKey: 'none',
  },
  {
    path: '/auditor/re-verification',
    label: 'Re-Verification Queue',
    icon: RotateCcw,
    badgeKey: 'none',
  },
];

export const AuditorSidebar: React.FC<AuditorSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { logout, session } = useDemoAuth();
  const { auditFindings } = useNexusData();
  const navigate = useNavigate();

  const openFindingsCount = auditFindings.filter((f) => f.status !== 'RESOLVED').length;

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
                <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-300 truncate flex items-center gap-1">
                  <span>Auditor / Assurer</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5">
          {AUDITOR_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-[#163359] hover:text-white'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                {!isCollapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!isCollapsed && item.badgeKey === 'discrepancies' && openFindingsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shrink-0">
                    {openFindingsCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Cross-Role Switcher */}
        {!isCollapsed && (
          <div className="px-4 py-3 mx-3 my-2 bg-[#102744] border border-[#1d3d66] rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Independent Assurance</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Direct telemetry from backend verification event stream (<code className="text-sky-300 font-mono">/api/events</code>).
            </p>
          </div>
        )}
      </div>

      {/* Footer / User & Logout */}
      <div className="p-3 border-t border-[#152d4a] space-y-2">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-[#102744] border border-[#1b3a61] ${
            isCollapsed ? 'justify-center p-1.5' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {session?.user?.name || 'Sanjay Deshmukh'}
              </p>
              <p className="text-[10px] text-purple-300 font-medium truncate">
                Lead BRSR Assurer
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-[#163359] rounded-xl transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Sign out of Auditor Portal"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 text-slate-400 hover:text-white hover:bg-[#163359] rounded-xl transition-colors cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[80px]' : 'w-[272px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out transform ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
