import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { LoginDropdown } from './LoginDropdown';
import type { PortalRole } from '../../types/auth';

interface HeaderProps {
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectRole: (role: PortalRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDropdownOpen,
  setIsDropdownOpen,
  onSelectRole,
}) => {
  const loginButtonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-10 lg:px-12 py-5 sm:py-6 bg-gradient-to-b from-[#060c18]/80 via-[#060c18]/40 to-transparent">
      {/* Left Branding */}
      <div className="flex items-center gap-3.5">
        <Logo className="w-8 h-8 sm:w-9 sm:h-9" />
        <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-wider text-white uppercase drop-shadow-sm select-none">
          MEIL BRSR REPORTING PORTAL
        </h1>
      </div>

      {/* Right Login Button & Dropdown */}
      <div className="relative">
        <button
          ref={loginButtonRef}
          type="button"
          onClick={toggleDropdown}
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
          className={`flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 text-sm font-medium text-white border rounded-md transition-all duration-200 backdrop-blur-sm ${
            isDropdownOpen
              ? 'bg-white/20 border-white text-white shadow-lg'
              : 'bg-white/10 hover:bg-white/20 border-white/40 hover:border-white/80'
          } focus:outline-none focus:ring-2 focus:ring-white/60`}
        >
          <span>Login</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        <LoginDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          onSelectRole={onSelectRole}
        />
      </div>
    </header>
  );
};
