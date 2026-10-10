import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Paperclip,
  X,
} from 'lucide-react';
import { EmptyState } from '../../admin/common/EmptyState';

const ACCEPTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.csv', '.docx'];
const MAX_FILE_SIZE_MB = 25;

interface EvidenceAttachmentPanelProps {
  onAttemptUpload: (fileInfo: { name: string; size: number }) => void;
  disabled?: boolean;
}

export const EvidenceAttachmentPanel: React.FC<EvidenceAttachmentPanelProps> = ({
  onAttemptUpload,
  disabled = false,
}) => {
  const [evidenceType, setEvidenceType] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [description, setDescription] = useState('');
  const [confidentiality, setConfidentiality] = useState('internal');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setFileError(`Unsupported format "${extension}". Supported formats: ${ACCEPTED_EXTENSIONS.join(', ')}`);
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File size exceeds ${MAX_FILE_SIZE_MB}MB maximum limit.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    if (!selectedFile) {
      setFileError('Please select a file to attach as evidence.');
      return;
    }

    // Call callback to show toast: Evidence upload will be enabled after secure backend storage is connected.
    onAttemptUpload({
      name: selectedFile.name,
      size: selectedFile.size,
    });
  };

  const handleClearSelected = () => {
    setSelectedFile(null);
    setFileError(null);
  };

  return (
    <div className="space-y-6">
      {/* Evidence Upload Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Attach Supporting Evidence Document
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Max {MAX_FILE_SIZE_MB}MB &middot; PDF, PNG, JPG, XLSX, CSV, DOCX
          </span>
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Evidence Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Evidence Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              disabled={disabled}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-teal-700 transition-colors disabled:opacity-60"
            >
              <option value="">Select evidence category…</option>
              <option value="utility_bill">Electricity / Water Utility Invoice</option>
              <option value="meter_log">Direct Flow / Meter Logbook</option>
              <option value="third_party_audit">Third-Party Lab / Audit Report</option>
              <option value="policy_document">Approved Corporate Policy / SOP</option>
              <option value="board_resolution">Board Resolution / CSR Committee Minutes</option>
              <option value="hr_summary">HR / Payroll Reconciliation Summary</option>
              <option value="certificate">ISO / Regulatory Compliance Certificate</option>
              <option value="other">Other Verifiable Artifact</option>
            </select>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              disabled={disabled}
              placeholder="e.g. FY25-26 Solar Generation Summary Report"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 transition-colors disabled:opacity-60"
            />
          </div>

          {/* Document Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Document Date
            </label>
            <input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              disabled={disabled}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-teal-700 transition-colors disabled:opacity-60"
            />
          </div>

          {/* Issuing Authority / Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Issuing Authority / Vendor
            </label>
            <input
              type="text"
              value={issuingAuthority}
              onChange={(e) => setIssuingAuthority(e.target.value)}
              disabled={disabled}
              placeholder="e.g. State Electricity Board / TUV SUD"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 transition-colors disabled:opacity-60"
            />
          </div>

          {/* Confidentiality Classification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confidentiality
            </label>
            <select
              value={confidentiality}
              onChange={(e) => setConfidentiality(e.target.value)}
              disabled={disabled}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-teal-700 transition-colors disabled:opacity-60"
            >
              <option value="internal">Internal ESG Use Only</option>
              <option value="confidential">Confidential / NDA</option>
              <option value="public">Public Disclosable</option>
            </select>
          </div>

          {/* Description */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Evidence Description &amp; Traceability Note
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={disabled}
              placeholder="Brief note detailing which pages or tables verify the reported numbers…"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 transition-colors disabled:opacity-60"
            />
          </div>
        </div>

        {/* File Dropzone */}
        <div className="border-2 border-dashed border-slate-200 hover:border-teal-600 rounded-xl p-6 text-center bg-slate-50/50 transition-colors">
          <input
            type="file"
            id="evidence-file-input"
            onChange={handleFileSelect}
            disabled={disabled}
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv,.docx"
            className="hidden"
          />

          {!selectedFile ? (
            <label
              htmlFor="evidence-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drag and drop supporting document
              </p>
              <p className="text-xs text-slate-500">
                Supported formats: PDF, PNG, JPG, XLSX, CSV, DOCX (Up to 25MB)
              </p>
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200 shadow-xs max-w-lg mx-auto">
              <div className="flex items-center gap-3 overflow-hidden text-left">
                <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB &middot; Ready for upload
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearSelected}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                title="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {fileError && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-rose-600 mt-3 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{fileError}</span>
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={!selectedFile || disabled}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Attach Evidence</span>
          </button>
        </div>
      </div>

      {/* Uploaded Evidence Documents List (Empty State) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          Attached Documents for this Reporting Task
        </h4>
        <EmptyState
          icon={Paperclip}
          title="No evidence documents attached."
          description="Evidence attached to this disclosure will be listed here with verification status once secure backend file storage is connected."
          compact
        />
      </div>
    </div>
  );
};
