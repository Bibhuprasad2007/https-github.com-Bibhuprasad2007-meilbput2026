import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useDemoAuth } from '../../../context/DemoAuthContext';

export const ContributorDemoModeBanner: React.FC = () => {
  const { isDemoContributorEnabled } = useDemoAuth();

  if (!isDemoContributorEnabled) return null;

  return (
    <div className="bg-teal-50 border-b border-teal-200/80 px-4 py-2 text-xs text-teal-950 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-teal-200/80 text-teal-950 uppercase text-[10px] tracking-wider">
          <ShieldCheck className="w-3 h-3 text-teal-900" />
          Demo Mode
        </span>
        <span className="font-medium text-teal-900">
          Demo Mode — Contributor data services are not connected.
        </span>
      </div>
      <div className="hidden md:flex items-center gap-1.5 text-teal-800 text-[11px]">
        <Info className="w-3.5 h-3.5 text-teal-600" />
        <span>All tables start empty &middot; No persistent backend storage</span>
      </div>
    </div>
  );
};
