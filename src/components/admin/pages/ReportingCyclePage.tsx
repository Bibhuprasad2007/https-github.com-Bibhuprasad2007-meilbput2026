import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CalendarClock, Plus, Calendar, Clock } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { FilterBar } from '../common/FilterBar';
import { DataTableShell } from '../common/DataTableShell';
import { EmptyState } from '../common/EmptyState';
import { CreateCycleModal } from '../modals/CreateCycleModal';

interface OutletContextType {
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ReportingCyclePage: React.FC = () => {
  const { addToast } = useOutletContext<OutletContextType>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filterOptions = [
    {
      label: 'Cycle Status',
      value: 'status',
      options: [
        { label: 'Draft', value: 'Draft' },
        { label: 'Active', value: 'Active' },
        { label: 'Under Review', value: 'Under Review' },
        { label: 'Locked', value: 'Locked' },
        { label: 'Archived', value: 'Archived' },
      ],
    },
    {
      label: 'Package',
      value: 'package',
      options: [
        { label: 'Comprehensive (SEBI)', value: 'Comprehensive' },
        { label: 'Core (Key KPIs)', value: 'Core' },
        { label: 'Lite (Internal)', value: 'Lite' },
      ],
    },
  ];

  const tableColumns = [
    'Cycle Name',
    'Financial Year',
    'Boundary',
    'Package',
    'Contributor Due',
    'Reviewer Due',
    'Lock Date',
    'Status',
    'Actions',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporting Cycle Governance"
        description="Establish statutory reporting periods, define consolidation boundaries, and enforce milestone deadlines for BRSR disclosures."
        actionText="Create Reporting Cycle"
        actionIcon={Plus}
        onAction={() => setIsModalOpen(true)}
      />

      {/* Active Timeline Snapshot Shell */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#003B73]" />
            <h3 className="text-sm font-bold text-slate-800">Active Reporting Timeline</h3>
          </div>
          <span className="text-xs text-slate-400">Milestone Progression</span>
        </div>

        <EmptyState
          icon={CalendarClock}
          title="No Active Reporting Cycle"
          description="Connect the backend and create a reporting cycle to begin data collection and configure governance milestones."
          actionText="Create Reporting Cycle"
          onAction={() => setIsModalOpen(true)}
          compact
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search reporting cycles..."
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

      {/* Reporting Cycles Table */}
      <DataTableShell
        columns={tableColumns}
        emptyIcon={Calendar}
        emptyTitle="No reporting cycles found"
        emptyDescription="Create your first financial year reporting cycle to establish the annual BRSR timeline."
        emptyActionText="Create Reporting Cycle"
        onEmptyAction={() => setIsModalOpen(true)}
      />

      {/* Modal */}
      <CreateCycleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onShowToast={addToast}
      />
    </div>
  );
};
