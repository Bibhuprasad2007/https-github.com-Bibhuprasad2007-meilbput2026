import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';

export const ReportReadinessPage: React.FC = () => {
  const CHECKLIST_GROUPS = [
    {
      id: 'applicability',
      title: '1. Boundary & Applicability Review',
      description: 'Verification of in-scope subsidiaries, JV entities, and materiality boundaries.',
      items: [
        'Consolidation entity list validated against corporate registrar',
        'Materiality thresholds confirmed for SEBI BRSR Core indicators',
        'Boundary change justifications documented and approved',
      ],
    },
    {
      id: 'mandatory_fields',
      title: '2. Mandatory Disclosure Completeness',
      description: 'Audit of essential and leadership indicators across Section A, B, and C.',
      items: [
        '100% completion of Section A general business disclosures',
        'Section B management policies signed off by Board / Committee',
        'Mandatory Principle P1-P9 essential indicators completed',
      ],
    },
    {
      id: 'required_approvals',
      title: '3. Multi-Tier Workflow Approvals',
      description: 'Confirmation that all department heads and designated reviewers have signed off.',
      items: [
        'Plant / Unit Head sign-offs received for all operational sites',
        'Functional ESG Lead verification completed across all principles',
        'CFO / Sustainability Committee preliminary review completed',
      ],
    },
    {
      id: 'validation_exceptions',
      title: '4. Validation & Exception Clearance',
      description: 'Zero unresolved blocker exceptions or cross-table reconciliation failures.',
      items: [
        'All critical validation exceptions marked as resolved',
        'Scope 1 & 2 GHG calculation cross-checks validated',
        'Employee and worker count reconciled with audited HR rolls',
      ],
    },
    {
      id: 'evidence_completeness',
      title: '5. Evidence & Supporting Documentation',
      description: 'Adequate supporting audit evidence uploaded for verifiable ESG metrics.',
      items: [
        'Mandatory evidence files attached to high-assurance disclosures',
        'Energy and water utility invoices matched with reported volumes',
        'Safety incident registers and OSHA compliance logs attached',
      ],
    },
    {
      id: 'reconciliation',
      title: '6. Financial & Non-Financial Reconciliation',
      description: 'Alignment between financial annual report and sustainability disclosures.',
      items: [
        'Turnover, net worth, and Capex aligned with audited financial statements',
        'CSR expenditure reconciled with MCA statutory filing numbers',
        'R&D spending on sustainable technologies verified against ledger',
      ],
    },
    {
      id: 'prior_year',
      title: '7. Prior-Year Comparative Trend Analysis',
      description: 'Variance checks against FY24 and FY25 historical baseline numbers.',
      items: [
        'Year-on-year energy intensity variance analyzed and explained',
        'Emission reduction milestones checked against ESG targets',
        'Workforce diversity and gender balance progression reviewed',
      ],
    },
    {
      id: 'assurance',
      title: '8. External Assurance & Auditor Readiness',
      description: 'Final preparation for third-party independent limited/reasonable assurance.',
      items: [
        'Assurance provider access credentials provisioned',
        'Sampling methodology dataset pre-compiled for BRSR Core',
        'Draft Assurance Statement template verified for SEBI compliance',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="BRSR Report Readiness & Sign-Off Checklist"
        description="Comprehensive pre-publication audit checklist to verify disclosure completeness, validation integrity, and assurance readiness before final executive approval."
      />

      {/* Final Sign-Off Action Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Executive Management Sign-Off Protocol
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl leading-relaxed">
              This action becomes available after the reporting cycle is complete and all blocking checks pass. In prototype mode, readiness criteria are evaluated against backend data engines.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed border border-slate-200 shrink-0"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Mark as Ready for Management</span>
        </button>
      </div>

      {/* 8 Checklist Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CHECKLIST_GROUPS.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div className="p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="text-sm font-bold text-slate-800">{group.title}</h4>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Not available
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{group.description}</p>

              <div className="space-y-2.5">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 text-xs p-2.5 rounded-lg bg-slate-50/70 border border-slate-100"
                  >
                    <span className="text-slate-700 leading-snug">{item}</span>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
                      Not available
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-right">
              <span className="text-[11px] text-slate-400 italic">
                Evaluated by automated backend governance engine
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
