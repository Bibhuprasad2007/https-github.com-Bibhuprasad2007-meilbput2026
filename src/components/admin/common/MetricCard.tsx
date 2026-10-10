import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  note?: string;
  accentBorder?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value = '--',
  icon: Icon,
  iconColor = 'text-[#003B73]',
  iconBg = 'bg-sky-50',
  note,
  accentBorder,
}) => {
  return (
    <div
      className={`relative group bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all ${
        accentBorder ? `border-l-4 ${accentBorder}` : ''
      }`}
      title="Available after backend integration."
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-700 select-none">
              {value}
            </span>
          </div>
        </div>

        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>{note || 'Available after backend integration.'}</span>
        </span>
      </div>
    </div>
  );
};
