import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useDemoAuth } from '../../../context/DemoAuthContext';

export const ManagementDemoModeBanner: React.FC = () => {
  const { isDemoManagementEnabled } = useDemoAuth();

  if (!isDemoManagementEnabled) return null;

  return (
    <div className="bg-indigo-50 border-b border-indigo-200/80 px-4 py-2 text-xs text-indigo-950 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-indigo-200/80 text-indigo-950 uppercase text-[10px] tracking-wider">
          <ShieldCheck className="w-3 h-3 text-indigo-900" />
          Demo Mode
        </span>
        <span className="font-medium text-indigo-900">
          Demo Mode — Management analytics services are not connected.
        </span>
      </div>
      <div className="hidden md:flex items-center gap-1.5 text-indigo-800 text-[11px]">
        <Info className="w-3.5 h-3.5 text-indigo-600" />
        <span>Consolidated executive analytics will appear after backend integration</span>
      </div>
    </div>
  );
};
