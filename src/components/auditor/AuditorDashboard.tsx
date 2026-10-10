import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  Radio,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Info,
  Clock,
  Layers,
  FileText,
  UserCheck,
  X,
  Plus,
  Eye,
  Check,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Hash,
} from 'lucide-react';
import {
  useNexusData,
  type ESGReportingDossier,
  type ESGSubmissionRowItem,
  type AuditFinding,
  type FindingSeverity,
  type FindingStatus,
} from '../../context/NexusDataContext';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { apiClient, type BackendAuditorRecord } from '../../services/apiClient';
import { AuditFindingsTable } from './AuditFindingsTable';

export interface VerificationStreamEvent {
  id: string;
  timestamp: string;
  eventType: 'row_verified' | 'submission_created' | 'correction_requested' | 'row_resubmitted' | 'connected' | 'other';
  title: string;
  details: string;
  payload: any;
  project?: string;
  indicatorCode?: string;
}

export const AuditorDashboard: React.FC = () => {
  const { session } = useDemoAuth();
  const {
    dossiers,
    auditFindings,
    resolveAuditFinding,
    routeFindingToWorkflow,
    addAuditFinding,
    updateFindingSeverity,
  } = useNexusData();

  // Active view tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'reports' | 'discrepancies' | 'reverification' | 'events'
  >('overview');

  // Backend Verification Event Stream State
  const [eventStreamConnected, setEventStreamConnected] = useState<boolean>(true);
  const [streamEvents, setStreamEvents] = useState<VerificationStreamEvent[]>([]);
  const [backendVerifiedRecords, setBackendVerifiedRecords] = useState<BackendAuditorRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastStreamUpdate, setLastStreamUpdate] = useState<string>('Just now');
  const [latestToast, setLatestToast] = useState<string | null>(null);

  // Filters
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sample Inspection Modal State (Reports Awaiting Audit)
  const [inspectingDossier, setInspectingDossier] = useState<ESGReportingDossier | null>(null);

  // Quick Log Discrepancy Modal
  const [quickLogTarget, setQuickLogTarget] = useState<{
    dossier: ESGReportingDossier;
    row: ESGSubmissionRowItem;
  } | null>(null);
  const [quickLogSeverity, setQuickLogSeverity] = useState<FindingSeverity>('Major');
  const [quickLogType, setQuickLogType] = useState<string>('Emission Factor Deviation');
  const [quickLogDesc, setQuickLogDesc] = useState<string>('');
  const [quickLogCorrection, setQuickLogCorrection] = useState<string>('');

  // Re-verification Modal State
  const [reverifyFindingTarget, setReverifyFindingTarget] = useState<AuditFinding | null>(null);
  const [reverifyNotes, setReverifyNotes] = useState<string>('');

  // Submit Final Report to Management Modal State
  const [isFinalSubmitModalOpen, setIsFinalSubmitModalOpen] = useState<boolean>(false);
  const [finalSubmitDossierId, setFinalSubmitDossierId] = useState<string>('');
  const [finalSubmitNotes, setFinalSubmitNotes] = useState<string>(
    'Statutory sample testing & methodology verified under SEBI BRSR Core mandate. All 9 principles verified against primary evidence. Approved for Executive Board review.'
  );
  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);
  const [lastSubmittedReport, setLastSubmittedReport] = useState<any | null>(null);

  // 1. Fetch Backend-enforced Verified Records
  const fetchBackendRecords = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const records = await apiClient.getAuditorVerifiedRecords({
        projectId: selectedProject !== 'ALL' ? selectedProject : undefined,
        financialYear: selectedFinancialYear !== 'ALL' ? selectedFinancialYear : undefined,
      });
      setBackendVerifiedRecords(records);
      setLastStreamUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch backend verified records:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedProject, selectedFinancialYear]);

  // Initial load
  useEffect(() => {
    fetchBackendRecords();
  }, [fetchBackendRecords]);

  // 2. Subscribe to Backend Verification Event Stream directly (/api/events)
  useEffect(() => {
    setEventStreamConnected(true);

    // Initial connection event
    const initialEv: VerificationStreamEvent = {
      id: `evt_init_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      eventType: 'connected',
      title: 'Backend Event Stream Connected',
      details: 'Connected to /api/events SSE stream. Receiving live verification signals.',
      payload: { channel: 'esg_verification_events', mode: 'strict_statutory' },
    };
    setStreamEvents([initialEv]);

    const unsubscribe = apiClient.subscribeToEvents((event, data) => {
      setEventStreamConnected(true);
      setLastStreamUpdate(new Date().toLocaleTimeString());

      let eventTitle = 'Verification Event Received';
      let eventDetails = '';
      let evtType: VerificationStreamEvent['eventType'] = 'other';
      let proj = data?.projectName || data?.dossier?.projectName;
      let indCode = data?.rowId || data?.row?.id;

      if (event === 'row_verified') {
        evtType = 'row_verified';
        eventTitle = 'Indicator Verified & Published to Auditor';
        eventDetails = `Row ${data.rowId} in ${data.projectName || 'Dossier'} verified by Reviewer. Published to Auditor stream.`;
        setLatestToast(`⚡ Live Stream: Row ${data.rowId} verified and published to Auditor view!`);
      } else if (event === 'submission_created') {
        evtType = 'submission_created';
        eventTitle = 'New ESG Reporting Dossier Submitted';
        eventDetails = `${data.submittingUser || 'Contributor'} submitted ${data.totalRows || 0} indicators for ${data.projectName || 'Project'}.`;
        setLatestToast(`⚡ Live Stream: New submission received for ${data.projectName || 'Project'}.`);
      } else if (event === 'correction_requested') {
        evtType = 'correction_requested';
        eventTitle = 'Correction Dispatched to Contributor';
        eventDetails = `Correction requested for row ${data.rowId} (${data.category || 'Discrepancy'}).`;
      } else if (event === 'row_resubmitted') {
        evtType = 'row_resubmitted';
        eventTitle = 'Contributor Resubmitted Corrected Row';
        eventDetails = `Row ${data.rowId} resubmitted with revised value ${data.newValue}. Pending re-verification.`;
        setLatestToast(`⚡ Live Stream: Row ${data.rowId} resubmitted! Pending Auditor re-verification.`);
      }

      const streamEv: VerificationStreamEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        eventType: evtType,
        title: eventTitle,
        details: eventDetails,
        payload: data,
        project: proj,
        indicatorCode: indCode,
      };

      setStreamEvents((prev) => [streamEv, ...prev.slice(0, 49)]);

      // Auto-refresh backend records
      fetchBackendRecords();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchBackendRecords]);

  // Derived Project List
  const uniqueProjects = useMemo(() => {
    const set = new Set<string>();
    dossiers.forEach((d) => {
      if (d.projectName) set.add(d.projectName);
    });
    backendVerifiedRecords.forEach((r) => {
      if (r.projectName) set.add(r.projectName);
    });
    return Array.from(set).sort();
  }, [dossiers, backendVerifiedRecords]);

  // 1. Reports Awaiting Audit Calculation
  // Dossiers that have submitted or verified records ready for independent assurance audit
  const reportsAwaitingAudit = useMemo(() => {
    return dossiers.filter((d) => {
      const matchesProject = selectedProject === 'ALL' || d.projectName === selectedProject;
      const matchesFY = selectedFinancialYear === 'ALL' || d.financialYear === selectedFinancialYear;
      const matchesSearch =
        !searchQuery.trim() ||
        d.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.monthName.toLowerCase().includes(searchQuery.toLowerCase());

      // Ready for audit if it has verified rows or is under review / approved for auditor
      const hasVerified = d.verifiedRows > 0;
      const isAuditable =
        hasVerified ||
        d.status === 'Fully Reviewed' ||
        d.status === 'Approved for Auditor' ||
        d.status === 'Partially Reviewed';

      return matchesProject && matchesFY && matchesSearch && isAuditable;
    });
  }, [dossiers, selectedProject, selectedFinancialYear, searchQuery]);

  // 2. Active Discrepancies Calculation
  const activeDiscrepancies = useMemo(() => {
    return auditFindings.filter((f) => {
      const matchesProject = selectedProject === 'ALL' || f.projectName === selectedProject;
      const matchesFY = selectedFinancialYear === 'ALL' || f.financialYear === selectedFinancialYear;
      const matchesSeverity = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
      const matchesStatus =
        selectedStatus === 'ALL'
          ? f.status !== 'RESOLVED'
          : f.status === selectedStatus;
      const matchesSearch =
        !searchQuery.trim() ||
        f.indicatorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.indicatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.projectName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesProject && matchesFY && matchesSeverity && matchesStatus && matchesSearch;
    });
  }, [auditFindings, selectedProject, selectedFinancialYear, selectedSeverity, selectedStatus, searchQuery]);

  // Severity counts for active discrepancies
  const activeSeverityCounts = useMemo(() => {
    const openFindings = auditFindings.filter((f) => f.status !== 'RESOLVED');
    return {
      total: openFindings.length,
      critical: openFindings.filter((f) => f.severity === 'Critical').length,
      major: openFindings.filter((f) => f.severity === 'Major').length,
      minor: openFindings.filter((f) => f.severity === 'Minor').length,
      observation: openFindings.filter((f) => f.severity === 'Observation').length,
    };
  }, [auditFindings]);

  // 3. Pending Re-Verification Items Calculation
  // Items that were routed for correction, resubmitted by Contributor/Reviewer, and now require Auditor re-verification
  const pendingReverificationItems = useMemo(() => {
    // Dossier rows that are in RESUBMITTED status or linked to routed findings
    const items: {
      dossierId: string;
      projectName: string;
      siteName: string;
      financialYear: string;
      row: ESGSubmissionRowItem;
      linkedFinding?: AuditFinding;
    }[] = [];

    dossiers.forEach((d) => {
      const matchesProject = selectedProject === 'ALL' || d.projectName === selectedProject;
      const matchesFY = selectedFinancialYear === 'ALL' || d.financialYear === selectedFinancialYear;
      if (!matchesProject || !matchesFY) return;

      Object.values(d.rows).forEach((row) => {
        // If row review status is RESUBMITTED or CORRECTION_REQUIRED with revision > 1
        const isResubmitted = row.reviewStatus === 'RESUBMITTED';
        const linkedFinding = auditFindings.find(
          (f) =>
            f.dossierId === d.dossierId &&
            f.rowId === row.id &&
            (f.status === 'UNDER_RECTIFICATION' ||
              f.status === 'ROUTED_TO_CONTRIBUTOR' ||
              f.status === 'ROUTED_TO_REVIEWER' ||
              f.status === 'ROUTED_TO_BOTH')
        );

        if (isResubmitted || linkedFinding) {
          items.push({
            dossierId: d.dossierId,
            projectName: d.projectName,
            siteName: d.siteName,
            financialYear: d.financialYear,
            row,
            linkedFinding,
          });
        }
      });
    });

    return items;
  }, [dossiers, auditFindings, selectedProject, selectedFinancialYear]);

  // Total Verified Records (from backend stream + dossiers)
  const totalVerifiedCount = useMemo(() => {
    if (backendVerifiedRecords.length > 0) return backendVerifiedRecords.length;
    let sum = 0;
    dossiers.forEach((d) => {
      sum += d.verifiedRows || 0;
    });
    return sum;
  }, [backendVerifiedRecords, dossiers]);

  // Reset Filters handler
  const handleResetFilters = () => {
    setSelectedProject('ALL');
    setSelectedFinancialYear('ALL');
    setSelectedSeverity('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  // Quick Log Finding Submission
  const handleConfirmQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLogTarget || !quickLogDesc.trim()) return;

    const newId = addAuditFinding({
      dossierId: quickLogTarget.dossier.dossierId,
      rowId: quickLogTarget.row.id,
      indicatorCode: quickLogTarget.row.id,
      indicatorName: quickLogTarget.row.name,
      projectName: quickLogTarget.dossier.projectName,
      siteName: quickLogTarget.dossier.siteName,
      financialYear: quickLogTarget.dossier.financialYear,
      reportingMonth: quickLogTarget.dossier.monthName,
      reportedValue: quickLogTarget.row.currentValue,
      unit: quickLogTarget.row.unit,
      discrepancyType: quickLogType,
      description: quickLogDesc.trim(),
      severity: quickLogSeverity,
      suggestedCorrection: quickLogCorrection.trim() || undefined,
      evidenceRef: quickLogTarget.row.evidenceFiles?.[0]?.name || 'Sample Verification Document',
      auditorName: session?.user?.name || 'Sanjay Deshmukh (Lead BRSR Assurer)',
    });

    setQuickLogTarget(null);
    setQuickLogDesc('');
    setQuickLogCorrection('');
    setLatestToast(`✓ Discrepancy ${newId} logged for ${quickLogTarget.row.id}. Ready for workflow routing.`);
    setActiveTab('discrepancies');
  };

  // Re-verification clearance handler
  const handleApproveReverification = (finding: AuditFinding) => {
    const res = resolveAuditFinding(
      finding.id,
      reverifyNotes.trim() || 'Auditor sample re-tested successfully against corrected raw vouchers.'
    );
    if (res.success) {
      setReverifyFindingTarget(null);
      setReverifyNotes('');
      setLatestToast(`✓ Discrepancy ${finding.id} cleared and marked fully reconciled.`);
      fetchBackendRecords();
    }
  };

  // Submit Final Report to Management Handler
  const handleExecuteFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetDossierId = finalSubmitDossierId || dossiers[0]?.dossierId;
    if (!targetDossierId) return;

    try {
      setIsSubmittingFinal(true);
      const res = await apiClient.submitFinalReportByAuditor({
        dossierId: targetDossierId,
        auditNotes: finalSubmitNotes.trim(),
        financialYear: selectedFinancialYear !== 'ALL' ? selectedFinancialYear : undefined,
      });

      if (res.success && res.report) {
        setLastSubmittedReport(res.report);
        setLatestToast(`✓ Final BRSR Report "${res.report.reportId}" submitted to Management! PDF generated.`);
        fetchBackendRecords();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error submitting final report: ${err?.message || 'Server error'}`);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Real-time Toast Banner */}
      {latestToast && (
        <div className="p-4 rounded-xl border border-sky-400 bg-slate-900 text-white shadow-xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>{latestToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setLatestToast(null)}
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
              Statutory BRSR Assurer Portal
            </span>
            <span className="text-xs font-mono text-slate-300">
              Assurer: <strong className="text-white">{session?.user?.name || 'Sanjay Deshmukh (Lead BRSR Assurer)'}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Auditor Assurance &amp; Verification Command Center
          </h1>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Independent statutory verification portal for MEIL ESG disclosures. Connected directly to the
            live backend verification event stream (<code className="text-sky-300 font-mono">/api/events</code>).
            Track reports awaiting audit, investigate active discrepancies, and clear re-verification items.
          </p>
        </div>

        {/* Live Event Stream Connection Badge & Refresh */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15 flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-emerald-300 flex items-center gap-1">
                <span>LIVE SSE STREAM</span>
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                Updated: {lastStreamUpdate}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchBackendRecords}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 active:scale-95 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
            title="Refresh backend verification records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (dossiers.length > 0) {
                setFinalSubmitDossierId(dossiers[0].dossierId);
              }
              setLastSubmittedReport(null);
              setIsFinalSubmitModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white transition-all shadow-md cursor-pointer"
            title="Submit validated BRSR report to Management Portal and generate official PDF"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Final Report to Management</span>
          </button>
        </div>
      </div>

      {/* 
        ======================================================================
        SUMMARY CARDS (Reports Awaiting Audit, Active Discrepancies, Pending Re-Verification)
        ======================================================================
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Reports Awaiting Audit */}
        <div
          onClick={() => setActiveTab('reports')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeTab === 'reports'
              ? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-300/40'
              : 'bg-white border-slate-200 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Reports Awaiting Audit
            </span>
            <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {reportsAwaitingAudit.length}
            </span>
            <span className="text-xs font-semibold text-sky-700">dossiers</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Verified rows in scope:</span>
            <span className="font-bold text-slate-800">{totalVerifiedCount} rows</span>
          </div>
          <div className="mt-1 flex items-center text-[10px] text-sky-600 font-semibold gap-1">
            <span>Click to inspect sample records</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 2: Active Discrepancies */}
        <div
          onClick={() => setActiveTab('discrepancies')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeTab === 'discrepancies'
              ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-300/40'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Active Discrepancies
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 tracking-tight">
              {activeSeverityCounts.total}
            </span>
            <span className="text-xs font-semibold text-rose-700">flagged items</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-slate-600">Critical: <strong>{activeSeverityCounts.critical}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-600">Major: <strong>{activeSeverityCounts.major}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-slate-600">Minor: <strong>{activeSeverityCounts.minor}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-slate-600">Obs: <strong>{activeSeverityCounts.observation}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Re-Verification Items */}
        <div
          onClick={() => setActiveTab('reverification')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeTab === 'reverification'
              ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300/40'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Pending Re-Verification
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 tracking-tight">
              {pendingReverificationItems.length}
            </span>
            <span className="text-xs font-semibold text-amber-700">resubmitted</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Contributor revisions:</span>
            <span className="font-bold text-amber-800">Awaiting re-test</span>
          </div>
          <div className="mt-1 flex items-center text-[10px] text-amber-700 font-semibold gap-1">
            <span>Clear or re-flag corrected values</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Backend Event Stream Live Activity */}
        <div
          onClick={() => setActiveTab('events')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeTab === 'events'
              ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300/40'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Live Event Stream
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">
              {streamEvents.length}
            </span>
            <span className="text-xs font-semibold text-emerald-700">events tracked</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Stream Endpoint:</span>
            <span className="font-mono font-bold text-slate-800">/api/events</span>
          </div>
          <div className="mt-1 flex items-center text-[10px] text-emerald-700 font-semibold gap-1">
            <span>Inspect raw verification stream</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 
        ======================================================================
        MULTI-DIMENSIONAL FILTER TOOLBAR
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
              placeholder="Search by indicator, project, site, voucher number, or remarks..."
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
          {(selectedProject !== 'ALL' ||
            selectedFinancialYear !== 'ALL' ||
            selectedSeverity !== 'ALL' ||
            selectedStatus !== 'ALL' ||
            searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          {/* Project Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
              Infrastructure Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="ALL">All Projects ({uniqueProjects.length})</option>
              {uniqueProjects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Financial Year Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
              Reporting Cycle (FY)
            </label>
            <select
              value={selectedFinancialYear}
              onChange={(e) => setSelectedFinancialYear(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="ALL">All Financial Years</option>
              <option value="FY 2026-27">FY 2026-27 (Current Active)</option>
              <option value="FY 2025-26">FY 2025-26 (Audited / Baseline)</option>
            </select>
          </div>

          {/* Discrepancy Severity Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
              Severity Level
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical (BRSR Core)</option>
              <option value="Major">Major (&gt;10% Variance)</option>
              <option value="Minor">Minor (Documentation)</option>
              <option value="Observation">Observation (Advisory)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
              Workflow Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="ALL">All Active Statuses</option>
              <option value="OPEN">Open (New Anomaly)</option>
              <option value="ROUTED_TO_CONTRIBUTOR">Routed to Contributor</option>
              <option value="ROUTED_TO_REVIEWER">Routed to Reviewer</option>
              <option value="ROUTED_TO_BOTH">Routed to Both</option>
              <option value="UNDER_RECTIFICATION">Under Rectification</option>
              <option value="RESOLVED">Resolved / Cleared</option>
            </select>
          </div>
        </div>
      </div>

      {/* 
        ======================================================================
        VIEW TABS (Overview, Reports Awaiting Audit, Discrepancies, Re-verification, Event Stream)
        ======================================================================
      */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Assurance Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Reports Awaiting Audit</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800 font-extrabold">
            {reportsAwaitingAudit.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('discrepancies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'discrepancies'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Active Discrepancies Matrix</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 font-extrabold">
            {activeSeverityCounts.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reverification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reverification'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Pending Re-Verification Queue</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
            {pendingReverificationItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'events'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Backend Verification Stream</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* 
        ======================================================================
        TAB 1: ASSURANCE OVERVIEW
        ======================================================================
      */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Guidance / Assurance Framework Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-800 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Independent Statutory Assurance Protocol (SEBI BRSR Core Mandate)
                </h4>
                <p className="text-slate-600 leading-relaxed max-w-3xl">
                  As the designated BRSR Assurer, you are testing disclosures after multi-tier Reviewer verification.
                  Records displayed here are published directly from the backend verification stream (<code className="font-mono text-slate-800">/api/events</code>).
                  Any statistical variance, calibration gap, or missing evidence must be documented with an assigned severity
                  and routed directly to Contributor / Reviewer queues for formal rectification.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer shadow-xs"
              >
                Inspect Reports
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('discrepancies')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white transition-all cursor-pointer shadow-xs"
              >
                Log Discrepancy
              </button>
            </div>
          </div>

          {/* Quick Preview Grid of Reports Awaiting Audit */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Reports Awaiting Audit Sample Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Dossiers with verified records published from Reviewer approvals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({reportsAwaitingAudit.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportsAwaitingAudit.slice(0, 6).map((dossier) => (
                <div
                  key={dossier.dossierId}
                  className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/30 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400 font-bold">{dossier.projectCode || dossier.dossierId}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {dossier.verifiedRows}/{dossier.totalRows} Verified
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                      {dossier.projectName}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {dossier.siteName} • {dossier.monthName} ({dossier.financialYear})
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">By {dossier.submittingUser}</span>
                    <button
                      type="button"
                      onClick={() => setInspectingDossier(dossier)}
                      className="px-2.5 py-1 text-xs font-bold text-sky-700 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Sample</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Embedded Discrepancies Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Active Discrepancies &amp; Findings Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Severity assignments and workflow routing to Contributor / Reviewer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('discrepancies')}
                className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Screen Findings Table</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <AuditFindingsTable onNavigateToCorrections={() => setActiveTab('reverification')} />
          </div>
        </div>
      )}

      {/* 
        ======================================================================
        TAB 2: REPORTS AWAITING AUDIT (Detailed List & Sample Inspection)
        ======================================================================
      */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Reports Awaiting Independent Assurance Audit ({reportsAwaitingAudit.length})
              </h3>
              <p className="text-xs text-slate-500">
                Select any dossier to inspect verified raw indicator records, vouchers, and reviewer attestation timestamps.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              Backend Stream Status: <span className="text-emerald-600">Strict Verified Mode</span>
            </div>
          </div>

          {reportsAwaitingAudit.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Reports Matching Filter Criteria</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No ESG reporting dossiers currently match the selected project, period, or search parameters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-bold text-sky-700 bg-sky-50 rounded-xl hover:bg-sky-100 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Dossier / Project</th>
                      <th className="px-4 py-3">Site Location</th>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3">Verified / Total</th>
                      <th className="px-4 py-3">Statutory Status</th>
                      <th className="px-4 py-3">Submitted By</th>
                      <th className="px-4 py-3 text-right">Auditor Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportsAwaitingAudit.map((dossier) => (
                      <tr key={dossier.dossierId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{dossier.projectName}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {dossier.projectCode || dossier.dossierId}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{dossier.siteName}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800">{dossier.monthName}</span>
                          <span className="text-[10px] text-slate-400 block">{dossier.financialYear}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-emerald-700">
                              {dossier.verifiedRows}/{dossier.totalRows}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({Math.round(((dossier.verifiedRows || 0) / (dossier.totalRows || 1)) * 100)}%)
                            </span>
                          </div>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{
                                width: `${Math.round(
                                  ((dossier.verifiedRows || 0) / (dossier.totalRows || 1)) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {dossier.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          <div>{dossier.submittingUser}</div>
                          <div className="text-[10px] text-slate-400">{dossier.submittedAt}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setInspectingDossier(dossier)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Samples</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 
        ======================================================================
        TAB 3: ACTIVE DISCREPANCIES MATRIX
        ======================================================================
      */}
      {activeTab === 'discrepancies' && (
        <div className="space-y-4">
          <AuditFindingsTable onNavigateToCorrections={() => setActiveTab('reverification')} />
        </div>
      )}

      {/* 
        ======================================================================
        TAB 4: PENDING RE-VERIFICATION QUEUE
        ======================================================================
      */}
      {activeTab === 'reverification' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Pending Re-Verification Queue ({pendingReverificationItems.length})
              </h3>
              <p className="text-xs text-slate-500">
                Items revised and resubmitted by Contributor / Reviewer after discrepancy flag. Review corrected metrics and approve or re-route.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              Awaiting Auditor Sign-Off
            </div>
          </div>

          {pendingReverificationItems.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">All Discrepancies Reconciled</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are currently no resubmitted indicator items awaiting auditor re-verification.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Indicator Code &amp; Name</th>
                      <th className="px-4 py-3">Project / Site</th>
                      <th className="px-4 py-3">Previous Flagged Value</th>
                      <th className="px-4 py-3">Corrected / Resubmitted</th>
                      <th className="px-4 py-3">Correction Justification</th>
                      <th className="px-4 py-3 text-right">Re-Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingReverificationItems.map((item) => (
                      <tr key={`${item.dossierId}_${item.row.id}`} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-purple-700">{item.row.id}</span>
                            {item.row.isBrsrCore && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800">
                                CORE
                              </span>
                            )}
                          </div>
                          <div className="text-slate-600 line-clamp-1">{item.row.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{item.projectName}</div>
                          <div className="text-[10px] text-slate-400">{item.siteName} • {item.financialYear}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-slate-400 line-through">
                            {item.row.previousMonthValue || 'N/A'} {item.row.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.row.currentValue} {item.row.unit}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Rev: v{item.row.version || 2}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs text-slate-600">
                          <p className="line-clamp-2 italic">
                            {item.row.reviewerDecision?.correctionReason ||
                              item.linkedFinding?.suggestedCorrection ||
                              'Resubmitted with calibrated voucher.'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.linkedFinding ? (
                              <button
                                type="button"
                                onClick={() => setReverifyFindingTarget(item.linkedFinding || null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Re-Verify</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setLatestToast(`✓ Re-verified indicator ${item.row.id} successfully!`);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve Re-Test</span>
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
        </div>
      )}

      {/* 
        ======================================================================
        TAB 5: LIVE BACKEND VERIFICATION EVENT STREAM LOG
        ======================================================================
      */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-base font-extrabold text-white">
                  Live Backend Verification Stream Telemetry
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Listening to real-time events broadcast over SSE from <code className="text-sky-300 font-mono">/api/events</code>.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>EventSource: OPEN</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Recent Verification Events ({streamEvents.length})</span>
              <button
                type="button"
                onClick={() => setStreamEvents([])}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Clear Event Buffer
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto font-mono text-xs">
              {streamEvents.map((ev) => (
                <div key={ev.id} className="p-4 hover:bg-slate-50 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.eventType === 'row_verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ev.eventType === 'submission_created'
                            ? 'bg-sky-100 text-sky-800'
                            : ev.eventType === 'correction_requested'
                            ? 'bg-rose-100 text-rose-800'
                            : ev.eventType === 'row_resubmitted'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ev.eventType}
                      </span>
                      <span>{ev.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{ev.timestamp}</span>
                  </div>
                  <p className="text-slate-600 font-sans text-xs">{ev.details}</p>
                  {ev.payload && Object.keys(ev.payload).length > 0 && (
                    <details className="mt-1">
                      <summary className="text-[10px] text-sky-600 cursor-pointer font-sans">
                        Inspect Raw Payload JSON
                      </summary>
                      <pre className="mt-1 p-2 bg-slate-900 text-emerald-400 rounded-lg text-[10px] overflow-x-auto">
                        {JSON.stringify(ev.payload, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 
        ======================================================================
        MODAL 1: SAMPLE INSPECTION MODAL (Reports Awaiting Audit)
        ======================================================================
      */}
      {inspectingDossier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Sample Assurance Inspection
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {inspectingDossier.projectCode || inspectingDossier.dossierId}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {inspectingDossier.projectName} • {inspectingDossier.siteName}
                </h3>
                <p className="text-xs text-slate-300">
                  {inspectingDossier.monthName} ({inspectingDossier.financialYear}) — {inspectingDossier.verifiedRows}/{inspectingDossier.totalRows} Indicators Verified
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectingDossier(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Indicator Rows */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sky-800 text-[11px] flex items-center justify-between">
                <span>
                  Inspect sample indicator values below. If you observe any mathematical discrepancies or evidence variances, click <strong>Flag Discrepancy</strong> to route into workflow.
                </span>
                <span className="font-mono font-bold">BRSR Core Sample Test</span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {Object.values(inspectingDossier.rows).map((row) => (
                  <div key={row.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-700">{row.id}</span>
                        {row.isBrsrCore && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800">
                            CORE
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            row.reviewStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.reviewStatus === 'CORRECTION_REQUIRED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {row.reviewStatus}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs">{row.name}</h5>
                      <div className="text-[11px] text-slate-500">
                        Evidence Voucher: <span className="text-slate-800 font-mono">{row.evidenceFiles?.[0]?.name || 'Uploaded Invoice / Calibration Sheet'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900 font-mono">
                          {row.currentValue} {row.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Prev: {row.previousMonthValue || '0'} {row.unit}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickLogTarget({ dossier: inspectingDossier, row });
                          setQuickLogDesc(`Auditor sample testing observed numerical/evidence variance on indicator ${row.id}.`);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Flag Discrepancy</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Auditor: Sanjay Deshmukh (Lead BRSR Assurer)
              </span>
              <button
                type="button"
                onClick={() => setInspectingDossier(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Close Sample View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ======================================================================
        MODAL 2: QUICK LOG DISCREPANCY MODAL
        ======================================================================
      */}
      {quickLogTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Log Discrepancy from Sample Inspection
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {quickLogTarget.row.id} — {quickLogTarget.row.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickLogTarget(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmQuickLog} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Severity Level *
                </label>
                <select
                  value={quickLogSeverity}
                  onChange={(e) => setQuickLogSeverity(e.target.value as FindingSeverity)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Critical">Critical (Statutory SEBI BRSR Core Violation)</option>
                  <option value="Major">Major (Significant numerical variance &gt;10%)</option>
                  <option value="Minor">Minor (Sampling rounding or minor evidence gap)</option>
                  <option value="Observation">Observation (Procedural Advisory Note)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Discrepancy Category *
                </label>
                <select
                  value={quickLogType}
                  onChange={(e) => setQuickLogType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Emission Factor Deviation">Emission Factor Deviation</option>
                  <option value="Sampling Test Discrepancy">Sampling Test Discrepancy</option>
                  <option value="Supporting Evidence Inadequacy">Supporting Evidence Inadequacy</option>
                  <option value="CGWA NOC Volume Exceeded">CGWA NOC Volume Exceeded</option>
                  <option value="Mathematical Calculation Discrepancy">Mathematical Calculation Discrepancy</option>
                  <option value="Statutory SEBI BRSR Core Inconsistency">Statutory SEBI BRSR Core Inconsistency</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Auditor Discrepancy Description *
                </label>
                <textarea
                  rows={3}
                  value={quickLogDesc}
                  onChange={(e) => setQuickLogDesc(e.target.value)}
                  required
                  placeholder="Detail the exact finding observed during sample verification..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Suggested Rectification (Optional)
                </label>
                <input
                  type="text"
                  value={quickLogCorrection}
                  onChange={(e) => setQuickLogCorrection(e.target.value)}
                  placeholder="e.g., Re-calculate using CEA Grid Emission Factor v20..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickLogTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white transition-all cursor-pointer shadow-md"
                >
                  Log Finding &amp; Open Routing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ======================================================================
        MODAL 3: RE-VERIFICATION CLEARANCE MODAL
        ======================================================================
      */}
      {reverifyFindingTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Approve Re-Verification Clearance
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {reverifyFindingTarget.id} — {reverifyFindingTarget.indicatorCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReverifyFindingTarget(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400">Flagged Issue</div>
                <p className="text-slate-800 font-medium">{reverifyFindingTarget.description}</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Auditor Clearance Notes
                </label>
                <textarea
                  rows={3}
                  value={reverifyNotes}
                  onChange={(e) => setReverifyNotes(e.target.value)}
                  placeholder="Record auditor re-testing confirmation notes (e.g., Re-verified against certified contractor slips)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReverifyFindingTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveReverification(reverifyFindingTarget)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Clear Discrepancy &amp; Assure Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ======================================================================
        MODAL 4: SUBMIT FINAL REPORT TO MANAGEMENT & GENERATE PDF
        ======================================================================
      */}
      {isFinalSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1.5 w-fit">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Statutory Assurance Final Transmission</span>
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  Submit Final BRSR Report to Management
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFinalSubmitModalOpen(false);
                  setLastSubmittedReport(null);
                }}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {lastSubmittedReport ? (
              <div className="p-6 space-y-5 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Report Successfully Transmitted to Management!</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Final report <strong>{lastSubmittedReport.reportId} (v{lastSubmittedReport.version})</strong> has been
                    generated and published. The formal BRSR PDF snapshot was automatically generated and is now live in
                    the Executive Management Portal.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Report Filename:</span>
                    <span className="font-mono font-bold text-slate-800">{lastSubmittedReport.pdfFileName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Status in Management Portal:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">PDF Ready &amp; Awaiting Review</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Statutory Scope:</span>
                    <span className="font-semibold text-slate-800">{lastSubmittedReport.projectName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <a
                    href={apiClient.getPdfDownloadUrl(lastSubmittedReport.reportId, true)}
                    download={lastSubmittedReport.pdfFileName}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Generated PDF</span>
                  </a>

                  <a
                    href="/management/reports"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm"
                  >
                    <span>View in Management Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteFinalSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Select Audited Dossier / Project Scope *
                  </label>
                  <select
                    value={finalSubmitDossierId || dossiers[0]?.dossierId || ''}
                    onChange={(e) => setFinalSubmitDossierId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {dossiers.map((d) => (
                      <option key={d.dossierId} value={d.dossierId}>
                        {d.projectName} ({d.monthName} {d.financialYear}) — {d.verifiedRows}/{d.totalRows} Verified Rows
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl text-purple-900 space-y-1">
                  <span className="font-bold text-[11px] block">Statutory Assurance Attestation:</span>
                  <p className="text-[11px] leading-relaxed">
                    Submitting this final report will lock the snapshot of all verified disclosures, generate the formal
                    corporate BRSR PDF with Page 1 General Disclosures and all 9 Principles, and instantly deliver it to
                    the Executive Management Portal for board sign-off.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Auditor Assurance Notes &amp; Opinion *
                  </label>
                  <textarea
                    rows={3}
                    value={finalSubmitNotes}
                    onChange={(e) => setFinalSubmitNotes(e.target.value)}
                    required
                    placeholder="Enter statutory auditor assurance statement and testing opinion..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFinalSubmitModalOpen(false)}
                    disabled={isSubmittingFinal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFinal}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingFinal ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating PDF &amp; Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Validate &amp; Submit to Management</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditorDashboard;
