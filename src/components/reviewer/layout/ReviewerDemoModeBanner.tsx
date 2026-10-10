import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useDemoAuth } from '../../../context/DemoAuthContext';

export const ReviewerDemoModeBanner: React.FC = () => {
  const { isDemoReviewerEnabled } = useDemoAuth();

  if (!isDemoReviewerEnabled) return null;

  return (
    <div className="bg-sky-50 border-b border-sky-200/80 px-4 py-2 text-xs text-sky-900 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-sky-200/80 text-sky-950 uppercase text-[10px] tracking-wider">
          <ShieldCheck className="w-3 h-3 text-sky-900" />
          Demo Mode
        </span>
        <span>
          Reviewer / Approver Prototype UI &middot; Strictly local demo session without persistent backend storage.
        </span>
      </div>
      <div className="hidden md:flex items-center gap-1.5 text-sky-800 text-[11px]">
        <Info className="w-3.5 h-3.5 text-sky-600" />
        <span>All review queues and data tables start empty by design</span>
      </div>
    </div>
  );
};
