import React, { useState } from 'react';
import {
  Save,
  CheckCircle2,
  Send,
  FileText,
  Calendar,
  Layers,
  Database,
  Info,
} from 'lucide-react';
import type { DisclosureFieldDefinition } from '../../../types/contributor';

interface DynamicDisclosureFormProps {
  customFields?: DisclosureFieldDefinition[];
  onSaveDraft: (data: Record<string, unknown>) => void;
  onValidate: (data: Record<string, unknown>) => void;
  onSubmitForReview: (data: Record<string, unknown>) => void;
  disabled?: boolean;
}

export const DynamicDisclosureForm: React.FC<DynamicDisclosureFormProps> = ({
  customFields = [],
  onSaveDraft,
  onValidate,
  onSubmitForReview,
  disabled = false,
}) => {
  // Temporary component-only state — not saved to persistent storage
  const [reportedValue, setReportedValue] = useState('');
  const [unit, setUnit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [collectionMethod, setCollectionMethod] = useState('');
  const [methodology, setMethodology] = useState('');
  const [assumptions, setAssumptions] = useState('');
  const [remarks, setRemarks] = useState('');
  const [internalRef, setInternalRef] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({});

  const formData = {
    reportedValue,
    unit,
    startDate,
    endDate,
    dataSource,
    collectionMethod,
    methodology,
    assumptions,
    remarks,
    internalRef,
    ...customValues,
  };

  const handleCustomFieldChange = (fieldId: string, val: unknown) => {
    setCustomValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitForReview(formData);
      }}
      className="space-y-6"
    >
      {/* Primary Value Entry Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Primary Metric Value Entry
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Form state held in temporary React memory only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Reported Value */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reported Value <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reportedValue}
              onChange={(e) => setReportedValue(e.target.value)}
              disabled={disabled}
              placeholder="e.g. 125000.50 or Qualitative description"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Unit of Measurement */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Unit of Measurement <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={disabled}
              placeholder="e.g. MT, kWh, kL, INR Lakhs, Numbers"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Internal Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Reference / Voucher ID
            </label>
            <input
              type="text"
              value={internalRef}
              onChange={(e) => setInternalRef(e.target.value)}
              disabled={disabled}
              placeholder="e.g. SAP-DOC-2026-981"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Date Boundaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Reporting Period Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={disabled}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Reporting Period End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={disabled}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Backend-Configured Fields Slot (Rendered if configured) */}
      {customFields.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Configured Disclosure Fields
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customFields.map((field) => (
              <div key={field.id}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>
                {field.description && (
                  <p className="text-[11px] text-slate-400 mb-1">{field.description}</p>
                )}
                <input
                  type={field.type === 'integer' || field.type === 'decimal' ? 'number' : 'text'}
                  value={(customValues[field.id] as string) || ''}
                  onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                  disabled={disabled}
                  placeholder={`Enter ${field.label.toLowerCase()}${field.unit ? ` in ${field.unit}` : ''}`}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Source & Methodology Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-teal-700" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Data Source &amp; Methodology
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Data Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Data Source
            </label>
            <input
              type="text"
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              disabled={disabled}
              placeholder="e.g. Utility Bills, Flow Meters, ERP Log, HR Portal"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Collection Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Collection / Measurement Method
            </label>
            <input
              type="text"
              value={collectionMethod}
              onChange={(e) => setCollectionMethod(e.target.value)}
              disabled={disabled}
              placeholder="e.g. Direct metering, Invoice reconciliation, Estimation"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Methodology Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Calculation Methodology &amp; Standard Followed
          </label>
          <textarea
            rows={3}
            value={methodology}
            onChange={(e) => setMethodology(e.target.value)}
            disabled={disabled}
            placeholder="Specify standards, formulas, or standard GHG protocol / CEA emission baseline applied…"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {/* Assumptions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Key Assumptions / Estimations
          </label>
          <textarea
            rows={2}
            value={assumptions}
            onChange={(e) => setAssumptions(e.target.value)}
            disabled={disabled}
            placeholder="Document any data interpolations, boundary exclusions, or operational assumptions…"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {/* Contributor Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Contributor Remarks &amp; Context
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={disabled}
            placeholder="Add relevant operational context or explanatory notes for the Reviewer…"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed resize-none"
          />
        </div>
      </div>

      {/* Form Action Buttons Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Info className="w-4 h-4 text-teal-700" />
          <span>Inputs are stored in active React state for this session</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Save Draft */}
          <button
            type="button"
            onClick={() => onSaveDraft(formData)}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 text-slate-600" />
            <span>Save Draft</span>
          </button>

          {/* Validate Data */}
          <button
            type="button"
            onClick={() => onValidate(formData)}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <span>Validate Data</span>
          </button>

          {/* Submit for Review */}
          <button
            type="button"
            onClick={() => onSubmitForReview(formData)}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>Submit for Review</span>
          </button>
        </div>
      </div>
    </form>
  );
};
