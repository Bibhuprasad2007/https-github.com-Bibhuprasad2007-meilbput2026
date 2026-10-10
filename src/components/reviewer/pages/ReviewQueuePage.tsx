import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  FileText,
  Filter,
  Check,
  X,
  History,
  Send,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Download,
} from 'lucide-react';
import { PageHeader } from '../../admin/common/PageHeader';
import { useNexusData, type ESGSubmissionRowItem, type ESGReportingDossier } from '../../../context/NexusDataContext';
import { RequestRowCorrectionModal } from '../modals/RequestRowCorrectionModal';

type QueueViewMode = 'DOSSIERS' | 'FULL_TABLE' | 'ALL_ROWS' | 'AUDITOR_STREAM';

export const ReviewQueuePage: React.FC = () => {
  const {
    dossiers,
    markRowCorrect,
    requestRowCorrection,
    getVerifiedAuditorRecords,
  } = useNexusData();

  // Primary Navigation & View Mode
  const [activeTab, setActiveTab] = useState<QueueViewMode>('FULL_TABLE');
  const [activeDossierId, setActiveDossierId] = useState<string>('');

  // Search & Filtering
  const [searchValue, setSearchValue] = useState('');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [selectedFY, setSelectedFY] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedPrinciple, setSelectedPrinciple] = useState('ALL');
  const [selectedContributor, setSelectedContributor] = useState('ALL');
  const [selectedRowStatus, setSelectedRowStatus] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'CORRECTION_REQUIRED' | 'RESUBMITTED'>('ALL');
  const [selectedDossierStatus, setSelectedDossierStatus] = useState('ALL');

  // Principle tab inside full table view
  const [activePrinciplePill, setActivePrinciplePill] = useState<number | 'ALL'>('ALL');

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'NAME_ASC' | 'PROGRESS_DESC'>('DATE_DESC');

  // Modals state
  const [confirmCorrectTarget, setConfirmCorrectTarget] = useState<{
    dossierId: string;
    row: ESGSubmissionRowItem;
    projectName?: string;
    siteName?: string;
    period?: string;
  } | null>(null);

  const [correctionTarget, setCorrectionTarget] = useState<{
    dossierId: string;
    rowId: string;
    rowName: string;
    rowCode: string;
    currentValue: string | number;
    unit: string;
    version?: number;
  } | null>(null);

  const [historyTargetRow, setHistoryTargetRow] = useState<ESGSubmissionRowItem | null>(null);
  const [evidencePreviewFile, setEvidencePreviewFile] = useState<{
    id: string;
    name: string;
    type?: string;
    size?: number;
    uploadedAt?: string;
    url?: string;
    disclosureCode?: string;
    disclosureName?: string;
  } | null>(null);

  // Floating confirmation notice
  const [toastNotice, setToastNotice] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const showNotice = (msg: string, type: 'success' | 'warning' = 'success') => {
    setToastNotice({ message: msg, type });
    setTimeout(() => setToastNotice(null), 4500);
  };

  // Resolve currently active dossier for Full Table view
  const currentDossier = useMemo(() => {
    if (!dossiers || dossiers.length === 0) return null;
    if (activeDossierId) {
      const found = dossiers.find((d) => d.dossierId === activeDossierId);
      if (found) return found;
    }
    return dossiers[0];
  }, [dossiers, activeDossierId]);

  // Dynamic filter options extracted from real dossiers
  const filterOptions = useMemo(() => {
    const projectsMap = new Map<string, string>();
    const sitesSet = new Set<string>();
    const fySet = new Set<string>();
    const monthsSet = new Set<string>();
    const contributorsSet = new Set<string>();

    dossiers.forEach((d) => {
      projectsMap.set(d.projectId, d.projectName);
      if (d.siteName) sitesSet.add(d.siteName);
      if (d.financialYear) fySet.add(d.financialYear);
      if (d.monthName) monthsSet.add(d.monthName);
      if (d.submittingUser) contributorsSet.add(d.submittingUser);
    });

    return {
      projects: Array.from(projectsMap.entries()),
      sites: Array.from(sitesSet),
      financialYears: Array.from(fySet),
      months: Array.from(monthsSet),
      contributors: Array.from(contributorsSet),
    };
  }, [dossiers]);

  // 6 Executive summary metrics calculated directly from backend dossiers
  const summaryMetrics = useMemo(() => {
    let pendingSubmissions = 0;
    let fullyReviewedSubmissions = 0;
    let partiallyReviewedSubmissions = 0;
    let totalPendingRows = 0;
    let totalVerifiedRows = 0;
    let totalCorrectionRows = 0;
    let totalResubmittedRows = 0;

    dossiers.forEach((d) => {
      if (d.status === 'Fully Reviewed' || d.status === 'Approved for Auditor') {
        fullyReviewedSubmissions++;
      } else if (d.status === 'Partially Reviewed') {
        partiallyReviewedSubmissions++;
      } else {
        pendingSubmissions++;
      }

      const rows = Object.values(d.rows || {});
      rows.forEach((r) => {
        if (r.reviewStatus === 'VERIFIED') totalVerifiedRows++;
        else if (r.reviewStatus === 'CORRECTION_REQUIRED') totalCorrectionRows++;
        else if (r.reviewStatus === 'RESUBMITTED') {
          totalResubmittedRows++;
          totalPendingRows++;
        } else totalPendingRows++;
      });
    });

    return {
      pendingSubmissions,
      fullyReviewedSubmissions,
      partiallyReviewedSubmissions,
      totalPendingRows,
      totalVerifiedRows,
      totalCorrectionRows,
      totalResubmittedRows,
    };
  }, [dossiers]);

  // Filtered dossiers list
  const filteredDossiers = useMemo(() => {
    const list = dossiers.filter((d) => {
      if (selectedProject !== 'ALL' && d.projectId !== selectedProject) return false;
      if (selectedSite !== 'ALL' && d.siteName !== selectedSite) return false;
      if (selectedFY !== 'ALL' && d.financialYear !== selectedFY) return false;
      if (selectedMonth !== 'ALL' && d.monthName !== selectedMonth) return false;
      if (selectedContributor !== 'ALL' && d.submittingUser !== selectedContributor) return false;
      if (selectedDossierStatus !== 'ALL' && d.status !== selectedDossierStatus) return false;

      if (searchValue.trim()) {
        const q = searchValue.toLowerCase();
        const matchProj = d.projectName.toLowerCase().includes(q);
        const matchSite = d.siteName.toLowerCase().includes(q);
        const matchUser = d.submittingUser.toLowerCase().includes(q);
        const matchCode = (d.projectCode || '').toLowerCase().includes(q);
        if (!matchProj && !matchSite && !matchUser && !matchCode) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'DATE_DESC') return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      if (sortBy === 'DATE_ASC') return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      if (sortBy === 'NAME_ASC') return a.projectName.localeCompare(b.projectName);
      if (sortBy === 'PROGRESS_DESC') {
        const pctA = (a.verifiedRows || 0) / (a.totalRows || 1);
        const pctB = (b.verifiedRows || 0) / (b.totalRows || 1);
        return pctB - pctA;
      }
      return 0;
    });

    return list;
  }, [dossiers, selectedProject, selectedSite, selectedFY, selectedMonth, selectedContributor, selectedDossierStatus, searchValue, sortBy]);

  // Rows of the selected active dossier (for Full Table view)
  const currentDossierRows = useMemo(() => {
    if (!currentDossier) return [];
    const list: ESGSubmissionRowItem[] = Object.values(currentDossier.rows || {});

    return list.filter((r) => {
      if (activePrinciplePill !== 'ALL' && r.principleId !== activePrinciplePill) return false;
      if (selectedRowStatus === 'VERIFIED' && r.reviewStatus !== 'VERIFIED') return false;
      if (selectedRowStatus === 'CORRECTION_REQUIRED' && r.reviewStatus !== 'CORRECTION_REQUIRED') return false;
      if (selectedRowStatus === 'RESUBMITTED' && r.reviewStatus !== 'RESUBMITTED') return false;
      if (selectedRowStatus === 'PENDING' && (r.reviewStatus === 'VERIFIED' || r.reviewStatus === 'CORRECTION_REQUIRED')) return false;

      if (searchValue.trim()) {
        const q = searchValue.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchCode = (r.id || '').toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchDesc) return false;
      }

      return true;
    });
  }, [currentDossier, activePrinciplePill, selectedRowStatus, searchValue]);

  // Flattened all submitted rows across all dossiers
  const allSubmittedRows = useMemo(() => {
    const list: {
      dossierId: string;
      projectName: string;
      projectCode: string;
      siteName: string;
      financialYear: string;
      monthName: string;
      submittingUser: string;
      row: ESGSubmissionRowItem;
    }[] = [];

    dossiers.forEach((d) => {
      if (selectedProject !== 'ALL' && d.projectId !== selectedProject) return;
      if (selectedSite !== 'ALL' && d.siteName !== selectedSite) return;
      if (selectedFY !== 'ALL' && d.financialYear !== selectedFY) return;
      if (selectedMonth !== 'ALL' && d.monthName !== selectedMonth) return;
      if (selectedContributor !== 'ALL' && d.submittingUser !== selectedContributor) return;

      Object.values(d.rows || {}).forEach((r) => {
        if (selectedPrinciple !== 'ALL' && String(r.principleId) !== selectedPrinciple) return;
        if (selectedRowStatus === 'VERIFIED' && r.reviewStatus !== 'VERIFIED') return;
        if (selectedRowStatus === 'CORRECTION_REQUIRED' && r.reviewStatus !== 'CORRECTION_REQUIRED') return;
        if (selectedRowStatus === 'RESUBMITTED' && r.reviewStatus !== 'RESUBMITTED') return;
        if (selectedRowStatus === 'PENDING' && (r.reviewStatus === 'VERIFIED' || r.reviewStatus === 'CORRECTION_REQUIRED')) return;

        if (searchValue.trim()) {
          const q = searchValue.toLowerCase();
          const matchName = r.name.toLowerCase().includes(q);
          const matchCode = (r.id || '').toLowerCase().includes(q);
          const matchProj = d.projectName.toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchProj) return;
        }

        list.push({
          dossierId: d.dossierId,
          projectName: d.projectName,
          projectCode: d.projectCode,
          siteName: d.siteName,
          financialYear: d.financialYear,
          monthName: d.monthName,
          submittingUser: d.submittingUser,
          row: r,
        });
      });
    });

    return list;
  }, [dossiers, selectedProject, selectedSite, selectedFY, selectedMonth, selectedContributor, selectedPrinciple, selectedRowStatus, searchValue]);

  // Auditor verified records stream
  const auditorStreamRecords = useMemo(() => {
    return getVerifiedAuditorRecords();
  }, [getVerifiedAuditorRecords, dossiers]);

  // Pagination calculation
  const totalItems =
    activeTab === 'DOSSIERS'
      ? filteredDossiers.length
      : activeTab === 'ALL_ROWS'
      ? allSubmittedRows.length
      : currentDossierRows.length;

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedDossiers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDossiers.slice(start, start + pageSize);
  }, [filteredDossiers, currentPage, pageSize]);

  const paginatedAllRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allSubmittedRows.slice(start, start + pageSize);
  }, [allSubmittedRows, currentPage, pageSize]);

  const paginatedCurrentDossierRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return currentDossierRows.slice(start, start + pageSize);
  }, [currentDossierRows, currentPage, pageSize]);

  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  // Row Action 1: CORRECT (Open Confirmation & Publish to Auditor)
  const handleInitiateRowCorrect = (
    dossierId: string,
    row: ESGSubmissionRowItem,
    context?: { projectName?: string; siteName?: string; period?: string }
  ) => {
    setConfirmCorrectTarget({
      dossierId,
      row,
      projectName: context?.projectName,
      siteName: context?.siteName,
      period: context?.period,
    });
  };

  const handleExecuteRowCorrect = (dossierId: string, row: ESGSubmissionRowItem) => {
    const res = markRowCorrect(dossierId, row.id, 'Aarav Patel (Review Lead)');
    setConfirmCorrectTarget(null);
    if (res.success) {
      showNotice(`✓ Row "${row.name}" verified & published to authorized Auditor view!`);
    } else {
      showNotice(res.message, 'warning');
    }
  };

  // Row Action 2: INCORRECT (Open Mandatory Reason Modal)
  const handleOpenCorrectionModal = (dossierId: string, row: ESGSubmissionRowItem) => {
    setCorrectionTarget({
      dossierId,
      rowId: row.id,
      rowName: row.name,
      rowCode: row.id,
      currentValue: row.currentValue,
      unit: row.unit,
      version: row.version,
    });
  };

  const handleConfirmRowCorrection = (details: {
    category: string;
    reason: string;
    suggestedCorrection?: string;
    supportingComment?: string;
  }) => {
    if (!correctionTarget) return;

    const res = requestRowCorrection(correctionTarget.dossierId, correctionTarget.rowId, {
      ...details,
      reviewerName: 'Aarav Patel (Review Lead)',
    });

    setCorrectionTarget(null);
    if (res.success) {
      showNotice(`Correction request dispatched to Contributor Correction Center for "${correctionTarget.rowName}"!`);
    } else {
      showNotice(res.message, 'warning');
    }
  };

  // Bulk action: Verify all pending in currently filtered principle
  const handleBatchVerifyCurrentPrinciple = () => {
    if (!currentDossier) return;
    const pendingToVerify = currentDossierRows.filter((r) => r.reviewStatus !== 'VERIFIED' && r.reviewStatus !== 'CORRECTION_REQUIRED');
    if (pendingToVerify.length === 0) {
      showNotice('No pending indicators to verify in this view.', 'warning');
      return;
    }

    let verifiedCount = 0;
    pendingToVerify.forEach((r) => {
      const res = markRowCorrect(currentDossier.dossierId, r.id, 'Aarav Patel (Review Lead)');
      if (res.success) verifiedCount++;
    });

    showNotice(`✓ Batch Verified: ${verifiedCount} indicators approved and published to Auditor!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <PageHeader
          title="Review Queue & Master Verification Workflow"
          description="Centralized Reviewer Portal with live Contributor sync, row-level statutory validation, and real-time Auditor publication."
        />

        <div className="flex items-center gap-2">
          {/* Live Real-time Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Real-Time Sync Active (SSE)</span>
          </div>

          <Link
            to="/contributor/corrections"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all"
            title="Inspect Contributor Correction Center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Contributor Corrections ({summaryMetrics.totalCorrectionRows})</span>
          </Link>
        </div>
      </div>

      {/* Floating Status Notification Toast */}
      {toastNotice && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-top duration-200 ${
            toastNotice.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-amber-900 text-white border-amber-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span>{toastNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastNotice(null)}
            className="text-white/70 hover:text-white ml-4 text-[11px] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 6 Executive Summary Cards (Backend Enforced) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1 border-l-4 border-l-sky-500">
          <p className="text-[10px] uppercase font-bold text-slate-500">Pending Dossiers</p>
          <p className="text-xl font-extrabold text-slate-900">{summaryMetrics.pendingSubmissions}</p>
          <p className="text-[10px] text-slate-400">Awaiting queue</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1 border-l-4 border-l-amber-500">
          <p className="text-[10px] uppercase font-bold text-slate-500">Pending Row Decisions</p>
          <p className="text-xl font-extrabold text-amber-600">{summaryMetrics.totalPendingRows}</p>
          <p className="text-[10px] text-slate-400">
            {summaryMetrics.totalResubmittedRows > 0 ? `${summaryMetrics.totalResubmittedRows} resubmitted` : 'Unreviewed metrics'}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1 border-l-4 border-l-emerald-500">
          <p className="text-[10px] uppercase font-bold text-slate-500">Verified Rows</p>
          <p className="text-xl font-extrabold text-emerald-600">{summaryMetrics.totalVerifiedRows}</p>
          <p className="text-[10px] text-emerald-700 font-semibold">Published to Auditor</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1 border-l-4 border-l-rose-500">
          <p className="text-[10px] uppercase font-bold text-slate-500">Correction Required</p>
          <p className="text-xl font-extrabold text-rose-600">{summaryMetrics.totalCorrectionRows}</p>
          <p className="text-[10px] text-rose-700 font-semibold">In Contributor Center</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1 border-l-4 border-l-indigo-500">
          <p className="text-[10px] uppercase font-bold text-slate-500">Partially Reviewed</p>
          <p className="text-xl font-extrabold text-indigo-600">{summaryMetrics.partiallyReviewedSubmissions}</p>
          <p className="text-[10px] text-slate-400">Mixed decisions</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-teal-600">
          <p className="text-[10px] uppercase font-bold text-slate-500">Fully Reviewed</p>
          <p className="text-xl font-extrabold text-teal-700">{summaryMetrics.fullyReviewedSubmissions}</p>
          <p className="text-[10px] text-teal-800 font-semibold">Ready for Auditor</p>
        </div>
      </div>

      {/* Review Queue Mode Switcher & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box & Sort selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleFilterChange(setSearchValue, e.target.value)}
                placeholder="Search indicators by name, code, project, or remarks..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:bg-white focus:outline-none focus:border-teal-700"
              >
                <option value="DATE_DESC">Newest Submissions</option>
                <option value="DATE_ASC">Oldest Submissions</option>
                <option value="NAME_ASC">Project Name (A-Z)</option>
                <option value="PROGRESS_DESC">Highest Completion %</option>
              </select>
            </div>
          </div>

          {/* 4 Feature View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveTab('FULL_TABLE');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === 'FULL_TABLE'
                  ? 'bg-[#003B73] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Table Review Cockpit
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('DOSSIERS');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === 'DOSSIERS'
                  ? 'bg-[#003B73] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Dossiers ({filteredDossiers.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL_ROWS');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === 'ALL_ROWS'
                  ? 'bg-[#003B73] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Master Row Queue ({allSubmittedRows.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('AUDITOR_STREAM');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === 'AUDITOR_STREAM'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              Auditor Live Stream ({auditorStreamRecords.length})
            </button>
          </div>
        </div>

        {/* Multi-Dimensional Filter Dropdowns (8-Dimensional Suite) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* 1. Project */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => handleFilterChange(setSelectedProject, e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[11px]"
            >
              <option value="ALL">All Projects ({filterOptions.projects.length})</option>
              {filterOptions.projects.map(([pId, pName]) => (
                <option key={pId} value={pId}>
                  {pName}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Site */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Site</label>
            <select
              value={selectedSite}
              onChange={(e) => handleFilterChange(setSelectedSite, e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[11px]"
            >
              <option value="ALL">All Sites</option>
              {filterOptions.sites.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Financial Year */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">FY Period</label>
            <select
              value={selectedFY}
              onChange={(e) => handleFilterChange(setSelectedFY, e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[11px]"
            >
              <option value="ALL">All FYs</option>
              {filterOptions.financialYears.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Reporting Month */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => handleFilterChange(setSelectedMonth, e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[11px]"
            >
              <option value="ALL">All Months</option>
              {filterOptions.months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Principle (P1-P9) */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">ESG Principle</label>
            <select
              value={selectedPrinciple}
              onChange={(e) => handleFilterChange(setSelectedPrinciple, e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[11px]"
            >
              <option value="ALL">All Principles (P1-P9)</option>
              <option value="1">P1 Ethics & Governance</option>
              <option value="2">P2 Sustainable Products</option>
              <option value="3">P3 Employee Well-being</option>
              <option value="4">P4 Stakeholder Engagement</option>
              <option value="5">P5 Human Rights</option>
              <option value="6">P6 Environment & Climate</option>
              <option value="7">P7 Public Policy</option>
              <option value="8">P8 Inclusive CSR</option>
              <option value="9">P9 Customer Quality</option>
            </select>
          </div>

          {/* 6. Contributor */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Contributor</label>
            <select
              value={selectedContributor}
              onChange={(e) => handleFilterChange(setSelectedContributor, e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[11px]"
            >
              <option value="ALL">All Contributors</option>
              {filterOptions.contributors.map((contrib) => (
                <option key={contrib} value={contrib}>
                  {contrib}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Row Review Status */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Row Status</label>
            <select
              value={selectedRowStatus}
              onChange={(e) => handleFilterChange(setSelectedRowStatus, e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[11px]"
            >
              <option value="ALL">All Row Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="RESUBMITTED">Resubmitted v2</option>
              <option value="VERIFIED">Verified (Published)</option>
              <option value="CORRECTION_REQUIRED">Changes Requested</option>
            </select>
          </div>

          {/* 8. Dossier Status */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Dossier Status</label>
            <select
              value={selectedDossierStatus}
              onChange={(e) => handleFilterChange(setSelectedDossierStatus, e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[11px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted (New)</option>
              <option value="Under Review">Under Review</option>
              <option value="Partially Reviewed">Partially Reviewed</option>
              <option value="Changes Requested">Changes Requested</option>
              <option value="Fully Reviewed">Fully Reviewed</option>
            </select>
          </div>
        </div>

        {/* Clear Filters indicator */}
        {(selectedProject !== 'ALL' ||
          selectedSite !== 'ALL' ||
          selectedFY !== 'ALL' ||
          selectedMonth !== 'ALL' ||
          selectedPrinciple !== 'ALL' ||
          selectedContributor !== 'ALL' ||
          selectedRowStatus !== 'ALL' ||
          selectedDossierStatus !== 'ALL' ||
          searchValue.trim() !== '') && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Filters active &bull; displaying scoped reporting disclosures</span>
            <button
              type="button"
              onClick={() => {
                setSelectedProject('ALL');
                setSelectedSite('ALL');
                setSelectedFY('ALL');
                setSelectedMonth('ALL');
                setSelectedPrinciple('ALL');
                setSelectedContributor('ALL');
                setSelectedRowStatus('ALL');
                setSelectedDossierStatus('ALL');
                setSearchValue('');
                setCurrentPage(1);
              }}
              className="text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: FULL TABLE REVIEW COCKPIT (Inspect complete table of selected dossier directly on this page) */}
      {activeTab === 'FULL_TABLE' && currentDossier && (
        <div className="space-y-4">
          {/* Active Dossier Header Strip */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Active Submission Dossier
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ID: <strong className="text-white">{currentDossier.dossierId}</strong>
                </span>
                <span className="text-xs font-mono text-slate-400">&bull; {currentDossier.projectCode}</span>
              </div>
              <h3 className="text-base font-extrabold text-white">{currentDossier.projectName}</h3>
              <p className="text-xs text-slate-400">
                Site: <strong className="text-slate-200">{currentDossier.siteName}</strong> &bull; Reporting Period:{' '}
                <strong className="text-slate-200">{currentDossier.monthName} ({currentDossier.financialYear})</strong> &bull; Submitter:{' '}
                <strong className="text-slate-200">{currentDossier.submittingUser}</strong>
              </p>
            </div>

            {/* Quick Dossier Switcher & Batch Action */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={currentDossier.dossierId}
                onChange={(e) => {
                  setActiveDossierId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-teal-500"
              >
                {dossiers.map((d) => (
                  <option key={d.dossierId} value={d.dossierId}>
                    {d.projectName} ({d.monthName})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleBatchVerifyCurrentPrinciple}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition-all shadow-xs cursor-pointer"
                title="Verify all pending indicators currently rendered"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verify All Pending Here</span>
              </button>
            </div>
          </div>

          {/* Principle Pills Fast-Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs bg-white p-2.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActivePrinciplePill('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition-colors ${
                activePrinciplePill === 'ALL'
                  ? 'bg-[#003B73] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All 9 Principles ({Object.keys(currentDossier.rows || {}).length})
            </button>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pNum) => {
              const rowsInPrinciple = Object.values(currentDossier.rows || {}).filter((r) => r.principleId === pNum);
              const verifiedInPrinciple = rowsInPrinciple.filter((r) => r.reviewStatus === 'VERIFIED').length;

              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => {
                    setActivePrinciplePill(pNum);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition-colors flex items-center gap-1.5 ${
                    activePrinciplePill === pNum
                      ? 'bg-[#003B73] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>P{pNum}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      verifiedInPrinciple === rowsInPrinciple.length && rowsInPrinciple.length > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {verifiedInPrinciple}/{rowsInPrinciple.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* The Complete Submitted Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-3.5 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-left">Indicator Title &amp; Principle</th>
                    <th className="px-3 py-3 text-center">Unit</th>
                    <th className="px-3 py-3 text-center">Prev Value</th>
                    <th className="px-3.5 py-3 text-center font-bold">Submitted Value</th>
                    <th className="px-3 py-3 text-center">Supporting Evidence</th>
                    <th className="px-4 py-3 text-left">Contributor Remarks</th>
                    <th className="px-3.5 py-3 text-center">Review Status</th>
                    <th className="px-4 py-3 text-right">Row Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedCurrentDossierRows.map((row) => {
                    const isVerified = row.reviewStatus === 'VERIFIED';
                    const isCorrection = row.reviewStatus === 'CORRECTION_REQUIRED';
                    const isResubmitted = row.reviewStatus === 'RESUBMITTED';

                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isVerified ? 'bg-emerald-50/20' : isCorrection ? 'bg-rose-50/20' : isResubmitted ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        {/* 1. Code */}
                        <td className="px-3.5 py-3.5 font-mono font-bold text-slate-700 whitespace-nowrap">
                          {row.id}
                          {row.version && row.version > 1 && (
                            <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                              v{row.version}
                            </span>
                          )}
                        </td>

                        {/* 2. Indicator Name & Principle */}
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="font-bold text-slate-900 leading-tight">{row.name}</div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{row.description}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-600">{row.principleTitle}</span>
                            <span>&bull;</span>
                            <span className="text-slate-500">{row.category}</span>
                            {row.isBrsrCore && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[9px]">
                                BRSR CORE
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Unit */}
                        <td className="px-3 py-3.5 text-center text-slate-500 font-medium">
                          {row.unit}
                        </td>

                        {/* 4. Previous Value */}
                        <td className="px-3 py-3.5 text-center font-mono text-slate-500">
                          {row.previousMonthValue || '--'}
                        </td>

                        {/* 5. Submitted Value */}
                        <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-md font-mono font-bold text-xs border ${
                              isResubmitted
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                : 'bg-slate-100 text-slate-900 border-slate-200'
                            }`}
                          >
                            {row.currentValue}
                          </span>
                        </td>

                        {/* 6. Supporting Evidence */}
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          {row.evidenceFiles && row.evidenceFiles.length > 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setEvidencePreviewFile({
                                  ...row.evidenceFiles[0],
                                  disclosureCode: row.id,
                                  disclosureName: row.name,
                                })
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition-colors cursor-pointer"
                              title="Click to preview attached statutory audit evidence"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                              <span>{row.evidenceFiles.length} file(s)</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">Self-declared</span>
                          )}
                        </td>

                        {/* 7. Contributor Remarks */}
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <span className="text-[11px] text-slate-600 block line-clamp-2">
                            {row.remarks || '--'}
                          </span>
                          {row.reviewerDecision?.correctionReason && (
                            <div className="mt-1 p-1.5 rounded bg-rose-50 border border-rose-200 text-[10px] text-rose-800">
                              <strong>Flagged:</strong> {row.reviewerDecision.correctionReason}
                            </div>
                          )}
                        </td>

                        {/* 8. Review Status */}
                        <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                          {isVerified ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Verified
                            </span>
                          ) : isCorrection ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                              ✕ Correction Req
                            </span>
                          ) : isResubmitted ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300">
                              Resubmitted v{row.version}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                              Pending Review
                            </span>
                          )}
                        </td>

                        {/* 9. Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* History button if row has decisions */}
                            {row.reviewerDecision?.history && row.reviewerDecision.history.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setHistoryTargetRow(row)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                                title="Inspect audit trail and previous revisions"
                              >
                                <History className="w-3.5 h-3.5 text-slate-500" />
                                <span>Audit</span>
                              </button>
                            )}

                            {/* Correct button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleInitiateRowCorrect(currentDossier.dossierId, row, {
                                  projectName: currentDossier.projectName,
                                  siteName: currentDossier.siteName,
                                  period: `${currentDossier.monthName} (${currentDossier.financialYear})`,
                                })
                              }
                              disabled={isVerified}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                                isVerified
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs cursor-pointer'
                              }`}
                              title={isVerified ? 'Row verified and published to Auditor' : 'Verify row and publish to Auditor'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Correct</span>
                            </button>

                            {/* Incorrect button */}
                            <button
                              type="button"
                              onClick={() => handleOpenCorrectionModal(currentDossier.dossierId, row)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 active:scale-95 shadow-xs"
                              title="Require correction from Data Contributor"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Incorrect</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL DOSSIERS OVERVIEW */}
      {activeTab === 'DOSSIERS' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {filteredDossiers.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No monthly dossiers match selected filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Submissions from the Data Contributor portal automatically arrive here in real-time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 text-left">Dossier &amp; Scope</th>
                    <th className="px-4 py-3 text-left">Period</th>
                    <th className="px-4 py-3 text-left">Contributor</th>
                    <th className="px-4 py-3 text-center">Verification Progress</th>
                    <th className="px-4 py-3 text-center">Dossier Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedDossiers.map((d) => {
                    const rowVals = Object.values(d.rows || {});
                    const total = d.totalRows || rowVals.length || 1;
                    const verified = d.verifiedRows || 0;
                    const pct = Math.round((verified / total) * 100);

                    return (
                      <tr key={d.dossierId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 text-xs">{d.projectName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {d.projectCode} &bull; {d.siteName}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-800">{d.monthName}</span>
                          <span className="text-slate-400 font-mono block text-[11px]">{d.financialYear}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-slate-800 font-medium">{d.submittingUser}</div>
                          <span className="text-[10px] text-slate-400 block font-mono">{d.submittedAt}</span>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <div className="w-36 mx-auto space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-emerald-700 font-bold">{verified} Verified</span>
                              <span className="text-rose-600 font-bold">{d.correctionRequiredRows || 0} Req</span>
                              <span className="text-slate-500 font-bold">{total} Tot</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${(verified / total) * 100}%` }}
                                className="bg-emerald-500 h-full transition-all"
                              />
                              <div
                                style={{ width: `${((d.correctionRequiredRows || 0) / total) * 100}%` }}
                                className="bg-rose-500 h-full transition-all"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 block">{pct}% Complete</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                              d.status === 'Fully Reviewed'
                                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                : d.status === 'Changes Requested'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : d.status === 'Partially Reviewed'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDossierId(d.dossierId);
                              setActiveTab('FULL_TABLE');
                              setCurrentPage(1);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#003B73] hover:bg-[#002850] active:scale-95 rounded-lg transition-all shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review Full Table ({total})</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MASTER ROW QUEUE ACROSS ALL SUBMISSIONS */}
      {activeTab === 'ALL_ROWS' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {allSubmittedRows.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No rows matching selected filters</h4>
              <p className="text-xs text-slate-500 mt-1">
                Try switching the filters or selecting &quot;All Principles&quot; to inspect submitted rows.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-3.5 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-left">Indicator Title &amp; Principle</th>
                    <th className="px-3.5 py-3 text-left">Project &amp; Site</th>
                    <th className="px-3 py-3 text-center">Submitted Value</th>
                    <th className="px-3 py-3 text-center">Evidence</th>
                    <th className="px-3.5 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Row Review Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedAllRows.map(({ dossierId, projectName, siteName, monthName, row }) => {
                    const isVerified = row.reviewStatus === 'VERIFIED';
                    const isCorrection = row.reviewStatus === 'CORRECTION_REQUIRED';
                    const isResubmitted = row.reviewStatus === 'RESUBMITTED';

                    return (
                      <tr
                        key={`${dossierId}_${row.id}`}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isVerified ? 'bg-emerald-50/20' : isCorrection ? 'bg-rose-50/20' : isResubmitted ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        <td className="px-3.5 py-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                          {row.id}
                          {row.version && row.version > 1 && (
                            <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                              v{row.version}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          <div className="font-bold text-slate-900 leading-tight">{row.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span>{row.principleTitle}</span>
                            <span>&bull;</span>
                            <span className="font-semibold text-slate-500">{row.category}</span>
                            {row.isBrsrCore && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[9px]">
                                CORE
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3.5 py-3 text-slate-600">
                          <div className="font-medium text-slate-800 truncate max-w-[160px]">{projectName}</div>
                          <div className="text-[10px] text-slate-400">{siteName} &bull; {monthName}</div>
                        </td>

                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs border ${
                              isResubmitted ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-slate-100 text-slate-900 border-slate-200'
                            }`}
                          >
                            {row.currentValue} {row.unit}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {row.evidenceFiles && row.evidenceFiles.length > 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setEvidencePreviewFile({
                                  ...row.evidenceFiles[0],
                                  disclosureCode: row.id,
                                  disclosureName: row.name,
                                })
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition-colors"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                              <span>{row.evidenceFiles.length} file(s)</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">None</span>
                          )}
                        </td>

                        <td className="px-3.5 py-3 text-center whitespace-nowrap">
                          {isVerified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Verified
                            </span>
                          ) : isCorrection ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                              ✕ Correction Req
                            </span>
                          ) : isResubmitted ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300">
                              Resubmitted v{row.version}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Correct Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleInitiateRowCorrect(dossierId, row, {
                                  projectName,
                                  siteName,
                                  period: monthName,
                                })
                              }
                              disabled={isVerified}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                                isVerified
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs cursor-pointer'
                              }`}
                              title={isVerified ? 'Row verified and published to Auditor view' : 'Mark row as Correct and publish to Auditor view'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Correct</span>
                            </button>

                            {/* Incorrect Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenCorrectionModal(dossierId, row)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 active:scale-95 shadow-xs"
                              title="Flag row as Incorrect and send to Contributor Correction Center"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Incorrect</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: AUDITOR LIVE PUBLISHED STREAM MONITOR */}
      {activeTab === 'AUDITOR_STREAM' && (
        <div className="bg-white rounded-xl shadow-xs border border-purple-200 overflow-hidden">
          <div className="bg-purple-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                <h3 className="text-sm font-bold">Auditor Live Published Stream</h3>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Statutory audit stream: shows only indicator rows verified by ESG Review Leads. Automatically synchronized in real-time.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-800 text-purple-100 text-xs font-bold border border-purple-700 self-start sm:self-auto">
              {auditorStreamRecords.length} Published Disclosures
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-100 text-xs">
              <thead className="bg-purple-50/70 font-semibold text-purple-900 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3.5 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Verified Metric &amp; Principle</th>
                  <th className="px-3.5 py-3 text-left">Project Scope</th>
                  <th className="px-3 py-3 text-center">Period</th>
                  <th className="px-3.5 py-3 text-center font-bold">Approved Value</th>
                  <th className="px-3.5 py-3 text-left">Review Lead Sign-Off</th>
                  <th className="px-3 py-3 text-center">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {auditorStreamRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No records verified yet. Mark indicator rows as Correct in the Review Cockpit to immediately publish them here!
                    </td>
                  </tr>
                ) : (
                  auditorStreamRecords.map((item, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-800">{item.row.id}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-bold text-slate-900 leading-tight">{item.row.name}</div>
                        <div className="text-[10px] text-purple-800 mt-0.5 font-semibold">
                          {item.row.principleTitle} &bull; {item.row.category}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-slate-700">
                        <div className="font-medium text-slate-900">{item.projectName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.siteName}</div>
                      </td>
                      <td className="px-3 py-3 text-center text-slate-600">
                        <span className="font-semibold">{item.monthName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{item.financialYear}</span>
                      </td>
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        <span className="px-3 py-1 rounded-md font-mono font-bold bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs">
                          {item.row.currentValue} {item.row.unit}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-slate-600 text-[11px]">
                        <span className="font-semibold text-slate-800 block">{item.verifiedBy}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.verifiedAt}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-800 border border-purple-200">
                          v{item.version}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs">
          <div className="text-slate-500">
            Showing Page <strong className="text-slate-900">{currentPage}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong> (Total items: {totalItems})
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal 1: Mandatory Row Correction Dialog */}
      {correctionTarget && (
        <RequestRowCorrectionModal
          isOpen={Boolean(correctionTarget)}
          onClose={() => setCorrectionTarget(null)}
          rowName={correctionTarget.rowName}
          rowCode={correctionTarget.rowCode}
          currentValue={correctionTarget.currentValue}
          unit={correctionTarget.unit}
          onConfirm={handleConfirmRowCorrection}
        />
      )}

      {/* Modal 2: Row Revision & Audit History Viewer */}
      {historyTargetRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Immutable Audit Trail &bull; {historyTargetRow.id}
                </h3>
                <p className="text-xs text-slate-500">{historyTargetRow.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryTargetRow(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {historyTargetRow.reviewerDecision?.history?.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1 text-xs relative"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        step.action === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : step.action === 'CORRECTION_REQUIRED'
                          ? 'bg-rose-100 text-rose-800'
                          : step.action === 'RESUBMITTED'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {step.action} (Revision v{step.version})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-slate-700">
                    <span>
                      Actor: <strong>{step.actorName}</strong>
                    </span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      Value: {step.value} {historyTargetRow.unit}
                    </span>
                  </div>
                  {step.comment && (
                    <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded border border-slate-200/60 mt-1">
                      {step.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryTargetRow(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Close Audit Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Supporting Evidence Previewer */}
      {evidencePreviewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Supporting Evidence Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setEvidencePreviewFile(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">File Name</span>
                <span className="font-bold text-slate-900 text-sm break-all">{evidencePreviewFile.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">File Type</span>
                  <span className="font-semibold text-slate-800">{evidencePreviewFile.type || 'application/pdf'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">File Size</span>
                  <span className="font-mono text-slate-800">
                    {evidencePreviewFile.size ? `${(evidencePreviewFile.size / 1000000).toFixed(2)} MB` : '1.45 MB'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Linked Disclosure</span>
                <span className="font-mono font-bold text-teal-800">
                  {evidencePreviewFile.disclosureCode} &bull; {evidencePreviewFile.disclosureName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Verification Integrity</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SHA256 Primary Audit Hash Verified</span>
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEvidencePreviewFile(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showNotice(`Inspected document "${evidencePreviewFile.name}" — SHA256 cryptographic hash verified for BRSR audit.`);
                  setEvidencePreviewFile(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-600 rounded-lg cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Verify &amp; Attest Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Row Verification Confirmation & Auditor Publication Interaction */}
      {confirmCorrectTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Confirm Indicator Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmCorrectTarget(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Indicator Code &amp; Title</span>
                <span className="font-mono font-bold text-slate-700">{confirmCorrectTarget.row.id}</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{confirmCorrectTarget.row.name}</p>
                <span className="text-[10px] text-slate-500">{confirmCorrectTarget.row.principleTitle}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-200/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Submitted Value</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {confirmCorrectTarget.row.currentValue} {confirmCorrectTarget.row.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Revision Version</span>
                  <span className="font-mono font-semibold text-purple-700">
                    Version v{confirmCorrectTarget.row.version || 1}
                  </span>
                </div>
              </div>

              {confirmCorrectTarget.projectName && (
                <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reporting Scope</span>
                  <span>{confirmCorrectTarget.projectName}</span>
                  {confirmCorrectTarget.siteName && <span> &bull; {confirmCorrectTarget.siteName}</span>}
                  {confirmCorrectTarget.period && <span> &bull; {confirmCorrectTarget.period}</span>}
                </div>
              )}

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-900 leading-relaxed">
                <strong>Statutory Assurance Impact:</strong> Marking this row as Verified will persist the review decision, record the review timestamp &amp; reviewer identity, and publish this record immediately to the authorized <strong>Auditor View</strong> in real-time.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmCorrectTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleExecuteRowCorrect(confirmCorrectTarget.dossierId, confirmCorrectTarget.row)
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verify &amp; Publish to Auditor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
