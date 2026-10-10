import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  secondaryNote?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionDisabled = false,
  secondaryNote,
  compact = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 sm:p-10 transition-all ${
        compact ? 'py-6 px-4' : 'min-h-[220px]'
      }`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5 shadow-xs">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>

      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-4 leading-relaxed">{description}</p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#003B73] hover:bg-[#002B54] active:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:ring-offset-1"
        >
          {actionText}
        </button>
      )}

      {secondaryNote && (
        <span className="mt-3 text-xs text-slate-400 italic">{secondaryNote}</span>
      )}
    </div>
  );
};
