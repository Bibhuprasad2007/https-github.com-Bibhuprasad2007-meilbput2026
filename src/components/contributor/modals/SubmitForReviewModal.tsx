import React, { useState } from 'react';
import { Send, AlertCircle, FileCheck } from 'lucide-react';
import { Modal } from '../../ui/Modal';

interface SubmitForReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentCode?: string;
  assignmentName?: string;
  onSubmitConfirm: (finalNote: string) => void;
}

export const SubmitForReviewModal: React.FC<SubmitForReviewModalProps> = ({
  isOpen,
  onClose,
  assignmentCode = '--',
  assignmentName = '--',
  onSubmitConfirm,
}) => {
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [finalNote, setFinalNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAccepted) {
      setError('You must accept the Contributor declaration before submitting.');
      return;
    }
    setError(null);
    onSubmitConfirm(finalNote);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Disclosure for Review"
      subtitle={`Verify completeness and submit ${assignmentCode} to assigned Reviewer.`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Pre-submission Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Completeness
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">--</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Validation
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">--</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Evidence Files
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">--</p>
          </div>
        </div>

        {/* Task Info Note */}
        <div className="p-3.5 rounded-lg bg-teal-50/70 border border-teal-200 text-xs text-teal-950 space-y-1">
          <p className="font-semibold flex items-center gap-1.5 text-teal-900">
            <FileCheck className="w-4 h-4 text-teal-700" />
            <span>Target Disclosure: {assignmentCode}</span>
          </p>
          <p className="text-slate-600">{assignmentName}</p>
        </div>

        {/* Final Note (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Final Submission Note for Reviewer (Optional)
          </label>
          <textarea
            rows={2}
            value={finalNote}
            onChange={(e) => setFinalNote(e.target.value)}
            placeholder="Add any final remarks or highlights regarding this disclosure submission…"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors resize-none"
          />
        </div>

        {/* Mandatory Contributor Declaration Checkbox */}
        <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/80">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={declarationAccepted}
              onChange={(e) => {
                setDeclarationAccepted(e.target.checked);
                if (error) setError(null);
              }}
              className="mt-0.5 w-4 h-4 text-teal-700 border-slate-300 rounded focus:ring-teal-600"
            />
            <span className="text-xs text-slate-800 font-medium leading-relaxed">
              I confirm that the information entered is accurate to the best of my knowledge and is supported by the attached evidence.
            </span>
          </label>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!declarationAccepted}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Review</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
