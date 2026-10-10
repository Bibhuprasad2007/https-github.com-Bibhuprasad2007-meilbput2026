import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Search,
  FileText,
  RotateCcw,
  MessageSquare,
  ShieldAlert,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { PageHeader } from '../../admin/common/PageHeader';
import { MetricCard } from '../../admin/common/MetricCard';
import { useNexusData } from '../../../context/NexusDataContext';

export const ContributorCorrectionsPage: React.FC = () => {
  const { dossiers, resubmitRowCorrection } = useNexusData();

  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeCorrectionId, setActiveCorrectionId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [contributorNote, setContributorNote] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Extract all correction items from dossiers in real-time
  const correctionItems = useMemo(() => {
    const list: {
      id: string;
      dossierId: string;
      rowId: string;
      fieldLabel: string;
      indicatorCode: string;
      principle: string;
      projectName: string;
      siteName: string;
      monthName: string;
      financialYear: string;
      previousValue: string | number;
      currentValue: string | number;
      unit: string;
      reviewerName: string;
      reviewerCategory: string;
      reviewerComment: string;
      suggestedCorrection?: string;
      requestedDate: string;
      deadline: string;
      status: 'PENDING_CONTRIBUTOR' | 'RESUBMITTED' | 'RESOLVED';
      version: number;
      evidenceCount: number;
      contributorResponse?: string;
    }[] = [];

    dossiers.forEach((d) => {
      Object.values(d.rows || {}).forEach((r) => {
        if (
          r.reviewStatus === 'CORRECTION_REQUIRED' ||
          r.reviewStatus === 'RESUBMITTED' ||
          (r.reviewerDecision?.status === 'CORRECTION_REQUIRED' && r.reviewStatus === 'VERIFIED')
        ) {
          const isPending = r.reviewStatus === 'CORRECTION_REQUIRED';
          const isResub = r.reviewStatus === 'RESUBMITTED';
          const isResolved = r.reviewStatus === 'VERIFIED';

          // Find contributor's last response if any
          const lastResubmitHistory = r.reviewerDecision?.history?.find((h) => h.action === 'RESUBMITTED');

          list.push({
            id: `${d.dossierId}_${r.id}`,
            dossierId: d.dossierId,
            rowId: r.id,
            fieldLabel: r.name,
            indicatorCode: r.id,
            principle: r.principleTitle,
            projectName: d.projectName,
            siteName: d.siteName,
            monthName: d.monthName,
            financialYear: d.financialYear,
            previousValue: r.previousMonthValue || r.currentValue,
            currentValue: r.currentValue,
            unit: r.unit,
            reviewerName: r.reviewerDecision?.reviewerName || 'Aarav Patel (Review Lead)',
            reviewerCategory: r.reviewerDecision?.correctionReasonCategory || 'Incorrect value',
            reviewerComment: r.reviewerDecision?.correctionReason || 'Please verify and adjust metric value.',
            suggestedCorrection: r.reviewerDecision?.suggestedCorrection,
            requestedDate: r.reviewerDecision?.reviewTimestamp || 'Recent',
            deadline: '7 days from request',
            status: isPending ? 'PENDING_CONTRIBUTOR' : isResub ? 'RESUBMITTED' : 'RESOLVED',
            version: r.version || 1,
            evidenceCount: r.evidenceFiles?.length || 0,
            contributorResponse: lastResubmitHistory?.comment,
          });
        }
      });
    });

    return list;
  }, [dossiers]);

  const activeCorrection = correctionItems.find((c) => c.id === activeCorrectionId);

  const pendingCount = correctionItems.filter((c) => c.status === 'PENDING_CONTRIBUTOR').length;
  const resubmittedCount = correctionItems.filter((c) => c.status === 'RESUBMITTED').length;
  const resolvedCount = correctionItems.filter((c) => c.status === 'RESOLVED').length;

  const filteredCorrections = useMemo(() => {
    return correctionItems.filter((c) => {
      const q = searchValue.toLowerCase();
      const matchesSearch =
        c.fieldLabel.toLowerCase().includes(q) ||
        c.reviewerComment.toLowerCase().includes(q) ||
        c.indicatorCode.toLowerCase().includes(q) ||
        c.projectName.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'pending' && c.status === 'PENDING_CONTRIBUTOR') ||
        (selectedStatus === 'resubmitted' && c.status === 'RESUBMITTED') ||
        (selectedStatus === 'resolved' && c.status === 'RESOLVED');

      return matchesSearch && matchesStatus;
    });
  }, [correctionItems, searchValue, selectedStatus]);

  const handleOpenCorrection = (corrId: string) => {
    const corr = correctionItems.find((c) => c.id === corrId);
    if (!corr) return;
    setActiveCorrectionId(corrId);
    setEditValue(String(corr.currentValue));
    setContributorNote(corr.contributorResponse || '');
    setActionSuccessMessage(null);
    setFormError(null);
  };

  const handleSaveAndResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCorrection) return;
    setFormError(null);

    if (!editValue.trim()) {
      setFormError('Corrected value cannot be empty.');
      return;
    }

    if (!contributorNote.trim()) {
      setFormError('Please provide an explanatory remark for the Reviewer.');
      return;
    }

    // Call real backend resubmission workflow
    const res = resubmitRowCorrection(
      activeCorrection.dossierId,
      activeCorrection.rowId,
      editValue,
      contributorNote
    );

    if (res.success) {
      setActionSuccessMessage(
        `✓ Successfully resubmitted "${activeCorrection.fieldLabel}" (Revision v${activeCorrection.version + 1}) for Reviewer sign-off!`
      );
      setTimeout(() => {
        setActiveCorrectionId(null);
        setActionSuccessMessage(null);
      }, 1600);
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <PageHeader
          title="Data Contributor Correction Center"
          description="Direct reviewer-flagged ESG values, anomaly inquiries, and row-level correction action items synchronized in real-time."
        />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-semibold shrink-0">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Two-Way Reviewer Sync Active</span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Action Required"
          value={pendingCount.toString()}
          icon={AlertTriangle}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          accentBorder="border-l-amber-500"
        />
        <MetricCard
          title="Resubmitted for Review"
          value={resubmittedCount.toString()}
          icon={Send}
          iconBg="bg-teal-50"
          iconColor="text-teal-700"
          accentBorder="border-l-teal-600"
        />
        <MetricCard
          title="Resolved & Verified"
          value={resolvedCount.toString()}
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          accentBorder="border-l-emerald-500"
        />
        <MetricCard
          title="Active Projects Impacted"
          value={dossiers.length.toString()}
          icon={Clock}
          iconBg="bg-slate-50"
          iconColor="text-slate-600"
          accentBorder="border-l-slate-400"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search corrections by indicator, code, project, or reviewer note..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-teal-700"
          >
            <option value="all">All Statuses ({correctionItems.length})</option>
            <option value="pending">Action Required ({pendingCount})</option>
            <option value="resubmitted">Resubmitted ({resubmittedCount})</option>
            <option value="resolved">Resolved ({resolvedCount})</option>
          </select>
        </div>
      </div>

      {/* Corrections List */}
      <div className="space-y-4">
        {filteredCorrections.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No active corrections in queue</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              All submitted ESG disclosures are either under review or verified by the Reviewer. When a Reviewer marks a row Incorrect, it will instantly arrive here.
            </p>
          </div>
        ) : (
          filteredCorrections.map((corr) => {
            const isPending = corr.status === 'PENDING_CONTRIBUTOR';
            const isResub = corr.status === 'RESUBMITTED';

            return (
              <div
                key={corr.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                  isPending
                    ? 'border-l-4 border-l-amber-500 border-slate-200'
                    : isResub
                    ? 'border-l-4 border-l-teal-600 border-slate-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isPending
                          ? 'bg-amber-100 text-amber-700'
                          : isResub
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isPending ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : isResub ? (
                        <Send className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {corr.indicatorCode}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{corr.fieldLabel}</h4>
                        {corr.version > 1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                            v{corr.version}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {corr.projectName} &bull; {corr.siteName} &bull; {corr.monthName} ({corr.financialYear})
                      </p>
                    </div>
                  </div>

                  <div>
                    {isPending ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                        Action Required
                      </span>
                    ) : isResub ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-300">
                        Resubmitted (Awaiting Audit)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Verified &amp; Resolved
                      </span>
                    )}
                  </div>
                </div>

                {/* Reviewer Rejection Note Box */}
                <div className="mt-3.5 bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reviewer Feedback from {corr.reviewerName}:</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200/60 font-semibold">
                      [{corr.reviewerCategory}]
                    </span>
                  </div>
                  <p className="leading-relaxed font-medium">{corr.reviewerComment}</p>
                  {corr.suggestedCorrection && (
                    <p className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/50">
                      <strong>Expected Guidance:</strong> {corr.suggestedCorrection}
                    </p>
                  )}
                </div>

                {/* Current Value & Evidence Status */}
                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Currently Reported Value</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {corr.currentValue} {corr.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Attached Evidence</span>
                    <span className="font-semibold text-teal-700">
                      {corr.evidenceCount > 0 ? `${corr.evidenceCount} file(s) attached` : 'Self-declared'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Reviewer Identity</span>
                    <span className="text-slate-700 font-medium">{corr.reviewerName}</span>
                  </div>
                </div>

                {/* Contributor Action Strip */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500">
                    {corr.contributorResponse && (
                      <span>Last Response: <em>&quot;{corr.contributorResponse}&quot;</em></span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenCorrection(corr.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#003B73] hover:bg-[#002850] text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isPending ? 'Correct Value & Resubmit' : 'View / Edit Revision'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolution & Resubmission Modal */}
      {activeCorrection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="bg-[#0B1528] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Contributor Revision Center
                </span>
                <h3 className="text-base font-bold text-white">{activeCorrection.fieldLabel}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCorrectionId(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveAndResubmit} className="p-6 space-y-4 text-xs">
              {actionSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMessage}</span>
                </div>
              )}

              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Reviewer Comment Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-950">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Reviewer Feedback ({activeCorrection.reviewerCategory}):
                </span>
                <p className="leading-relaxed">{activeCorrection.reviewerComment}</p>
                {activeCorrection.suggestedCorrection && (
                  <p className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/50">
                    <strong>Guidance:</strong> {activeCorrection.suggestedCorrection}
                  </p>
                )}
              </div>

              {/* Field Value Adjustment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Corrected Value ({activeCorrection.unit}): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-teal-700"
                  placeholder="Enter corrected value..."
                  required
                />
              </div>

              {/* Contributor Explanation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contributor Explanation / Rebuttal: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={contributorNote}
                  onChange={(e) => setContributorNote(e.target.value)}
                  placeholder="Explain the source of this corrected figure or reconcile the flagged discrepancy..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-teal-700"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveCorrectionId(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white bg-teal-700 hover:bg-teal-600 font-bold shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Correction (Save Revision v{activeCorrection.version + 1})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
