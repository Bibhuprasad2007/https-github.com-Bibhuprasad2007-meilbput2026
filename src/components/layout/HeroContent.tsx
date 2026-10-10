import React from 'react';

export const HeroContent: React.FC = () => {
  return (
    <div className="max-w-2xl lg:max-w-3xl flex flex-col items-start text-left select-none">
      {/* Platform Badge */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-900/60 border border-slate-700/80 backdrop-blur-md mb-6 shadow-sm">
        <span className="w-1.5 h-3.5 bg-[#E31E24] rounded-full inline-block" />
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-200 uppercase">
          BRSR REPORTING PLATFORM
        </span>
      </div>

      {/* Main Heading */}
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] mb-5 drop-shadow-md">
        Engineering progress.
        <br />
        <span className="text-white">Reporting responsibly.</span>
      </h2>

      {/* Supporting Text */}
      <p className="text-base sm:text-lg lg:text-xl font-normal text-slate-200/90 max-w-xl leading-relaxed drop-shadow">
        Unified ESG reporting across projects, business units and subsidiaries.
      </p>
    </div>
  );
};
