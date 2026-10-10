import React, { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { PORTAL_OPTIONS } from '../../constants/portals';
import type { PortalRole } from '../../types/auth';

interface LoginDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: PortalRole) => void;
}

export const LoginDropdown: React.FC<LoginDropdownProps> = ({
  isOpen,
  onClose,
  onSelectRole,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Handle clicks outside dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Handle Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Keyboard navigation between menu items
  const handleItemKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % PORTAL_OPTIONS.length;
      itemsRef.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + PORTAL_OPTIONS.length) % PORTAL_OPTIONS.length;
      itemsRef.current[prevIndex]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      role="menu"
      aria-label="Select Portal"
      className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-2xl border border-slate-200/90 text-slate-800 z-50 overflow-hidden transform opacity-100 scale-100 transition-all duration-150 origin-top-right animate-in fade-in zoom-in-95"
    >
      {/* Dropdown Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          SELECT PORTAL
        </span>
      </div>

      {/* Role Options */}
      <div className="py-1.5 divide-y divide-slate-50">
        {PORTAL_OPTIONS.map((portal, index) => {
          const Icon = portal.icon;
          return (
            <button
              key={portal.id}
              ref={(el) => { itemsRef.current[index] = el; }}
              role="menuitem"
              onClick={() => {
                onSelectRole(portal.id);
                onClose();
              }}
              onKeyDown={(e) => handleItemKeyDown(e, index)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-150 hover:bg-slate-100/80 focus:bg-slate-100/90 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#003B73]/40 group"
            >
              <div className="flex items-center gap-3">
                <div className="text-slate-600 group-hover:text-[#003B73] transition-colors">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {portal.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
