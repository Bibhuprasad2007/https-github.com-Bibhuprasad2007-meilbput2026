import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center bg-[#E31E24] rounded-[3px] p-1 shadow-sm ${className}`}>
      {/* MEIL Red Geometric Icon Mark */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Geometric Stylized 'M' */}
        <path
          d="M6 34V6H14L20 20L26 6H34V34H26V18L20 30L14 18V34H6Z"
          fill="white"
          fillRule="evenodd"
        />
        {/* Tiny lower bar accent if needed */}
        <rect x="6" y="34.5" width="28" height="1.5" fill="#B31419" opacity="0.8" />
      </svg>
    </div>
  );
};
