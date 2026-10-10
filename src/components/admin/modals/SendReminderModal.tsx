import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { BackendNotice } from '../common/BackendNotice';
import { AssignmentService } from '../../../services';
import type { ReminderInput } from '../../../types/services';
import { Send, AlertCircle } from 'lucide-react';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const INITIAL_FORM: ReminderInput = {
  targetRole: 'All Pending Contributors',
  scope: 'All Reporting Scopes',
  subject: 'BRSR Reporting Reminder: Approaching Submission Deadline',
  message:
    'Dear Contributor, please ensure all required data points and supporting evidence for your assigned BRSR disclosures are submitted prior to the upcoming review deadline.',
  urgency: 'Medium',
};

export const SendReminderModal: React.FC<SendReminderModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<ReminderInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.message.trim()) errs.message = 'Message body is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await AssignmentService.sendReminder(formData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Backend connection is required to send reminders.';
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
      title="Send Submission Reminders"
      subtitle="Dispatch email and in-portal alerts to task assignees"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800" noValidate>
        <BackendNotice message="Notification dispatch service requires backend integration. Reminders are not broadcast during prototype demonstration." />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Target Audience
          </label>
          <select
            value={formData.targetRole}
            onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          >
            <option value="All Pending Contributors">All Pending Contributors</option>
            <option value="Overdue Task Owners">Overdue Task Owners</option>
            <option value="Reviewers with Pending Approvals">Reviewers with Pending Approvals</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Urgency Level
          </label>
          <select
            value={formData.urgency}
            onChange={(e) =>
              setFormData({
                ...formData,
                urgency: e.target.value as ReminderInput['urgency'],
              })
            }
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          >
            <option value="Low">Low - Informational notice</option>
            <option value="Medium">Medium - Regular reminder</option>
            <option value="High">High - Approaching deadline (48h)</option>
            <option value="Urgent">Urgent - Escalated overdue alert</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Subject Line <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          />
          {errors.subject && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.subject}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Message Body <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          />
          {errors.message && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.message}
            </p>
          )}
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
            <Send className="w-4 h-4" />
            <span>Send Reminder</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
