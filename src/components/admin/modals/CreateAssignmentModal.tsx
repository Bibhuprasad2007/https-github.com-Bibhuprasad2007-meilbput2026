import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { BackendNotice } from '../common/BackendNotice';
import { AssignmentService } from '../../../services';
import type { TaskAssignmentInput } from '../../../types/services';
import { ClipboardList, AlertCircle } from 'lucide-react';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const INITIAL_FORM: TaskAssignmentInput = {
  reportingCycleId: '',
  section: 'Section A - General Disclosures',
  principle: '',
  disclosureId: '',
  subsidiary: '',
  businessUnit: '',
  projectPlant: '',
  department: '',
  contributorId: '',
  reviewerId: '',
  frequency: 'Annual',
  evidenceRequired: true,
  dueDate: '',
  reminderRule: '3 days before deadline',
};

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<TaskAssignmentInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.dueDate) errs.dueDate = 'Due date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await AssignmentService.createAssignment(formData);
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
      title="Create BRSR Task Assignment"
      subtitle="Assign disclosure responsibilities to contributors and review workflows"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800" noValidate>
        <BackendNotice message="Backend service required to fetch live disclosures, projects, and users for task assignment." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Reporting Cycle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reporting Cycle <span className="text-rose-500">*</span>
            </label>
            <select
              disabled
              className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-lg text-slate-400 cursor-not-allowed"
            >
              <option>No reporting cycle loaded (Backend required)</option>
            </select>
          </div>

          {/* BRSR Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              BRSR Section <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            >
              <option value="Section A - General Disclosures">Section A - General Disclosures</option>
              <option value="Section B - Management and Process Disclosures">
                Section B - Management & Process
              </option>
              <option value="Section C - Principle-wise Performance (P1-P9)">
                Section C - Principle Performance
              </option>
              <option value="BRSR Core - KPIs">BRSR Core - Mandatory KPIs</option>
            </select>
          </div>

          {/* Principle Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Principle (P1 - P9)
            </label>
            <select
              value={formData.principle}
              onChange={(e) => setFormData({ ...formData, principle: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            >
              <option value="">Select Principle...</option>
              <option value="P1">P1: Ethics & Transparency</option>
              <option value="P2">P2: Safe & Sustainable Goods</option>
              <option value="P3">P3: Employee Wellbeing</option>
              <option value="P4">P4: Stakeholder Interests</option>
              <option value="P5">P5: Human Rights</option>
              <option value="P6">P6: Environmental Protection</option>
              <option value="P7">P7: Public & Regulatory Policy</option>
              <option value="P8">P8: Inclusive Growth</option>
              <option value="P9">P9: Customer Value</option>
            </select>
          </div>

          {/* Disclosure Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Disclosure Question <span className="text-rose-500">*</span>
            </label>
            <select
              disabled
              className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-lg text-slate-400 cursor-not-allowed"
            >
              <option>Backend data required to load disclosures</option>
            </select>
          </div>

          {/* Contributor Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Contributor <span className="text-rose-500">*</span>
            </label>
            <select
              disabled
              className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-lg text-slate-400 cursor-not-allowed"
            >
              <option>Backend data required to select users</option>
            </select>
          </div>

          {/* Reviewer Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Reviewer <span className="text-rose-500">*</span>
            </label>
            <select
              disabled
              className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-lg text-slate-400 cursor-not-allowed"
            >
              <option>Backend data required to select reviewers</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            {errors.dueDate && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.dueDate}
              </p>
            )}
          </div>

          {/* Evidence Requirement */}
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.evidenceRequired}
                onChange={(e) => setFormData({ ...formData, evidenceRequired: e.target.checked })}
                className="w-4 h-4 text-[#003B73] border-slate-300 rounded focus:ring-[#003B73]"
              />
              <span className="text-sm text-slate-700 font-medium">Mandatory Audit Evidence File</span>
            </label>
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
            <ClipboardList className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
