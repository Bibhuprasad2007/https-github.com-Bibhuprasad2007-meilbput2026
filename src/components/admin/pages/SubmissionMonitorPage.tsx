import React, { useState } from 'react';
import { Activity, Send, UserCheck, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { FilterBar } from '../common/FilterBar';
import { DataTableShell } from '../common/DataTableShell';

export const SubmissionMonitorPage: React.FC = () => {
  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const STATUS_TABS = [
    { id: 'all', label: 'All Submissions' },
    { id: 'not_started', label: 'Not Started' },
    { id: 'draft', label: 'Draft' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'validation_failed', label: 'Validation Failed' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'approved', label: 'Approved' },
    { id: 'locked', label: 'Locked' },
  ];

  const filterOptions = [
    {
      label: 'Reporting Cycle',
      value: 'cycle',
      options: [],
      placeholder: 'All Cycles (Backend req)',
    },
    {
      label: 'Subsidiary / BU',
      value: 'entity',
      options: [],
      placeholder: 'All Entities (Backend req)',
    },
    {
      label: 'Section / Principle',
      value: 'section',
      options: [
        { label: 'Section A - General', value: 'secA' },
        { label: 'Section B - Management', value: 'secB' },
        { label: 'Section C - Performance', value: 'secC' },
      ],
    },
  ];

  const tableColumns = [
    'Submission ID',
    'Disclosure Name',
    'Reporting Scope',
    'Contributor',
    'Reviewer',
    'Submission Date',
    'Validation Status',
    'Workflow Status',
    'Actions',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submission Workflow Monitor"
        description="Track live data collection status, multi-stage approval workflows, reviewer sign-offs, and locking protocols across MEIL group disclosures."
      />

      {/* Batch Actions Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span>Workflow Operations:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled
            title="Select submission records from the backend to send reminder"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed border border-slate-200"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Reminder</span>
          </button>

          <button
            type="button"
            disabled
            title="Select submission records from the backend to reassign owner"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed border border-slate-200"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Reassign Owner</span>
          </button>

          <button
            type="button"
            disabled
            title="Select submission records from the backend to escalate"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-50/50 rounded-lg cursor-not-allowed border border-rose-100"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Escalate Delay</span>
          </button>
        </div>
      </div>

      {/* Status Tabs Without Counts */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs overflow-x-auto custom-scrollbar">
        <div className="flex gap-1 min-w-max">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStatusTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeStatusTab === tab.id
                  ? 'bg-[#003B73] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search submissions by ID, disclosure, or contributor..."
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

      {/* Empty Submissions Table */}
      <DataTableShell
        columns={tableColumns}
        emptyIcon={Activity}
        emptyTitle="No submissions found"
        emptyDescription="Submissions will stream in real-time once contributors submit responses against active reporting cycles."
      />
    </div>
  );
};
