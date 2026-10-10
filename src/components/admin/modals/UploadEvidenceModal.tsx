import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { BackendNotice } from '../common/BackendNotice';
import { EvidenceService } from '../../../services';
import type { EvidenceUploadInput } from '../../../types/services';
import { UploadCloud, FileUp, AlertCircle } from 'lucide-react';

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const INITIAL_FORM: EvidenceUploadInput = {
  title: '',
  documentType: 'Third-Party Assurance Report',
  projectPlant: '',
  reportingPeriod: '',
  disclosureId: '',
  notes: '',
};

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<EvidenceUploadInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Document title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await EvidenceService.uploadEvidence(formData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Evidence storage will be enabled after backend integration.';
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
      title="Upload Evidence Document"
      subtitle="Attach audit certificates, meter calibration logs, and utility bills"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800" noValidate>
        <BackendNotice message="Evidence storage will be enabled after backend integration. Files are not uploaded during prototype demonstration." />

        {/* Dropzone Shell */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 transition-colors bg-slate-50/50">
          <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Choose a file or drag & drop</p>
          <p className="text-xs text-slate-500 mt-1">
            PDF, DOCX, XLSX, PNG up to 25MB (Storage disabled in prototype)
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Document Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. FY26 Scope 1 GHG Verification Certificate"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          />
          {errors.title && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Document Category
          </label>
          <select
            value={formData.documentType}
            onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          >
            <option value="Third-Party Assurance Report">Third-Party Assurance Report</option>
            <option value="Utility / Electricity Invoice">Utility / Electricity Invoice</option>
            <option value="Water Meter Reading Log">Water Meter Reading Log</option>
            <option value="Safety & HSE Audit Report">Safety & HSE Audit Report</option>
            <option value="CSR Expenditure Receipt">CSR Expenditure Receipt</option>
            <option value="HR Policy / Training Register">HR Policy / Training Register</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Audit Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Provide context for the external auditor or assurer..."
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          />
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
            <FileUp className="w-4 h-4" />
            <span>Upload Evidence</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
