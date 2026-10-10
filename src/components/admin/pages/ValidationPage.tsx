import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { FilterBar } from '../common/FilterBar';
import { DataTableShell } from '../common/DataTableShell';

export const ValidationPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const EXCEPTION_CATEGORIES = [
    'Mandatory Field',
    'Missing Evidence',
    'Unit Error',
    'Range Error',
    'Duplicate',
    'Month/Year Variance',
    'Total Mismatch',
    'Cross-section Mismatch',
  ];

  const EXCEPTION_STATUSES = [
    'Open',
    'Assigned',
    'Waiting for Clarification',
    'Corrected',
    'Revalidated',
    'Resolved',
  ];

  const filterOptions = [
    {
      label: 'Severity',
      value: 'severity',
      options: [
        { label: 'Critical (Blocker)', value: 'critical' },
        { label: 'High Warning', value: 'high' },
        { label: 'Medium Variance', value: 'medium' },
        { label: 'Low Notice', value: 'low' },
      ],
    },
    {
      label: 'Reporting Scope',
      value: 'scope',
      options: [],
      placeholder: 'All Scopes (Backend req)',
    },
  ];

  const tableColumns = [
    'Exception Type',
    'Disclosure',
    'Scope',
    'Owner',
    'Severity',
    'Status',
    'Created',
    'Actions',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validation & Exception Resolution"
        description="Automated cross-table validation engine, statistical anomaly detection, missing audit evidence flags, and discrepancy workflows."
      />

      {/* Structural Exception Categories Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-3">
          Rule-Based Validation Checks
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-[#003B73] text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {EXCEPTION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-[#003B73] text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exception Status Filter Strip (No Counts) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-2">Lifecycle State:</span>
        <button
          type="button"
          onClick={() => setActiveStatus('all')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium ${
            activeStatus === 'all'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All States
        </button>
        {EXCEPTION_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveStatus(status)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              activeStatus === status
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search exceptions by rule code, disclosure, or entity..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterOptions}
        activeFilterValues={filters}
        onFilterChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
        onResetFilters={() => {
          setSearch('');
          setFilters({});
        }}
      />

      {/* Empty Exceptions Table */}
      <DataTableShell
        columns={tableColumns}
        emptyIcon={AlertTriangle}
        emptyTitle="No validation exceptions detected"
        emptyDescription="The automated validation engine will check submitted data against business rules and statistical thresholds once data is loaded."
      />
    </div>
  );
};
