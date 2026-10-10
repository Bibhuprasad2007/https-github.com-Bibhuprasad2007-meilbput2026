import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Send,
  CheckCircle2,
  Filter,
  Search,
  Plus,
  ArrowRight,
  RotateCcw,
  FileCheck2,
  ChevronDown,
  Info,
  Building2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  useNexusData,
  type AuditFinding,
  type FindingSeverity,
  type FindingStatus,
} from '../../context/NexusDataContext';
import { useDemoAuth } from '../../context/DemoAuthContext';

export interface AuditFindingsTableProps {
  className?: string;
  onNavigateToCorrections?: () => void;
}

const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  Critical: {
    label: 'Critical',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    desc: 'Statutory non-compliance, SEBI BRSR Core violation, or missing statutory clearance.',
  },
  Major: {
    label: 'Major',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    desc: 'Significant numerical variance (>10%), emission factor discrepancy, or missing invoice slips.',
  },
  Minor: {
    label: 'Minor',
    bg: 'bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-300',
    desc: 'Sample testing rounding variance, secondary reconciliation note, or minor documentation gap.',
  },
  Observation: {
    label: 'Observation',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    desc: 'Advisory procedural observation or calibration certificate upcoming renewal notice.',
  },
};

const DISCREPANCY_TYPES = [
  'Emission Factor Deviation',
  'CGWA NOC Volume Exceeded',
  'Sampling Test Discrepancy',
  'Supporting Evidence Inadequacy',
  'Statutory SEBI BRSR Core Inconsistency',
  'Mathematical Calculation Discrepancy',
  'Calibration Certificate Expired',
  'Threshold / Benchmark Anomaly',
  'Other Statutory Discrepancy',
];

