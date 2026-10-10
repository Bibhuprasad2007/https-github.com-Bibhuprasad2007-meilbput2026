import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileCheck2, UploadCloud, Plus, History, FileUp } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { FilterBar } from '../common/FilterBar';
import { DataTableShell } from '../common/DataTableShell';
import { UploadEvidenceModal } from '../modals/UploadEvidenceModal';

interface OutletContextType {
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const EvidenceAuditPage: React.FC = () => {
  const { addToast } = useOutletContext<OutletContextType>();
  const [activeTab, setActiveTab] = useState<'evidence' | 'audit'>('evidence');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [evidenceFilters, setEvidenceFilters] = useState<Record<string, string>>({});

  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilters, setAuditFilters] = useState<Record<string, string>>({});

  const evidenceFilterOptions = [
    {
      label: 'Document Type',
      value: 'docType',
      options: [
        { label: 'Assurance Certificate', value: 'cert' },
        { label: 'Utility Bill', value: 'utility' },
        { label: 'Calibration Log', value: 'calibration' },
        { label: 'Policy Document', value: 'policy' },
      ],
    },
    {
      label: 'Reporting Period',
      value: 'period',
      options: [],
      placeholder: 'All Periods (Backend req)',
    },
  ];

  const auditFilterOptions = [
    {
      label: 'Actor Role',
      value: 'role',
      options: [
        { label: 'ESG Admin', value: 'admin' },
        { label: 'Data Contributor', value: 'contributor' },
        { label: 'Reviewer / Approver', value: 'reviewer' },
        { label: 'Auditor', value: 'auditor' },
      ],
    },
    {
      label: 'Module',
      value: 'module',
      options: [
        { label: 'Authentication', value: 'auth' },
        { label: 'Data Submission', value: 'submission' },
        { label: 'Workflow Approval', value: 'approval' },
        { label: 'Configuration', value: 'config' },
      ],
    },
  ];

  const evidenceTableColumns = [
    'Document Title',
    'Category',
    'Attached Disclosure',
    'Project / Scope',
    'Uploaded By',
    'File Size',
    'Timestamp',
    'Verification Status',
    'Actions',
  ];

  const auditTableColumns = [
    'Event Timestamp',
    'Actor Email',
    'Role',
    'Action Type',
    'Target Module',
    'IP Address',
    'Status',
    'Audit Details',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence Repository & Immutable Audit Trail"
        description="Centralized repository for ESG audit documentation, third-party assurance evidence, and compliance audit logs."
        actionText={activeTab === 'evidence' ? 'Upload Evidence' : undefined}
        actionIcon={FileUp}
        onAction={() => setIsUploadModalOpen(true)}
      />

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'evidence'
              ? 'border-[#003B73] text-[#003B73]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Evidence Repository</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-[#003B73] text-[#003B73]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail</span>
        </button>
      </div>

      {activeTab === 'evidence' ? (
        <div className="space-y-6">
          {/* Upload Dropzone Shell */}
          <div
            onClick={() => setIsUploadModalOpen(true)}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-white hover:border-[#003B73] hover:bg-sky-50/20 transition-all cursor-pointer shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-[#003B73] mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800 mb-1">
              Upload Supporting Audit Evidence
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-3">
              Attach environmental test reports, electricity invoices, social audit registers, or statutory certificates.
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#003B73] rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Select Document</span>
            </button>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchPlaceholder="Search evidence files by title, project, or uploader..."
            searchValue={evidenceSearch}
            onSearchChange={setEvidenceSearch}
            filters={evidenceFilterOptions}
            activeFilterValues={evidenceFilters}
            onFilterChange={(k, v) => setEvidenceFilters((prev) => ({ ...prev, [k]: v }))}
            onResetFilters={() => {
              setEvidenceSearch('');
              setEvidenceFilters({});
            }}
          />

          {/* Empty Evidence Table */}
          <DataTableShell
            columns={evidenceTableColumns}
            emptyIcon={FileCheck2}
            emptyTitle="No evidence documents stored"
            emptyDescription="Evidence attachments and audit verification files will appear here once connected to object storage."
            emptyActionText="Upload Evidence"
            onEmptyAction={() => setIsUploadModalOpen(true)}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Audit Trail Filters */}
          <FilterBar
            searchPlaceholder="Search audit events by user, action, or IP address..."
            searchValue={auditSearch}
            onSearchChange={setAuditSearch}
            filters={auditFilterOptions}
            activeFilterValues={auditFilters}
            onFilterChange={(k, v) => setAuditFilters((prev) => ({ ...prev, [k]: v }))}
            onResetFilters={() => {
              setAuditSearch('');
              setAuditFilters({});
            }}
          />

          {/* Empty Audit Trail Table */}
          <DataTableShell
            columns={auditTableColumns}
            emptyIcon={History}
            emptyTitle="No audit trail records found"
            emptyDescription="All security events, role modifications, data submissions, and reviewer sign-offs are logged into an immutable audit stream."
          />
        </div>
      )}

      {/* Modal */}
      <UploadEvidenceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onShowToast={addToast}
      />
    </div>
  );
};
