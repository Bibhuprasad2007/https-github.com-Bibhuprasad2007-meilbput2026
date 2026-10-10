import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../admin/common/PageHeader';
import { FilterBar } from '../../admin/common/FilterBar';
import { DataTableShell } from '../../admin/common/DataTableShell';

const SEVERITY_OPTIONS = [
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Information', value: 'information' },
];

const ISSUE_STATUS_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'Awaiting Clarification', value: 'awaiting_clarification' },
  { label: 'Corrected', value: 'corrected' },
  { label: 'Resolved', value: 'resolved' },
];

const VALIDATION_CATEGORY_OPTIONS = [
  { label: 'Completeness', value: 'completeness' },
  { label: 'Threshold Breach', value: 'threshold' },
  { label: 'Format Error', value: 'format' },
  { label: 'Cross-Disclosure Mismatch', value: 'cross_disclosure' },
  { label: 'Unit Conversion', value: 'unit_conversion' },
  { label: 'Year-on-Year Variance', value: 'yoy_variance' },
];

export const ValidationIssuesPage: React.FC = () => {
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
        title="Validation Issues"
        description="Data quality and validation exceptions flagged during automated checks. Review severity, resolution status, and linked disclosures."
      />

      <FilterBar
        searchPlaceholder="Search by rule name, disclosure, contributor…"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            label: 'Severity',
            value: 'severity',
            options: SEVERITY_OPTIONS,
            placeholder: 'All Severities',
          },
          {
            label: 'Issue Status',
            value: 'status',
            options: ISSUE_STATUS_OPTIONS,
            placeholder: 'All Statuses',
          },
          {
            label: 'Validation Category',
            value: 'category',
            options: VALIDATION_CATEGORY_OPTIONS,
            placeholder: 'All Categories',
          },
        ]}
        onFilterChange={handleFilterChange}
        activeFilterValues={filterValues}
        onResetFilters={handleResetFilters}
      />

      <DataTableShell
        columns={[
          'Severity',
          'Rule Code',
          'Rule Name',
          'Category',
          'Disclosure',
          'Scope / Project',
          'Contributor',
          'Reporting Period',
          'Detected On',
          'Status',
          { header: 'Actions', align: 'center' },
        ]}
        emptyIcon={AlertTriangle}
        emptyTitle="No validation issues detected"
        emptyDescription="Validation exceptions will appear here after the backend runs automated data quality checks on submitted disclosure values."
      />
    </div>
  );
};