export const AuditFindingsTable: React.FC<AuditFindingsTableProps> = ({
  className = '',
  onNavigateToCorrections,
}) => {
  const { session } = useDemoAuth();
  const {
    auditFindings,
    updateFindingSeverity,
    routeFindingToWorkflow,
    resolveAuditFinding,
    addAuditFinding,
    dossiers,
  } = useNexusData();

  // Search & Filters
  const [searchValue, setSearchValue] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modals state
  const [routeTargetFinding, setRouteTargetFinding] = useState<AuditFinding | null>(null);
  const [routeRecipient, setRouteRecipient] = useState<'Contributor' | 'Reviewer' | 'Both'>('Contributor');
  const [routeReason, setRouteReason] = useState('');
  const [routeCorrection, setRouteCorrection] = useState('');

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newFindingDossierId, setNewFindingDossierId] = useState('');
  const [newFindingRowId, setNewFindingRowId] = useState('');
  const [newFindingType, setNewFindingType] = useState('Emission Factor Deviation');
  const [newFindingSeverity, setNewFindingSeverity] = useState<FindingSeverity>('Major');
  const [newFindingDescription, setNewFindingDescription] = useState('');
  const [newFindingCorrection, setNewFindingCorrection] = useState('');
  const [newFindingEvidenceRef, setNewFindingEvidenceRef] = useState('');

  const [detailFinding, setDetailFinding] = useState<AuditFinding | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Severity metrics calculation
  const metrics = useMemo(() => {
    let critical = 0;
    let major = 0;
    let minor = 0;
    let observation = 0;
    let routed = 0;
    let resolved = 0;

    auditFindings.forEach((f) => {
      if (f.severity === 'Critical') critical++;
      else if (f.severity === 'Major') major++;
      else if (f.severity === 'Minor') minor++;
      else if (f.severity === 'Observation') observation++;

      if (
        f.status === 'ROUTED_TO_CONTRIBUTOR' ||
        f.status === 'ROUTED_TO_REVIEWER' ||
        f.status === 'ROUTED_TO_BOTH' ||
        f.status === 'UNDER_RECTIFICATION'
      ) {
        routed++;
      } else if (f.status === 'RESOLVED') {
        resolved++;
      }
    });

    return {
      total: auditFindings.length,
      critical,
      major,
      minor,
      observation,
      routed,
      resolved,
    };
  }, [auditFindings]);

  // Filtered list
  const filteredFindings = useMemo(() => {
    return auditFindings.filter((item) => {
      if (selectedSeverity !== 'ALL' && item.severity !== selectedSeverity) return false;
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
      if (selectedType !== 'ALL' && item.discrepancyType !== selectedType) return false;

      if (searchValue.trim()) {
        const q = searchValue.toLowerCase();
        const matchCode = item.indicatorCode.toLowerCase().includes(q);
        const matchName = item.indicatorName.toLowerCase().includes(q);
        const matchProj = item.projectName.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchProj && !matchDesc && !matchId) return false;
      }

      return true;
    });
  }, [auditFindings, selectedSeverity, selectedStatus, selectedType, searchValue]);

  // Handle opening route modal
  const handleOpenRouteModal = (finding: AuditFinding) => {
    setRouteTargetFinding(finding);
    setRouteRecipient(finding.recipientTarget || 'Contributor');
    setRouteReason(finding.description);
    setRouteCorrection(finding.suggestedCorrection || '');
  };

  const handleConfirmRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeTargetFinding) return;

    const res = routeFindingToWorkflow(
      routeTargetFinding.id,
      routeRecipient,
      routeReason,
      routeCorrection
    );

    setRouteTargetFinding(null);
    if (res.success) {
      showToast(res.message);
    }
  };

  // Handle creating new finding
  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFindingDossierId || !newFindingRowId || !newFindingDescription.trim()) {
      return;
    }

    const selectedDossier = dossiers.find((d) => d.dossierId === newFindingDossierId);
    if (!selectedDossier) return;
    const selectedRow = selectedDossier.rows[newFindingRowId];
    if (!selectedRow) return;

    const newId = addAuditFinding({
      dossierId: newFindingDossierId,
      rowId: newFindingRowId,
      indicatorCode: selectedRow.id,
      indicatorName: selectedRow.name,
      projectName: selectedDossier.projectName,
      siteName: selectedDossier.siteName,
      financialYear: selectedDossier.financialYear,
      reportingMonth: selectedDossier.monthName,
      reportedValue: selectedRow.currentValue,
      unit: selectedRow.unit,
      discrepancyType: newFindingType,
      description: newFindingDescription.trim(),
      severity: newFindingSeverity,
      suggestedCorrection: newFindingCorrection.trim() || undefined,
      evidenceRef: newFindingEvidenceRef.trim() || undefined,
      auditorName: session?.user?.name || 'Sanjay Deshmukh (Lead BRSR Assurer)',
    });

    setIsLogModalOpen(false);
    setNewFindingDescription('');
    setNewFindingCorrection('');
    setNewFindingEvidenceRef('');
    showToast(`✓ Audit Discrepancy ${newId} logged successfully! Ready for workflow routing.`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-4 rounded-xl border border-purple-300 bg-purple-900 text-white shadow-xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner & Log Action */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Statutory Assurance Audit Findings
            </span>
            <span className="text-xs font-mono text-slate-400">
              Auditor: <strong className="text-white">{session?.user?.name || 'Sanjay Deshmukh (Lead BRSR Assurer)'}</strong>
            </span>
          </div>
          <h2 className="text-base font-extrabold text-white">
            Verification Discrepancies &amp; Findings Matrix
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Record verification anomalies discovered during statutory BRSR sample testing. Assign severity levels
            (Critical, Major, Minor, Observation) and route findings directly into Contributor / Reviewer correction workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (dossiers.length > 0) {
                setNewFindingDossierId(dossiers[0].dossierId);
                const firstRowKey = Object.keys(dossiers[0].rows || {})[0];
                if (firstRowKey) setNewFindingRowId(firstRowKey);
              }
              setIsLogModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 active:scale-95 text-white transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Verification Discrepancy</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards for Severity Tiers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-slate-600">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Discrepancies</span>
          <span className="text-xl font-extrabold text-slate-900">{metrics.total}</span>
          <span className="text-[10px] text-slate-400 block">{metrics.resolved} resolved</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-rose-500">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Critical Severity</span>
          <span className="text-xl font-extrabold text-rose-600">{metrics.critical}</span>
          <span className="text-[10px] text-rose-700 block font-semibold">BRSR Core Violations</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Major Severity</span>
          <span className="text-xl font-extrabold text-amber-600">{metrics.major}</span>
          <span className="text-[10px] text-amber-700 block font-semibold">&gt;10% Metric Variance</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-sky-500">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Minor Severity</span>
          <span className="text-xl font-extrabold text-sky-600">{metrics.minor}</span>
          <span className="text-[10px] text-sky-700 block">Rounding &amp; Secondary Gaps</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-purple-500">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Observations</span>
          <span className="text-xl font-extrabold text-purple-600">{metrics.observation}</span>
          <span className="text-[10px] text-purple-700 block">Procedural Advisory Notes</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-teal-600">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Routed to Workflow</span>
          <span className="text-xl font-extrabold text-teal-700">{metrics.routed} Active</span>
          <span className="text-[10px] text-teal-800 block font-semibold">In Contributor Queues</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search discrepancies by indicator, ID, project, or description..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-700"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:bg-white focus:outline-none focus:border-purple-700"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
              <option value="Observation">Observation</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:bg-white focus:outline-none focus:border-purple-700"
            >
              <option value="ALL">All Finding Statuses</option>
              <option value="OPEN">Open (Unrouted)</option>
              <option value="ROUTED_TO_CONTRIBUTOR">Routed to Contributor</option>
              <option value="ROUTED_TO_REVIEWER">Routed to Reviewer</option>
              <option value="ROUTED_TO_BOTH">Routed to Both</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:bg-white focus:outline-none focus:border-purple-700"
            >
              <option value="ALL">All Discrepancy Types</option>
              {DISCREPANCY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(selectedSeverity !== 'ALL' || selectedStatus !== 'ALL' || selectedType !== 'ALL' || searchValue.trim()) && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Filtering {filteredFindings.length} of {auditFindings.length} findings</span>
            <button
              type="button"
              onClick={() => {
                setSelectedSeverity('ALL');
                setSelectedStatus('ALL');
                setSelectedType('ALL');
                setSearchValue('');
              }}
              className="text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Findings Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 bg-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-300" />
            <h3 className="text-sm font-bold">Independent Assurance Discrepancy Registry</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-900 text-purple-200 border border-purple-800 font-mono">
            {filteredFindings.length} Discrepancies Registered
          </span>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Discrepancies Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No audit discrepancies match the selected criteria. All sample metrics are verified against statutory thresholds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-3 text-left">Finding ID</th>
                  <th className="px-4 py-3 text-left">Indicator &amp; Project Scope</th>
                  <th className="px-3 py-3 text-center">Reported Value</th>
                  <th className="px-4 py-3 text-left">Discrepancy &amp; Finding Details</th>
                  <th className="px-3.5 py-3 text-center font-bold">Severity Level</th>
                  <th className="px-3.5 py-3 text-center">Workflow Status</th>
                  <th className="px-4 py-3 text-right">Auditor Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredFindings.map((finding) => {
                  const sevConf = SEVERITY_CONFIG[finding.severity];
                  const isRouted =
                    finding.status === 'ROUTED_TO_CONTRIBUTOR' ||
                    finding.status === 'ROUTED_TO_REVIEWER' ||
                    finding.status === 'ROUTED_TO_BOTH' ||
                    finding.status === 'UNDER_RECTIFICATION';
                  const isResolved = finding.status === 'RESOLVED';

                  return (
                    <tr
                      key={finding.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        finding.severity === 'Critical'
                          ? 'bg-rose-50/15'
                          : finding.severity === 'Major'
                          ? 'bg-amber-50/15'
                          : ''
                      }`}
                    >
                      {/* 1. Finding ID & Date */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 block">{finding.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{finding.createdAt}</span>
                      </td>

                      {/* 2. Indicator & Project Scope */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-bold text-slate-900 leading-tight">
                          <span className="font-mono text-purple-700 mr-1.5">{finding.indicatorCode}</span>
                          {finding.indicatorName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-slate-700">{finding.projectName}</span>
                          <span>&bull;</span>
                          <span>{finding.siteName}</span>
                          <span>&bull;</span>
                          <span className="font-mono text-slate-500">{finding.reportingMonth} ({finding.financialYear})</span>
                        </div>
                      </td>

                      {/* 3. Reported Value */}
                      <td className="px-3 py-3.5 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md font-mono font-bold text-xs bg-slate-100 border border-slate-200 text-slate-900">
                          {finding.reportedValue} {finding.unit}
                        </span>
                      </td>

                      {/* 4. Discrepancy & Finding Details */}
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{finding.discrepancyType}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {finding.description}
                        </p>
                        {finding.suggestedCorrection && (
                          <div className="mt-1 p-1.5 rounded bg-purple-50/70 border border-purple-200/50 text-[10px] text-purple-900">
                            <strong>Remedial Recommendation:</strong> {finding.suggestedCorrection}
                          </div>
                        )}
                        {finding.evidenceRef && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1">
                            <FileCheck2 className="w-3 h-3 text-teal-600" />
                            <span>Ref: {finding.evidenceRef}</span>
                          </span>
                        )}
                      </td>

                      {/* 5. Severity Level - Interactive Dropdown */}
                      <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-block">
                          <select
                            value={finding.severity}
                            onChange={(e) =>
                              updateFindingSeverity(finding.id, e.target.value as FindingSeverity)
                            }
                            title={`Current Severity: ${finding.severity}\n${sevConf.desc}`}
                            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider border cursor-pointer focus:outline-none ${sevConf.bg} ${sevConf.text} ${sevConf.border}`}
                          >
                            <option value="Critical">Critical</option>
                            <option value="Major">Major</option>
                            <option value="Minor">Minor</option>
                            <option value="Observation">Observation</option>
                          </select>
                        </div>
                      </td>

                      {/* 6. Workflow Status */}
                      <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                        {isResolved ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Resolved
                          </span>
                        ) : isRouted ? (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 block">
                              Routed ({finding.recipientTarget || 'Contributor'})
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block">
                              In Correction Workflow
                            </span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
                            Open (Unrouted)
                          </span>
                        )}
                      </td>

                      {/* 7. Auditor Workflow Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Route to Workflow Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenRouteModal(finding)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs ${
                              isRouted
                                ? 'bg-purple-100 text-purple-900 hover:bg-purple-200 border border-purple-300'
                                : 'bg-[#003B73] hover:bg-[#002850] active:scale-95 text-white'
                            }`}
                            title="Route finding to Data Contributor and Reviewer via correction workflow"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isRouted ? 'Re-Route Workflow' : 'Route to Workflow'}</span>
                          </button>

                          {/* Resolve Button */}
                          {!isResolved && (
                            <button
                              type="button"
                              onClick={() => {
                                const res = resolveAuditFinding(finding.id);
                                showToast(res.message);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                              title="Mark finding reconciled and resolved"
                            >
                              <Check className="w-3 h-3" />
                              <span>Resolve</span>
                            </button>
                          )}

                          {/* Inspect Detail Button */}
                          <button
                            type="button"
                            onClick={() => setDetailFinding(finding)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Inspect full audit finding context"
                          >
                            <Info className="w-3.5 h-3.5" />
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

      {/* Modal 1: Route Finding to Workflow */}
      {routeTargetFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Route Audit Discrepancy into Workflow
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRouteTargetFinding(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRoute} className="space-y-4 text-xs">
              {/* Finding Context Card */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-800">{routeTargetFinding.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      SEVERITY_CONFIG[routeTargetFinding.severity].bg
                    } ${SEVERITY_CONFIG[routeTargetFinding.severity].text}`}
                  >
                    {routeTargetFinding.severity} Severity
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-tight">
                  {routeTargetFinding.indicatorCode} &bull; {routeTargetFinding.indicatorName}
                </h4>
                <div className="text-slate-600 text-[11px] flex items-center gap-2">
                  <span>{routeTargetFinding.projectName}</span>
                  <span>&bull;</span>
                  <span className="font-mono font-bold">
                    Reported: {routeTargetFinding.reportedValue} {routeTargetFinding.unit}
                  </span>
                </div>
              </div>

              {/* Recipient Target Radio / Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Route To Recipient: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      routeRecipient === 'Contributor'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recipient"
                      value="Contributor"
                      checked={routeRecipient === 'Contributor'}
                      onChange={() => setRouteRecipient('Contributor')}
                      className="sr-only"
                    />
                    <span className="block text-xs">Data Contributor</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Correction Center</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      routeRecipient === 'Reviewer'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recipient"
                      value="Reviewer"
                      checked={routeRecipient === 'Reviewer'}
                      onChange={() => setRouteRecipient('Reviewer')}
                      className="sr-only"
                    />
                    <span className="block text-xs">Review Lead</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Review Queue Re-check</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      routeRecipient === 'Both'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recipient"
                      value="Both"
                      checked={routeRecipient === 'Both'}
                      onChange={() => setRouteRecipient('Both')}
                      className="sr-only"
                    />
                    <span className="block text-xs">Both Parties</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Dual Escalation</span>
                  </label>
                </div>
              </div>

              {/* Discrepancy Reason Explanation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Discrepancy Detail / Rejection Reason: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={routeReason}
                  onChange={(e) => setRouteReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="Detail the verification discrepancy observed..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-purple-700 font-medium"
                />
              </div>

              {/* Remedial Guidance */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Expected Remedial Action / Guidance (Optional):
                </label>
                <input
                  type="text"
                  value={routeCorrection}
                  onChange={(e) => setRouteCorrection(e.target.value)}
                  placeholder="e.g. Upload revised emission calculation and CPCB Form 10 manifest."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-purple-700"
                />
              </div>

              {/* Statutory Impact Notice */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-[11px] text-purple-900 leading-relaxed">
                <strong>Workflow Integration:</strong> Submitting will mark the row as{' '}
                <em>Correction Required</em>, record the Auditor finding in the immutable audit log, and immediately
                surface the task in the <strong>Data Contributor Correction Center</strong>.
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRouteTargetFinding(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white bg-purple-700 hover:bg-purple-600 font-bold shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch into Correction Workflow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Log New Discrepancy */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Log New Auditor Verification Discrepancy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFinding} className="space-y-4 text-xs">
              {/* Select Submission Dossier & Indicator */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Project Submission Dossier: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newFindingDossierId}
                    onChange={(e) => {
                      setNewFindingDossierId(e.target.value);
                      const selD = dossiers.find((d) => d.dossierId === e.target.value);
                      if (selD) {
                        const firstRowKey = Object.keys(selD.rows || {})[0];
                        if (firstRowKey) setNewFindingRowId(firstRowKey);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    required
                  >
                    {dossiers.map((d) => (
                      <option key={d.dossierId} value={d.dossierId}>
                        {d.projectName} ({d.monthName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Indicator Metric: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newFindingRowId}
                    onChange={(e) => setNewFindingRowId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    required
                  >
                    {newFindingDossierId &&
                      (() => {
                        const selD = dossiers.find((d) => d.dossierId === newFindingDossierId);
                        if (!selD) return null;
                        return Object.values(selD.rows || {}).map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.id} &bull; {r.name}
                          </option>
                        ));
                      })()}
                  </select>
                </div>
              </div>

              {/* Discrepancy Type & Severity */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Discrepancy Category: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newFindingType}
                    onChange={(e) => setNewFindingType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    {DISCREPANCY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Severity Tier: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newFindingSeverity}
                    onChange={(e) => setNewFindingSeverity(e.target.value as FindingSeverity)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                  >
                    <option value="Critical">Critical (Non-compliance)</option>
                    <option value="Major">Major (Variance &gt;10%)</option>
                    <option value="Minor">Minor (Sampling / Rounding)</option>
                    <option value="Observation">Observation (Procedural Note)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Discrepancy Description &amp; Audit Finding: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={newFindingDescription}
                  onChange={(e) => setNewFindingDescription(e.target.value)}
                  rows={3}
                  required
                  placeholder="State the observed variance, sample testing anomaly, or missing audit document..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-purple-700"
                />
              </div>

              {/* Suggested Correction & Evidence Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Required Remedial Action:
                  </label>
                  <input
                    type="text"
                    value={newFindingCorrection}
                    onChange={(e) => setNewFindingCorrection(e.target.value)}
                    placeholder="e.g. Recalculate using official CEA emission factor..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-purple-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supporting Document Reference:
                  </label>
                  <input
                    type="text"
                    value={newFindingEvidenceRef}
                    onChange={(e) => setNewFindingEvidenceRef(e.target.value)}
                    placeholder="e.g. diesel_invoice_batch_02.pdf"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-purple-700 font-mono"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white bg-purple-700 hover:bg-purple-600 font-bold shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Discrepancy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Finding Detail Inspection */}
      {detailFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Audit Discrepancy Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailFinding(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-purple-900">{detailFinding.id}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    SEVERITY_CONFIG[detailFinding.severity].bg
                  } ${SEVERITY_CONFIG[detailFinding.severity].text}`}
                >
                  {detailFinding.severity}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Disclosure</span>
                <span className="font-mono font-bold text-slate-800">{detailFinding.indicatorCode}</span>
                <p className="font-semibold text-slate-900 text-sm">{detailFinding.indicatorName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reported Value</span>
                  <span className="font-mono font-bold text-slate-800">
                    {detailFinding.reportedValue} {detailFinding.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Auditor Identity</span>
                  <span className="font-semibold text-slate-800">{detailFinding.auditorName}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Discrepancy Detail</span>
                <p className="text-slate-800 leading-relaxed font-medium mt-0.5">{detailFinding.description}</p>
              </div>

              {detailFinding.suggestedCorrection && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Remedial Direction</span>
                  <p className="text-purple-900 font-semibold mt-0.5">{detailFinding.suggestedCorrection}</p>
                </div>
              )}

              {detailFinding.evidenceRef && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Evidence Reference</span>
                  <span className="font-mono text-teal-800 font-semibold">{detailFinding.evidenceRef}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDetailFinding(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = detailFinding;
                  setDetailFinding(null);
                  handleOpenRouteModal(target);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-lg cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Route via Workflow</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
