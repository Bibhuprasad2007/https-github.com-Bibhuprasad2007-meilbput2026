import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Building2,
  ShieldCheck,
  Radio,
  X,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
  Printer,
  FileCheck2,
} from 'lucide-react';
import { useDemoAuth } from '../../../context/DemoAuthContext';
import { apiClient, type FinalEsgReport, type CompanyProfile } from '../../../services/apiClient';

export const ReportsPage: React.FC = () => {
  const { session } = useDemoAuth();

  const [reports, setReports] = useState<FinalEsgReport[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastStreamUpdate, setLastStreamUpdate] = useState<string>('Just now');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fyFilter, setFyFilter] = useState<string>('ALL');

  // Modals state
  const [previewReport, setPreviewReport] = useState<FinalEsgReport | null>(null);
  const [detailsReport, setDetailsReport] = useState<FinalEsgReport | null>(null);
  const [returnTargetReport, setReturnTargetReport] = useState<FinalEsgReport | null>(null);
  const [returnReason, setReturnReason] = useState<string>('');
  const [approveTargetReport, setApproveTargetReport] = useState<FinalEsgReport | null>(null);
  const [approveRemarks, setApproveRemarks] = useState<string>('');
  const [isActionPending, setIsActionPending] = useState<boolean>(false);

  // 1. Fetch reports & company profile
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [fetchedReports, profile] = await Promise.all([
        apiClient.getManagementReports(),
        apiClient.getCompanyProfile(),
      ]);
      setReports(fetchedReports);
      if (profile) setCompanyProfile(profile);
      setLastStreamUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load management reports:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Subscribe to real-time backend verification and report events
  useEffect(() => {
    const unsubscribe = apiClient.subscribeToEvents((event, data) => {
      setLastStreamUpdate(new Date().toLocaleTimeString());

      if (event === 'final_report_submitted') {
        setToastMessage(`⚡ Live Update: New final BRSR report "${data.reportId}" submitted by Auditor! PDF ready.`);
        loadData();
      } else if (event === 'report_returned_to_auditor') {
        setToastMessage(`⚡ Live Update: Report "${data.reportId}" returned to Auditor for rectification.`);
        loadData();
      } else if (event === 'report_approved_by_management') {
        setToastMessage(`⚡ Live Update: Executive board sign-off recorded for report "${data.reportId}"!`);
        loadData();
      } else if (event === 'report_pdf_regenerated') {
        setToastMessage(`⚡ Live Update: PDF regenerated for report "${data.reportId}".`);
        loadData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        !searchQuery.trim() ||
        r.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.submittedByAuditor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.financialYear.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesFY = fyFilter === 'ALL' || r.financialYear === fyFilter;

      return matchesSearch && matchesStatus && matchesFY;
    });
  }, [reports, searchQuery, statusFilter, fyFilter]);

  // Summary counts
  const summaryMetrics = useMemo(() => {
    return {
      total: reports.length,
      awaitingReview: reports.filter((r) => r.status === 'SUBMITTED_TO_MANAGEMENT').length,
      approved: reports.filter((r) => r.status === 'MANAGEMENT_APPROVED').length,
      returned: reports.filter((r) => r.status === 'MANAGEMENT_RETURNED').length,
    };
  }, [reports]);

  // Handle Return to Auditor
  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTargetReport || !returnReason.trim()) return;

    try {
      setIsActionPending(true);
      const res = await apiClient.returnManagementReport(returnTargetReport.reportId, returnReason.trim());
      if (res.success) {
        setToastMessage(`✓ Report ${returnTargetReport.reportId} successfully returned to Auditor with tracked correction request.`);
        setReturnTargetReport(null);
        setReturnReason('');
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error returning report: ${err?.message || 'Server error'}`);
    } finally {
      setIsActionPending(false);
    }
  };

  // Handle Management Board Sign-Off
  const handleConfirmApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveTargetReport) return;

    try {
      setIsActionPending(true);
      const res = await apiClient.approveManagementReport(approveTargetReport.reportId, approveRemarks.trim());
      if (res.success) {
        setToastMessage(`✓ Executive board sign-off recorded! Report ${approveTargetReport.reportId} is fully approved.`);
        setApproveTargetReport(null);
        setApproveRemarks('');
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error approving report: ${err?.message || 'Server error'}`);
    } finally {
      setIsActionPending(false);
    }
  };

  // Handle PDF Regeneration
  const handleRegeneratePdf = async (reportId: string) => {
    try {
      setIsRefreshing(true);
      const res = await apiClient.regenerateManagementReportPdf(reportId);
      if (res.success) {
        setToastMessage(`✓ PDF regenerated successfully for report ${reportId}.`);
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error regenerating PDF: ${err?.message || 'Server error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-4 rounded-xl border border-sky-400 bg-slate-900 text-white shadow-xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white text-xs underline cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B1D33] via-[#0E2440] to-[#153459] text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Executive Board &amp; Management Portal
            </span>
            <span className="text-xs font-mono text-slate-300">
              Corporate Entity: <strong className="text-white">{companyProfile?.name || 'Megha Engineering & Infrastructures Limited (MEIL)'}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Final Statutory BRSR Reports &amp; PDF Center
          </h1>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Review, sign off, and download formal SEBI Business Responsibility &amp; Sustainability Reports (BRSR)
            generated automatically upon independent Statutory Auditor submission. Formatted to official corporate
            standards with Page 1 General Disclosures and Section B/C Nine-Principle disclosures.
          </p>
        </div>

        {/* Live SSE Stream Badge & Manual Refresh */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15 flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-emerald-300">
                LIVE REPORT STREAM
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                Updated: {lastStreamUpdate}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 active:scale-95 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
            title="Refresh finalized reports from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Reports</span>
          </button>
        </div>
      </div>

      {/* 
        ======================================================================
        SUMMARY KPI CARDS
        ======================================================================
      */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-slate-700">
          <span className="text-[11px] uppercase font-bold text-slate-500 block">Total Final Reports</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{summaryMetrics.total}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Formal BRSR Filings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[11px] uppercase font-bold text-slate-500 block">Awaiting Board Review</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{summaryMetrics.awaitingReview}</span>
          <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">Pending Sign-off</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-emerald-500">
          <span className="text-[11px] uppercase font-bold text-slate-500 block">Board Approved</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{summaryMetrics.approved}</span>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Ready for Annual Report</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-rose-500">
          <span className="text-[11px] uppercase font-bold text-slate-500 block">Returned for Rectification</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{summaryMetrics.returned}</span>
          <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">In Auditor Queue</span>
        </div>
      </div>

      {/* 
        ======================================================================
        FILTER & SEARCH TOOLBAR
        ======================================================================
      */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by Report ID, Project Name, Auditor, or Financial Year..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reset Filters button */}
          {(statusFilter !== 'ALL' || fyFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setFyFilter('ALL');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
              Report Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED_TO_MANAGEMENT">Submitted to Management</option>
              <option value="MANAGEMENT_APPROVED">Board Approved</option>
              <option value="MANAGEMENT_RETURNED">Returned to Auditor</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
              Financial Year
            </label>
            <select
              value={fyFilter}
              onChange={(e) => setFyFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="ALL">All Financial Years</option>
              <option value="FY 2026-27">FY 2026-27 (Current Active)</option>
              <option value="FY 2025-26">FY 2025-26 (Audited / Baseline)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
              Reporting Standard
            </label>
            <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold flex items-center justify-between">
              <span>SEBI BRSR Core Mandate</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">Official</span>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ======================================================================
        FINAL REPORTS LIST / TABLE
        ======================================================================
      */}
      {filteredReports.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No Final ESG Reports Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {reports.length === 0
              ? 'No finalized BRSR reports have been submitted by the Statutory Auditor yet. Once the Auditor reviews the verified records and clicks "Submit Final Report to Management", reports will appear here automatically.'
              : 'No reports match your current filter criteria. Try resetting the filters.'}
          </p>
          {reports.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setFyFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-bold text-sky-700 bg-sky-50 rounded-xl hover:bg-sky-100 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Report ID &amp; Version</th>
                  <th className="px-4 py-3">Entity &amp; Project Scope</th>
                  <th className="px-4 py-3">Financial Year</th>
                  <th className="px-4 py-3">Auditor &amp; Submission Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">PDF Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.reportId} className="hover:bg-slate-50/70 transition-colors">
                    {/* 1. Report ID & Version */}
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-purple-700 flex items-center gap-1.5">
                        <span>{report.reportId}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                          v{report.version}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {report.totalIndicators} Indicators ({report.principlesCovered} Principles)
                      </span>
                    </td>

                    {/* 2. Entity & Project Scope */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {companyProfile?.name || 'Megha Engineering & Infrastructures Limited (MEIL)'}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {report.projectName} {report.siteName ? `(${report.siteName})` : ''}
                      </div>
                    </td>

                    {/* 3. Financial Year */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{report.financialYear}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {report.reportingPeriod?.currentStart} to {report.reportingPeriod?.currentEnd}
                      </span>
                    </td>

                    {/* 4. Auditor & Date */}
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium">{report.submittedByAuditor}</div>
                      <div className="text-[10px] text-slate-400">{report.submittedAt}</div>
                    </td>

                    {/* 5. Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          report.status === 'MANAGEMENT_APPROVED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : report.status === 'MANAGEMENT_RETURNED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {report.status === 'MANAGEMENT_APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {report.status === 'MANAGEMENT_RETURNED' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        {report.status === 'SUBMITTED_TO_MANAGEMENT' && <Clock className="w-3 h-3 text-amber-600" />}
                        <span>
                          {report.status === 'MANAGEMENT_APPROVED'
                            ? 'Approved'
                            : report.status === 'MANAGEMENT_RETURNED'
                            ? 'Returned to Auditor'
                            : 'Awaiting Sign-off'}
                        </span>
                      </span>
                    </td>

                    {/* 6. PDF Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          report.pdfGenerationStatus === 'READY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : report.pdfGenerationStatus === 'FAILED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {report.pdfGenerationStatus === 'READY' ? 'PDF READY' : report.pdfGenerationStatus}
                      </span>
                    </td>

                    {/* 7. Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Preview PDF */}
                        <button
                          type="button"
                          onClick={() => setPreviewReport(report)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer flex items-center gap-1"
                          title="Preview full generated BRSR PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        {/* Download PDF */}
                        <a
                          href={apiClient.getPdfDownloadUrl(report.reportId, true)}
                          download={report.pdfFileName || `MEIL_BRSR_${report.reportId}.pdf`}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Download official PDF file"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setDetailsReport(report)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View metadata and disclosure snapshot"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Executive Sign-off button (if not already approved) */}
                        {report.status !== 'MANAGEMENT_APPROVED' && (
                          <button
                            type="button"
                            onClick={() => setApproveTargetReport(report)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white transition-colors cursor-pointer shadow-xs"
                            title="Board sign-off & approve report"
                          >
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Return to Auditor button */}
                        {report.status !== 'MANAGEMENT_RETURNED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setReturnTargetReport(report);
                              setReturnReason('');
                            }}
                            className="px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            title="Return report to Auditor with tracked reason"
                          >
                            <span>Return</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 
        ======================================================================
        MODAL 1: PDF PREVIEW MODAL
        ======================================================================
      */}
      {previewReport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#102744] text-white flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    PDF Document Preview
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {previewReport.reportId} (v{previewReport.version})
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  MEIL Business Responsibility &amp; Sustainability Report ({previewReport.financialYear})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={apiClient.getPdfDownloadUrl(previewReport.reportId, true)}
                  download={previewReport.pdfFileName || `MEIL_BRSR_${previewReport.reportId}.pdf`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="flex-1 bg-slate-200 relative overflow-hidden">
              <iframe
                src={apiClient.getPdfDownloadUrl(previewReport.reportId, false)}
                title="BRSR PDF Preview"
                className="w-full h-full border-none"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <div className="flex items-center gap-2">
                <span>Auditor: <strong>{previewReport.submittedByAuditor}</strong></span>
                <span>•</span>
                <span>File: <code className="font-mono text-slate-700">{previewReport.pdfFileName}</code></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRegeneratePdf(previewReport.reportId)}
                  className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Regenerate PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="px-4 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ======================================================================
        MODAL 2: REPORT DETAILS & SNAPSHOT MODAL
        ======================================================================
      */}
      {detailsReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Immutable Report Snapshot
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {detailsReport.reportId} (Version {detailsReport.version})
                </h3>
                <p className="text-xs text-slate-300">
                  {detailsReport.projectName} • {detailsReport.financialYear}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsReport(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Status</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{detailsReport.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Auditor Name</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{detailsReport.submittedByAuditor}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Submission Date</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{detailsReport.submittedAt}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">PDF Asset</span>
                  <span className="font-mono font-bold text-emerald-700 mt-0.5 block truncate">{detailsReport.pdfFileName}</span>
                </div>
              </div>

              {/* Auditor Notes */}
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 space-y-1">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-800 block">
                  Statutory Auditor Assurance Attestation
                </span>
                <p className="text-xs italic leading-relaxed">
                  "{detailsReport.auditNotes}"
                </p>
              </div>

              {/* Nine Principle Summary Table */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Nine-Principle Executive Disclosure Matrix
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Principle</th>
                        <th className="px-3 py-2">Disclosure Summary</th>
                        <th className="px-3 py-2">Key Metrics</th>
                        <th className="px-3 py-2">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detailsReport.datasetSnapshot.principlesSummary.map((ps) => (
                        <tr key={ps.principleCode} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 font-bold text-slate-900 whitespace-nowrap">
                            Principle {ps.principleNumber} ({ps.principleCode})
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            <strong>{ps.title}</strong> — {ps.summaryText}
                          </td>
                          <td className="px-3 py-2 text-slate-800 font-medium">
                            {ps.keyMetrics}
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {ps.auditStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <a
                href={apiClient.getPdfDownloadUrl(detailsReport.reportId, true)}
                download={detailsReport.pdfFileName || `MEIL_BRSR_${detailsReport.reportId}.pdf`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF File</span>
              </a>

              <button
                type="button"
                onClick={() => setDetailsReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ======================================================================
        MODAL 3: RETURN REPORT TO AUDITOR
        ======================================================================
      */}
      {returnTargetReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-rose-800 to-rose-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-400/30">
                  Return Report to Statutory Auditor
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  Return {returnTargetReport.reportId} (v{returnTargetReport.version})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReturnTargetReport(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-6 space-y-4 text-xs">
              <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                <span className="font-bold text-[11px] block">Controlled Governance Return Workflow:</span>
                <p className="leading-relaxed text-[11px]">
                  Returning this report will update its status to <em>Returned to Auditor</em>, create a tracked
                  rectification task in the Auditor queue, and preserve the current version snapshot in the audit log.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Mandatory Return Reason / Required Revisions *
                </label>
                <textarea
                  rows={4}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required
                  placeholder="Detail the specific findings, numerical discrepancies, or evidence requirements requiring auditor re-verification..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnTargetReport(null)}
                  disabled={isActionPending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionPending || !returnReason.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Return to Auditor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ======================================================================
        MODAL 4: EXECUTIVE BOARD SIGN-OFF
        ======================================================================
      */}
      {approveTargetReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Executive Board Sign-Off
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  Approve {approveTargetReport.reportId} (v{approveTargetReport.version})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApproveTargetReport(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmApprove} className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-bold text-[11px] block">Corporate Publication Authorization:</span>
                <p className="leading-relaxed text-[11px]">
                  Signing off will record executive board approval for MEIL's FY {approveTargetReport.financialYear} BRSR
                  disclosure. The generated PDF is locked as the final regulatory record.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Board Sign-off Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                  placeholder="e.g., Approved by Sustainability Committee for Annual Report inclusion..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApproveTargetReport(null)}
                  disabled={isActionPending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Executive Sign-Off</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
