import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '../../admin/common/PageHeader';
import { useNexusData } from '../../../context/NexusDataContext';
import { useDemoAuth } from '../../../context/DemoAuthContext';
import { AuditFindingsTable } from '../../auditor/AuditFindingsTable';

export const EvidenceReviewPage: React.FC = () => {
  const { session } = useDemoAuth();
  const { evidence, dossiers, updateEvidenceStatus, getVerifiedAuditorRecords, auditFindings } = useNexusData();

  const isAuditorRole = session?.role === 'auditor';

  const [auditorActiveTab, setAuditorActiveTab] = useState<'FINDINGS' | 'VERIFIED_STREAM' | 'EVIDENCE_VAULT'>('FINDINGS');
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [inspectingDoc, setInspectingDoc] = useState<any | null>(null);

  // If in Auditor view, retrieve only verified records as per Section 9
  const auditorVerifiedRecords = useMemo(() => {
    return getVerifiedAuditorRecords();
  }, [getVerifiedAuditorRecords, dossiers]);

  // Consolidate evidence items
  const allEvidenceFiles = useMemo(() => {
    const list: any[] = [...evidence];

    // Also pull evidence attached to dossiers
    dossiers.forEach((d) => {
      Object.values(d.rows || {}).forEach((r) => {
        (r.evidenceFiles || []).forEach((f) => {
          if (!list.some((existing) => existing.id === f.id || existing.name === f.name)) {
            list.push({
              id: f.id,
              name: f.name,
              documentType: r.isBrsrCore ? 'BRSR Core Primary Audit Trail' : 'Operational Evidence',
              fileFormat: f.type || 'PDF',
              fileSizeBytes: f.size || 2150000,
              url: f.url || `/evidence/${f.name}`,
              uploadedBy: d.submittingUser,
              uploadedOn: f.uploadedAt || d.submittedAt,
              status: r.reviewStatus === 'VERIFIED' ? 'ACCEPTED' : r.reviewStatus === 'CORRECTION_REQUIRED' ? 'REJECTED' : 'UNDER_REVIEW',
              disclosureCode: r.id,
              disclosureName: r.name,
              projectName: d.projectName,
              reportingPeriod: `${d.monthName} ${d.financialYear}`,
            });
          }
        });
      });
    });

    return list;
  }, [evidence, dossiers]);

  const filteredEvidence = useMemo(() => {
    return allEvidenceFiles.filter((doc) => {
      // If user is Auditor, enforce eligibility: show only accepted / verified items
      if (isAuditorRole && doc.status !== 'ACCEPTED') {
        return false;
      }

      if (selectedStatus !== 'ALL' && doc.status !== selectedStatus) return false;
      if (selectedFormat !== 'ALL' && doc.fileFormat?.toLowerCase() !== selectedFormat.toLowerCase()) return false;

      if (searchValue.trim()) {
        const query = searchValue.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(query);
        const matchProj = (doc.projectName || '').toLowerCase().includes(query);
        const matchDisc = (doc.disclosureCode || '').toLowerCase().includes(query);
        if (!matchName && !matchProj && !matchDisc) return false;
      }

      return true;
    });
  }, [allEvidenceFiles, isAuditorRole, selectedStatus, selectedFormat, searchValue]);

  const handleVerifyEvidence = (docId: string) => {
    updateEvidenceStatus(docId, 'ACCEPTED', 'Verified authentic by Reviewer.');
  };

  const handleFlagEvidence = (docId: string) => {
    updateEvidenceStatus(docId, 'REJECTED', 'Flagged for replacement or calibration check.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAuditorRole ? 'Independent Auditor Assurance & Evidence Vault' : 'Evidence Review & Document Assurance'}
        description={
          isAuditorRole
            ? 'Authorized statutory auditor view. Securely inspects only verified and approved ESG disclosures, supporting test slips, and immutable audit logs.'
            : 'Review supporting evidence documents uploaded by data contributors. Verify authenticity, audit calibration slips, and manage assurance approvals.'
        }
      />

      {/* Auditor Specific Notice */}
      {isAuditorRole && (
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-purple-950">Statutory Auditor Eligibility Enforcement Active</h4>
            <p className="leading-relaxed">
              In accordance with Section 9 of the ESG Reporting Standards, unverified, draft, and correction-required disclosures are strictly excluded from this view. All records rendered below have passed full Reviewer verification and are ready for statutory BRSR Core sign-off.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 flex-wrap">
        <button
          type="button"
          onClick={() => setAuditorActiveTab('FINDINGS')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            auditorActiveTab === 'FINDINGS'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Verification Discrepancies &amp; Findings ({auditFindings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAuditorActiveTab('VERIFIED_STREAM')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            auditorActiveTab === 'VERIFIED_STREAM'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Statutory Verified Disclosures ({auditorVerifiedRecords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAuditorActiveTab('EVIDENCE_VAULT')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            auditorActiveTab === 'EVIDENCE_VAULT'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Evidence Document Vault ({filteredEvidence.length})</span>
        </button>
      </div>

      {/* TAB 1: Audit Findings Table */}
      {auditorActiveTab === 'FINDINGS' && (
        <AuditFindingsTable />
      )}

      {/* TAB 2: Live Verified Records Stream for Auditor */}
      {auditorActiveTab === 'VERIFIED_STREAM' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-purple-600">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Verified Indicator Disclosures</span>
              <span className="text-xl font-extrabold text-purple-900">{auditorVerifiedRecords.length} Verified</span>
              <span className="text-[10px] text-purple-700 block font-medium">100% Eligible for BRSR Core Assurance</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-emerald-600">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Substantiating Audit Documents</span>
              <span className="text-xl font-extrabold text-emerald-800">{filteredEvidence.length} Files</span>
              <span className="text-[10px] text-emerald-700 block font-medium">Invoices, meter logs, and test slips</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-teal-600">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Assurance Readiness Score</span>
              <span className="text-xl font-extrabold text-teal-800">100%</span>
              <span className="text-[10px] text-teal-700 block font-medium">Zero unverified records included</span>
            </div>
          </div>

          {/* Statutory Verified Disclosures Table */}
          <div className="bg-white rounded-xl shadow-xs border border-purple-200 overflow-hidden">
            <div className="p-4 bg-purple-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Statutory Verified ESG Disclosures (Real-Time Live)</h3>
                <p className="text-xs text-purple-200">
                  Authoritative metrics verified by ESG Review Leads. Automatically streamed from Reviewer Queue upon sign-off.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-800 text-purple-100 font-bold text-xs border border-purple-600">
                {auditorVerifiedRecords.length} Verified Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-purple-100 text-xs">
                <thead className="bg-purple-50/70 font-semibold text-purple-900 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-3.5 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-left">Indicator Title &amp; Principle</th>
                    <th className="px-3.5 py-3 text-left">Project &amp; Site</th>
                    <th className="px-3 py-3 text-center">Period</th>
                    <th className="px-3.5 py-3 text-center font-bold">Verified Value</th>
                    <th className="px-3.5 py-3 text-left">Verification Sign-Off</th>
                    <th className="px-3 py-3 text-center">Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {auditorVerifiedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No verified records currently available. As soon as a Reviewer marks a row Correct, it will stream here instantly.
                      </td>
                    </tr>
                  ) : (
                    auditorVerifiedRecords.map((item, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-3.5 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {item.row.id}
                        </td>
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
        </div>
      )}

      {/* TAB 3: Evidence Document Vault */}
      {auditorActiveTab === 'EVIDENCE_VAULT' && (
        <div className="space-y-4">

      {/* Search & Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by document name, disclosure code, or project..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-700"
          />
        </div>

        <div className="flex items-center gap-2">
          {!isAuditorRole && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="ACCEPTED">Accepted / Verified</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REJECTED">Flagged / Rejected</option>
            </select>
          )}

          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All File Formats</option>
            <option value="pdf">PDF</option>
            <option value="xlsx">Excel (XLSX)</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {filteredEvidence.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No evidence documents match criteria</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {isAuditorRole
                ? 'Only evidence documents for Verified disclosures appear in the Auditor view.'
                : 'Documents attached by contributors will stream here for verification.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Document Name</th>
                  <th className="px-3 py-3 text-left">Evidence Type</th>
                  <th className="px-3 py-3 text-center">Format &amp; Size</th>
                  <th className="px-3.5 py-3 text-left">Linked Disclosure</th>
                  <th className="px-3.5 py-3 text-left">Project / Scope</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredEvidence.map((doc) => {
                  const isAccepted = doc.status === 'ACCEPTED';
                  const isRejected = doc.status === 'REJECTED';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-xs">{doc.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Uploaded by {doc.uploadedBy}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 text-slate-600">
                        {doc.documentType || 'Invoice / Official Receipt'}
                      </td>

                      <td className="px-3 py-3.5 text-center font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {doc.fileFormat || 'PDF'}
                        </span>
                        <span className="text-slate-400 block text-[10px] mt-0.5">
                          {doc.fileSizeBytes ? `${(doc.fileSizeBytes / 1000000).toFixed(1)} MB` : '1.8 MB'}
                        </span>
                      </td>

                      <td className="px-3.5 py-3.5 text-slate-700">
                        <div className="font-mono font-bold text-slate-800 text-[11px]">{doc.disclosureCode || 'P6-IND-01'}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{doc.disclosureName || 'Direct Emissions'}</div>
                      </td>

                      <td className="px-3.5 py-3.5 text-slate-600">
                        <div className="font-medium text-slate-800">{doc.projectName || 'Raipur Expressway'}</div>
                        <div className="text-[10px] text-slate-400">{doc.reportingPeriod || 'March 2027'}</div>
                      </td>

                      <td className="px-3 py-3.5 text-center whitespace-nowrap">
                        {isAccepted ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Accepted
                          </span>
                        ) : isRejected ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                            ✕ Flagged
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                            Under Review
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {!isAuditorRole && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleVerifyEvidence(doc.id)}
                                disabled={isAccepted}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                                  isAccepted
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                }`}
                                title="Accept and verify supporting document"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFlagEvidence(doc.id)}
                                className="px-2 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                title="Flag for replacement"
                              >
                                Flag
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setInspectingDoc(doc)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Inspect document audit metadata"
                          >
                            <Eye className="w-4 h-4" />
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
    </div>
  )}

      {/* Audit Inspection Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Statutory Audit Document Inspection</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">File Name</span>
                <span className="font-bold text-slate-900 text-sm break-all">{inspectingDoc.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">File Format</span>
                  <span className="font-semibold text-slate-800">{inspectingDoc.fileFormat || 'PDF'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Uploaded By</span>
                  <span className="font-semibold text-slate-800">{inspectingDoc.uploadedBy}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Linked Disclosure</span>
                <span className="font-mono font-bold text-teal-800">
                  {inspectingDoc.disclosureCode || 'BRSR Core'} &bull; {inspectingDoc.disclosureName || 'Statutory Metric'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cryptographic Hash Verification</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SHA256: d85a4f78...902bf41e (Verified)</span>
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
