import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionText?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  actionDisabled?: boolean;
  extraControls?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actionText,
  actionIcon: ActionIcon,
  onAction,
  actionDisabled = false,
  extraControls,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0C192C]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {extraControls}

        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            disabled={actionDisabled}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#003B73] hover:bg-[#002B54] active:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:ring-offset-2"
          >
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
            <span>{actionText}</span>
          </button>
        )}
      </div>
    </div>
  );
};
