import React from 'react';
import { SECTORS } from '../../constants/sectors';

export const SectorStrip: React.FC = () => {
  return (
    <div className="w-full bg-[#0a1220]/80 backdrop-blur-md border-t border-slate-700/50 py-3 sm:py-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Desktop / Tablet Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/40">
          {SECTORS.map((sector) => {
            const Icon = sector.icon;
            return (
              <div
                key={sector.id}
                className="flex flex-col items-center justify-center py-2.5 px-2 text-center group cursor-default transition-all duration-200"
              >
                <div className="text-slate-300 group-hover:text-white transition-transform duration-200 group-hover:-translate-y-0.5 mb-1.5">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.6]" />
                </div>
                <span className="text-xs sm:text-xs font-medium text-slate-300 tracking-wide group-hover:text-white transition-colors">
                  {sector.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
