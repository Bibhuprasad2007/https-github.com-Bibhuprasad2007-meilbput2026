import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filters?: FilterOption[];
  onFilterChange?: (filterKey: string, val: string) => void;
  activeFilterValues?: Record<string, string>;
  onResetFilters?: () => void;
  extraActions?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange,
  filters = [],
  onFilterChange,
  activeFilterValues = {},
  onResetFilters,
  extraActions,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#003B73] focus:ring-1 focus:ring-[#003B73] transition-colors"
        />
      </div>

      {/* Dynamic Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {filters.map((filter) => (
          <div key={filter.value} className="min-w-[140px] flex-1 sm:flex-initial">
            <select
              value={activeFilterValues[filter.value] || ''}
              onChange={(e) => onFilterChange?.(filter.value, e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#003B73] transition-colors"
            >
              <option value="">{filter.placeholder || `All ${filter.label}`}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            title="Reset filters"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors focus:outline-none"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {extraActions}
      </div>
    </div>
  );
};
