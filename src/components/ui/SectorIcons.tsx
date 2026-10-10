import React from 'react';

// Custom Arch/Tunnel Icon matching reference
export const TunnelIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.75" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 21V10a8 8 0 0 1 16 0v11" />
    <path d="M9 21v-7a3 3 0 0 1 6 0v7" />
    <line x1="12" y1="21" x2="12" y2="18" />
  </svg>
);

// Custom Hydrocarbons / Refinery Column Icon matching reference
export const HydrocarbonIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.75" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="5" y="6" width="6" height="15" rx="1" />
    <path d="M6 3h4" />
    <path d="M8 3v3" />
    <rect x="13" y="10" width="6" height="11" rx="1" />
    <path d="M14 7h4" />
    <path d="M16 7v3" />
    <line x1="11" y1="13" x2="13" y2="13" />
    <line x1="11" y1="17" x2="13" y2="17" />
  </svg>
);

// Custom Manufacturing plant icon matching reference
export const ManufacturingIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.75" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2 20h20" />
    <path d="M3 20V9l6 4V9l6 4V9l6 4v7" />
    <rect x="7" y="15" width="2" height="3" />
    <rect x="15" y="15" width="2" height="3" />
  </svg>
);
