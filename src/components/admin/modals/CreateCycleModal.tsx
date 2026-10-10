import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { BackendNotice } from '../common/BackendNotice';
import { ReportingCycleService } from '../../../services';
import type { ReportingCycleInput } from '../../../types/services';
import { CalendarClock, AlertCircle } from 'lucide-react';

interface CreateCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const INITIAL_FORM: ReportingCycleInput = {
  cycleName: '',
  financialYearStart: '',
  financialYearEnd: '',
  reportingBoundary: 'Consolidated',
  reportPackage: 'Comprehensive',
  frequency: 'Annual',
  contributorDeadline: '',
  reviewerDeadline: '',
  correctionDeadline: '',
  finalLockDate: '',
  previousCycle: '',
  status: 'Draft',
};

export const CreateCycleModal: React.FC<CreateCycleModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<ReportingCycleInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.cycleName.trim()) errs.cycleName = 'Cycle name is required';
    if (!formData.financialYearStart) errs.financialYearStart = 'FY start date is required';
    if (!formData.financialYearEnd) errs.financialYearEnd = 'FY end date is required';
    if (!formData.contributorDeadline) errs.contributorDeadline = 'Contributor deadline is required';
    if (!formData.reviewerDeadline) errs.reviewerDeadline = 'Reviewer deadline is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await ReportingCycleService.createReportingCycle(formData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Backend connection is required to save this information.';
      onShowToast(message, 'warning');
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Reporting Cycle"
      subtitle="Define timelines, reporting boundary, and submission deadlines for BRSR disclosures"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800" noValidate>
        <BackendNotice message="Backend connection is required to create reporting cycles. Cycle configurations will be orchestrated by the backend scheduler." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cycle Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reporting Cycle Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.cycleName}
              onChange={(e) => setFormData({ ...formData, cycleName: e.target.value })}
              placeholder="e.g. MEIL Annual BRSR Reporting Cycle 2026-27"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            {errors.cycleName && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.cycleName}
              </p>
            )}
          </div>

          {/* Financial Year Start */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              FY Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.financialYearStart}
              onChange={(e) => setFormData({ ...formData, financialYearStart: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            {errors.financialYearStart && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.financialYearStart}
              </p>
            )}
          </div>

          {/* Financial Year End */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              FY End Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.financialYearEnd}
              onChange={(e) => setFormData({ ...formData, financialYearEnd: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            {errors.financialYearEnd && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.financialYearEnd}
              </p>
            )}
          </div>

          {/* Reporting Boundary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reporting Boundary <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.reportingBoundary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reportingBoundary: e.target.value as ReportingCycleInput['reportingBoundary'],
                })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            >
              <option value="Consolidated">Consolidated (Group-wide)</option>
              <option value="Standalone">Standalone (Parent entity only)</option>
            </select>
          </div>

          {/* Report Package */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Report Package <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.reportPackage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reportPackage: e.target.value as ReportingCycleInput['reportPackage'],
                })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            >
              <option value="Comprehensive">Comprehensive (Full SEBI BRSR)</option>
              <option value="Core">Core (BRSR Core Indicators)</option>
              <option value="Lite">Lite (Internal Assessment)</option>
            </select>
          </div>

          {/* Collection Frequency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Data Collection Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  frequency: e.target.value as ReportingCycleInput['frequency'],
                })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            >
              <option value="Annual">Annual</option>
              <option value="Semi-Annual">Semi-Annual</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          {/* Contributor Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Contributor Deadline <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.contributorDeadline}
              onChange={(e) => setFormData({ ...formData, contributorDeadline: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            {errors.contributorDeadline && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.contributorDeadline}
              </p>
            )}
          </div>

          {/* Reviewer Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reviewer Deadline <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.reviewerDeadline}
              onChange={(e) => setFormData({ ...formData, reviewerDeadline: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            {errors.reviewerDeadline && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.reviewerDeadline}
              </p>
            )}
          </div>

          {/* Final Lock Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Final Lock Date
            </label>
            <input
              type="date"
              value={formData.finalLockDate}
              onChange={(e) => setFormData({ ...formData, finalLockDate: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#003B73] hover:bg-[#002B54] rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          >
            <CalendarClock className="w-4 h-4" />
            <span>Create Cycle</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
