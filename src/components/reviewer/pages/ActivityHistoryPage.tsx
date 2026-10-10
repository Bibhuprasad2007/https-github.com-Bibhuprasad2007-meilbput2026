import React, { useState } from 'react';
import { History, Download } from 'lucide-react';
import { PageHeader } from '../../admin/common/PageHeader';
import { FilterBar } from '../../admin/common/FilterBar';
import { DataTableShell } from '../../admin/common/DataTableShell';
import { BackendNotice } from '../../admin/common/BackendNotice';

const ACTION_TYPE_OPTIONS = [
  { label: 'Approved', value: 'approved' },
  { label: 'Correction Requested', value: 'correction_requested' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Comment Added', value: 'comment_added' },
  { label: 'Evidence Verified', value: 'evidence_verified' },
  { label: 'Evidence Flagged', value: 'evidence_flagged' },
];

const TIME_RANGE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Reporting Period', value: 'current_period' },
];

export const ActivityHistoryPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setFilterValues({});
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity History"
        description="Complete audit trail of all review actions, decisions, and comments recorded during your BRSR disclosure review sessions."
        extraControls={
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg opacity-60 cursor-not-allowed border border-slate-200"
            title="Export requires backend service"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Log</span>
          </button>
        }
      />

      <FilterBar
        searchPlaceholder="Search by submission, disclosure, scope…"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            label: 'Action Type',
            value: 'actionType',
            options: ACTION_TYPE_OPTIONS,
            placeholder: 'All Actions',
          },
          {
            label: 'Time Range',
            value: 'timeRange',
            options: TIME_RANGE_OPTIONS,
            placeholder: 'All Time',
          },
        ]}
        onFilterChange={handleFilterChange}
        activeFilterValues={filterValues}
        onResetFilters={handleResetFilters}
      />

      <BackendNotice
        message="Activity history entries will be recorded automatically by the backend audit service when review actions are performed."
      />

      <DataTableShell
        columns={[
          'Timestamp',
          'Action',
          'Submission ID',
          'Disclosure Name',
          'Scope / Project',
          'Outcome',
          'Comment',
        ]}
        emptyIcon={History}
        emptyTitle="No activity recorded"
        emptyDescription="Your review actions, approval decisions, correction requests, and comments will be logged here as an immutable audit trail once the backend service is connected."
      />
    </div>
  );
};
