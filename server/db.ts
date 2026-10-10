import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateBrsrPdf } from './services/pdfGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/esg_database.json');

export interface RowReviewHistoryEntry {
  action: 'SUBMITTED' | 'VERIFIED' | 'CORRECTION_REQUIRED' | 'RESUBMITTED';
  actorName: string;
  timestamp: string;
  comment?: string;
  value: string | number;
  version: number;
}

export interface RowReviewDecision {
  rowId: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'CORRECTION_REQUIRED' | 'RESUBMITTED' | 'REJECTED';
  reviewerName?: string;
  reviewerId?: string;
  reviewTimestamp?: string;
  correctionReasonCategory?: string;
  correctionReason?: string;
  suggestedCorrection?: string;
  supportingComment?: string;
  version: number;
  history?: RowReviewHistoryEntry[];
}

export interface ESGSubmissionRowItem {
  id: string; // e.g. P1-IND-01
  name: string;
  principleId: number;
  principleTitle: string;
  category: string;
  description: string;
  unit: string;
  valueType: string;
  required: boolean;
  isBrsrCore?: boolean;
  previousMonthValue: string | number;
  currentValue: string | number;
  remarks: string;
  evidenceFiles: {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    url?: string;
  }[];
  reviewStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'CORRECTION_REQUIRED' | 'RESUBMITTED' | 'REJECTED';
  reviewerDecision?: RowReviewDecision;
  version: number;
  lastUpdated: string;
}

export interface ESGReportingDossier {
  dossierId: string;
  contextKey: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  siteId: string;
  siteName: string;
  financialYear: string;
  month: number;
  monthName: string;
  status: 'Submitted' | 'Under Review' | 'Partially Reviewed' | 'Changes Requested' | 'Fully Reviewed' | 'Resubmitted' | 'Approved for Auditor';
  submittingUser: string;
  submittedAt: string;
  lastReviewedAt?: string;
  reviewerName?: string;
  totalRows: number;
  verifiedRows: number;
  correctionRequiredRows: number;
  pendingRows: number;
  rows: Record<string, ESGSubmissionRowItem>;
}

export interface CorrectionRequestItem {
  id: string;
  assignmentId: string; // dossierId
  rowId: string;
  indicatorCode: string;
  indicatorName: string;
  projectName: string;
  siteName: string;
  financialYear: string;
  monthName: string;
  previousValue: string | number;
  unit: string;
  problem: string;
  reasonCategory: string;
  reason: string;
  requiredCorrection?: string;
  reviewerComment?: string;
  requestedAt: string;
  requestedBy: string;
  status: 'PENDING_CONTRIBUTOR' | 'RESUBMITTED' | 'RESOLVED';
  deadline: string;
  resubmittedValue?: string | number;
  contributorResponse?: string;
  resubmittedAt?: string;
  evidenceFiles?: { id: string; name: string; url?: string }[];
}

export interface ReviewAuditEntry {
  id: string;
  assignmentId: string;
  indicatorCode: string;
  indicatorName: string;
  submittedBy: string;
  reviewedBy: string;
  reviewDate: string;
  decision: 'APPROVE' | 'CORRECTION_REQUIRED' | 'RESUBMIT' | 'REJECT';
  previousValue: string | number;
  newValue: string | number;
  unit: string;
  reason: string;
  evidenceSummary: string;
  comments: string;
  scopeProject: string;
  reportingPeriod: string;
  version: number;
}

export interface CompanyProfile {
  cin: string;
  name: string;
  incorporationYear: string;
  incorporationDate: string;
  registeredOffice: string;
  corporateOffice: string;
  email: string;
  telephone: string;
  website: string;
  stockExchanges: string;
  paidUpCapital: string;
  brsrContactPerson: string;
  contactNumber: string;
  contactEmail: string;
  reportingBoundary: string;
  assuranceProvider: string;
  assuranceType: string;
  verificationStatuses: Record<string, 'Verified' | 'Pending Verification' | 'Not Publicly Verified'>;
  lastUpdated: string;
  updatedBy: string;
}

export interface FinalEsgReport {
  reportId: string;
  version: number;
  financialYear: string;
  reportingPeriod: {
    currentStart: string;
    currentEnd: string;
    prevStart: string;
    prevEnd: string;
    priorStart: string;
    priorEnd: string;
  };
  projectId: string;
  projectName: string;
  siteName: string;
  submittedByAuditor: string;
  auditorEmail: string;
  submittedAt: string;
  auditNotes: string;
  status: 'SUBMITTED_TO_MANAGEMENT' | 'MANAGEMENT_RETURNED' | 'MANAGEMENT_APPROVED' | 'PUBLISHED';
  pdfGenerationStatus: 'READY' | 'GENERATING' | 'FAILED';
  pdfFileName: string;
  pdfBase64?: string;
  totalIndicators: number;
  verifiedIndicators: number;
  principlesCovered: number;
  datasetSnapshot: {
    dossier: ESGReportingDossier;
    indicators: ESGSubmissionRowItem[];
    principlesSummary: {
      principleNumber: number;
      principleCode: string;
      title: string;
      category: string;
      indicatorsCount: number;
      summaryText: string;
      keyMetrics: string;
      reportingStatus: string;
      auditStatus: string;
    }[];
  };
  managementAction?: {
    action: 'RETURNED' | 'APPROVED';
    actorName: string;
    actorEmail: string;
    timestamp: string;
    reason?: string;
    remarks?: string;
  };
  history?: {
    action: string;
    actorName: string;
    timestamp: string;
    notes?: string;
    version: number;
  }[];
  previousVersions?: {
    version: number;
    submittedAt: string;
    auditor: string;
    status: string;
    pdfFileName: string;
    returnReason?: string;
  }[];
}

interface DatabaseSchema {
  dossiers: ESGReportingDossier[];
  corrections: CorrectionRequestItem[];
  auditLogs: ReviewAuditEntry[];
  companyProfile: CompanyProfile;
  finalReports: FinalEsgReport[];
}

// ---------------- INITIAL SEED DATA ----------------
function generateMasterSeedIndicators(): ESGSubmissionRowItem[] {
  const master = [
    // P1
    { id: 'P1-IND-01', name: 'Anti-corruption and anti-bribery incidents reported', pId: 1, pTitle: 'Ethics & Transparency', cat: 'Governance', unit: 'Incidents', val: '0', prev: '0', core: true, ev: 'Vigilance Register March.pdf' },
    { id: 'P1-IND-02', name: 'Whistleblower complaints received and resolved', pId: 1, pTitle: 'Ethics & Transparency', cat: 'Governance', unit: 'Complaints', val: '1', prev: '2', core: true, ev: 'Ethics Committee Log.pdf' },
    { id: 'P1-IND-03', name: 'Ethics policy trainings conducted for contractors', pId: 1, pTitle: 'Ethics & Transparency', cat: 'Governance', unit: 'Persons', val: '145', prev: '120', core: false, ev: 'Training Attendance Sheet.pdf' },
    // P2
    { id: 'P2-IND-01', name: 'Recycled raw material input percentage in pavement mix', pId: 2, pTitle: 'Sustainable Products & Services', cat: 'Environmental', unit: '%', val: '18.5', prev: '15.0', core: true, ev: 'Batch Mix Plant QA Slip.pdf' },
    { id: 'P2-IND-02', name: 'Fly ash utilized in structural embankment works', pId: 2, pTitle: 'Sustainable Products & Services', cat: 'Environmental', unit: 'Metric Tonnes', val: '2450', prev: '2100', core: true, ev: 'Thermal Plant Flyash Invoice.pdf' },
    { id: 'P2-IND-03', name: 'High-efficiency Tier-4 construction equipment deployed', pId: 2, pTitle: 'Sustainable Products & Services', cat: 'Environmental', unit: 'Units', val: '32', prev: '28', core: false, ev: 'Fleet Maintenance Record.pdf' },
    // P3
    { id: 'P3-IND-01', name: 'Total permanent and contractual worker headcount', pId: 3, pTitle: 'Employee Well‑being', cat: 'Social', unit: 'Headcount', val: '412', prev: '395', core: true, ev: 'Biometric Attendance Report.pdf' },
    { id: 'P3-IND-02', name: 'Permanent female workforce representation percentage', pId: 3, pTitle: 'Employee Well‑being', cat: 'Social', unit: '%', val: '14.2', prev: '13.8', core: true, ev: 'HR Payroll Master.pdf' },
    { id: 'P3-IND-03', name: 'Lost Time Injury Frequency Rate (LTIFR)', pId: 3, pTitle: 'Employee Well‑being', cat: 'Social', unit: 'Rate / 1M hrs', val: '0.00', prev: '0.00', core: true, ev: 'HSE Monthly Safety Register.pdf' },
    { id: 'P3-IND-04', name: 'Mandatory HSE induction and toolbox talks completed', pId: 3, pTitle: 'Employee Well‑being', cat: 'Social', unit: 'Toolbox Talks', val: '58', prev: '52', core: false, ev: 'Daily Toolbox Logbook.pdf' },
    // P4
    { id: 'P4-IND-01', name: 'Local community stakeholder consultation meetings held', pId: 4, pTitle: 'Stakeholder Engagement', cat: 'Stakeholder', unit: 'Meetings', val: '4', prev: '3', core: true, ev: 'Panchayat Consultation Minutes.pdf' },
    { id: 'P4-IND-02', name: 'Grievances received from project-affected persons', pId: 4, pTitle: 'Stakeholder Engagement', cat: 'Stakeholder', unit: 'Grievances', val: '2', prev: '5', core: true, ev: 'PAP Grievance Cell Log.pdf' },
    // P5
    { id: 'P5-IND-01', name: 'Child labor and forced labor prevention audits conducted', pId: 5, pTitle: 'Human Rights', cat: 'Social', unit: 'Camp Audits', val: '12', prev: '10', core: true, ev: 'Labor Camp Inspection Report.pdf' },
    { id: 'P5-IND-02', name: 'Minimum wage compliance certification across contractors', pId: 5, pTitle: 'Human Rights', cat: 'Social', unit: '%', val: '100.0', prev: '100.0', core: true, ev: 'Contractor Wage Slips Audit.pdf' },
    // P6
    { id: 'P6-IND-01', name: 'Scope 1 Diesel consumption in heavy earthmoving fleet', pId: 6, pTitle: 'Environment & Climate Care', cat: 'Environmental', unit: 'Kilolitres', val: '84.6', prev: '81.2', core: true, ev: 'IOCL Fuel Dispenser Receipt.pdf' },
    { id: 'P6-IND-02', name: 'Scope 2 Grid electricity consumption at batching camp', pId: 6, pTitle: 'Environment & Climate Care', cat: 'Environmental', unit: 'kWh', val: '42500', prev: '41800', core: true, ev: 'State Electricity Board Bill.pdf' },
    { id: 'P6-IND-03', name: 'Dust suppression water sprayed on haul roads', pId: 6, pTitle: 'Environment & Climate Care', cat: 'Environmental', unit: 'Kilolitres', val: '1240', prev: '1150', core: false, ev: 'Water Tanker Trip Sheets.pdf' },
    { id: 'P6-IND-04', name: 'Hazardous waste (used lube oil) disposed via authorized recycler', pId: 6, pTitle: 'Environment & Climate Care', cat: 'Environmental', unit: 'Litres', val: '650', prev: '500', core: true, ev: 'CPCB Recycler Manifest Form 10.pdf' },
    // P7
    { id: 'P7-IND-01', name: 'Industry association memberships and climate advocacy affiliations', pId: 7, pTitle: 'Responsible Public Policy', cat: 'Governance', unit: 'Affiliations', val: '3', prev: '3', core: true, ev: 'NHAI & CII Memberships.pdf' },
    // P8
    { id: 'P8-IND-01', name: 'Direct CSR expenditure disbursed in project periphery villages', pId: 8, pTitle: 'Inclusive Growth & CSR', cat: 'Economic', unit: 'INR Lakhs', val: '18.75', prev: '14.50', core: true, ev: 'Bank Disbursal Statement.pdf' },
    { id: 'P8-IND-02', name: 'Local workforce hired from project-affected revenue villages', pId: 8, pTitle: 'Inclusive Growth & CSR', cat: 'Social', unit: 'Persons', val: '184', prev: '175', core: true, ev: 'Local Employment Register.pdf' },
    // P9
    { id: 'P9-IND-01', name: 'Independent third-party concrete core quality test approvals', pId: 9, pTitle: 'Customer Responsibility & Quality', cat: 'Quality', unit: '% Passed', val: '99.4', prev: '99.1', core: true, ev: 'NABL Lab Test Certificate.pdf' },
    { id: 'P9-IND-02', name: 'Customer / NHAI quality non-conformance reports (NCRs) closed', pId: 9, pTitle: 'Customer Responsibility & Quality', cat: 'Quality', unit: 'NCRs Closed', val: '3', prev: '2', core: true, ev: 'NHAI Quality Audit Compliance.pdf' },
  ];

  return master.map((item) => ({
    id: item.id,
    name: item.name,
    principleId: item.pId,
    principleTitle: item.pTitle,
    category: item.cat,
    description: `BRSR Disclosure for ${item.name}`,
    unit: item.unit,
    valueType: 'numeric',
    required: true,
    isBrsrCore: item.core,
    previousMonthValue: item.prev,
    currentValue: item.val,
    remarks: 'Field validated and corroborated with site measurement registers.',
    evidenceFiles: [
      {
        id: `ev_${item.id.toLowerCase()}`,
        name: item.ev,
        type: 'application/pdf',
        size: 1450000,
        uploadedAt: '2026-03-28 14:30',
        url: `/evidence/${item.ev}`,
      },
    ],
    reviewStatus: 'SUBMITTED',
    version: 1,
    lastUpdated: '2026-03-28 14:35',
  }));
}

function createInitialSeedData(): DatabaseSchema {
  const indicatorsExp = generateMasterSeedIndicators();
  const rowsMapExp: Record<string, ESGSubmissionRowItem> = {};

  indicatorsExp.forEach((row, idx) => {
    // Seed some initial statuses for realistic review queue testing
    if (idx < 5) {
      // 5 verified rows
      row.reviewStatus = 'VERIFIED';
      row.reviewerDecision = {
        rowId: row.id,
        status: 'VERIFIED',
        reviewerName: 'Aarav Patel (Review Lead)',
        reviewerId: 'u_rev',
        reviewTimestamp: '2026-03-29 11:20:00',
        version: 1,
        history: [
          {
            action: 'SUBMITTED',
            actorName: 'Suresh Kumar (Site Contributor)',
            timestamp: '2026-03-28 14:35:00',
            value: row.currentValue,
            version: 1,
          },
          {
            action: 'VERIFIED',
            actorName: 'Aarav Patel (Review Lead)',
            timestamp: '2026-03-29 11:20:00',
            value: row.currentValue,
            version: 1,
            comment: 'Verified against primary audit evidence.',
          },
        ],
      };
    } else if (idx === 6) {
      // 1 correction required row
      row.reviewStatus = 'CORRECTION_REQUIRED';
      row.reviewerDecision = {
        rowId: row.id,
        status: 'CORRECTION_REQUIRED',
        reviewerName: 'Aarav Patel (Review Lead)',
        reviewerId: 'u_rev',
        reviewTimestamp: '2026-03-29 11:45:00',
        correctionReasonCategory: 'Supporting evidence does not match',
        correctionReason: 'Biometric contractor attendance log does not match the total headcount figure of 412. Please upload reconciled muster roll.',
        suggestedCorrection: 'Reconcile headcount against Form B register.',
        supportingComment: 'Check contractor sub-camp B headcount.',
        version: 1,
        history: [
          {
            action: 'SUBMITTED',
            actorName: 'Suresh Kumar (Site Contributor)',
            timestamp: '2026-03-28 14:35:00',
            value: row.currentValue,
            version: 1,
          },
          {
            action: 'CORRECTION_REQUIRED',
            actorName: 'Aarav Patel (Review Lead)',
            timestamp: '2026-03-29 11:45:00',
            value: row.currentValue,
            version: 1,
            comment: 'Flagged for reconciliation against contractor muster roll.',
          },
        ],
      };
    } else {
      row.reviewStatus = 'SUBMITTED';
    }
    rowsMapExp[row.id] = row;
  });

  const dossierExp: ESGReportingDossier = {
    dossierId: 'dossier_exp_2026_03',
    contextKey: 'meil_exp_2026_03',
    projectId: 'proj_exp',
    projectName: 'Expressway Project Phase-II (Raipur)',
    projectCode: 'MEIL-EXP-RPR-02',
    siteId: 'site_exp_02',
    siteName: 'Site 02 (Km 42 - Km 88)',
    financialYear: 'FY 2026-27',
    month: 3,
    monthName: 'March 2027',
    status: 'Partially Reviewed',
    submittingUser: 'Suresh Kumar (Site Contributor)',
    submittedAt: '2026-03-28 14:35:00',
    lastReviewedAt: '2026-03-29 11:45:00',
    reviewerName: 'Aarav Patel (Review Lead)',
    totalRows: indicatorsExp.length,
    verifiedRows: 5,
    correctionRequiredRows: 1,
    pendingRows: indicatorsExp.length - 6,
    rows: rowsMapExp,
  };

  // Dossier 2: Kaleshwaram Lift Irrigation Site 4 (Freshly submitted, awaiting review)
  const indicatorsKlis = generateMasterSeedIndicators();
  const rowsMapKlis: Record<string, ESGSubmissionRowItem> = {};
  indicatorsKlis.forEach((r) => {
    r.reviewStatus = 'SUBMITTED';
    rowsMapKlis[r.id] = r;
  });

  const dossierKlis: ESGReportingDossier = {
    dossierId: 'dossier_klis_2026_03',
    contextKey: 'meil_klis_2026_03',
    projectId: 'proj_klis',
    projectName: 'Kaleshwaram Lift Irrigation Site 4',
    projectCode: 'MEIL-IRR-KLIS-04',
    siteId: 'site_klis_04',
    siteName: 'Pumping Station Complex 04',
    financialYear: 'FY 2026-27',
    month: 3,
    monthName: 'March 2027',
    status: 'Submitted',
    submittingUser: 'K. Venkatesh (Operations Lead)',
    submittedAt: '2026-03-29 09:15:00',
    totalRows: indicatorsKlis.length,
    verifiedRows: 0,
    correctionRequiredRows: 0,
    pendingRows: indicatorsKlis.length,
    rows: rowsMapKlis,
  };

  const initialCorrections: CorrectionRequestItem[] = [
    {
      id: 'corr_seed_01',
      assignmentId: 'dossier_exp_2026_03',
      rowId: 'P3-IND-01',
      indicatorCode: 'P3-IND-01',
      indicatorName: 'Total permanent and contractual worker headcount',
      projectName: 'Expressway Project Phase-II (Raipur)',
      siteName: 'Site 02 (Km 42 - Km 88)',
      financialYear: 'FY 2026-27',
      monthName: 'March 2027',
      previousValue: '412',
      unit: 'Headcount',
      problem: '[Supporting evidence does not match] Biometric contractor attendance log mismatch',
      reasonCategory: 'Supporting evidence does not match',
      reason: 'Biometric contractor attendance log does not match the total headcount figure of 412. Please upload reconciled muster roll.',
      requiredCorrection: 'Reconcile headcount against Form B register and upload contractor endorsement.',
      reviewerComment: 'Check contractor sub-camp B headcount.',
      requestedAt: '2026-03-29 11:45:00',
      requestedBy: 'Aarav Patel (Review Lead)',
      status: 'PENDING_CONTRIBUTOR',
      deadline: '2026-04-05',
    },
  ];

  const initialAuditLogs: ReviewAuditEntry[] = [
    {
      id: 'aud_seed_01',
      assignmentId: 'dossier_exp_2026_03',
      indicatorCode: 'P1-IND-01',
      indicatorName: 'Anti-corruption and anti-bribery incidents reported',
      submittedBy: 'Suresh Kumar (Site Contributor)',
      reviewedBy: 'Aarav Patel (Review Lead)',
      reviewDate: '2026-03-29 11:20:00',
      decision: 'APPROVE',
      previousValue: '0',
      newValue: '0',
      unit: 'Incidents',
      reason: 'Row confirmed accurate and substantiated with statutory vigilance records.',
      evidenceSummary: '1 file attached',
      comments: 'Statutory compliance confirmed.',
      scopeProject: 'Expressway Project Phase-II (Raipur) (Site 02)',
      reportingPeriod: 'March 2027 FY 2026-27',
      version: 1,
    },
  ];

export function getDefaultCompanyProfile(): CompanyProfile {
  return {
    cin: 'U45202TG2006PLC050271',
    name: 'Megha Engineering & Infrastructures Limited (MEIL)',
    incorporationYear: '2006',
    incorporationDate: '07 June 2006',
    registeredOffice: 'S-2, Technocrat Industrial Estate, Balanagar, Hyderabad – 500037, Telangana, India',
    corporateOffice: 'S-2, Technocrat Industrial Estate, Balanagar, Hyderabad – 500037, Telangana, India',
    email: 'info@meil.in',
    telephone: '+91-40-44336700',
    website: 'https://www.meil.in/',
    stockExchanges: 'Not Applicable — Unlisted Public Company',
    paidUpCapital: '₹156.01 Crore',
    brsrContactPerson: 'N. Chandra Kala (Company Secretary & Compliance Officer)',
    contactNumber: '+91-40-44336700',
    contactEmail: 'info@meil.in',
    reportingBoundary: 'Standalone Operations (MEIL Infrastructure Projects & Sites)',
    assuranceProvider: 'Independent BRSR Assurance Team / Sanjay Deshmukh (Lead BRSR Assurer)',
    assuranceType: 'Limited Statutory Assurance under SEBI BRSR Core Mandate',
    verificationStatuses: {
      cin: 'Verified',
      name: 'Verified',
      incorporationYear: 'Verified',
      incorporationDate: 'Verified',
      registeredOffice: 'Verified',
      corporateOffice: 'Verified',
      email: 'Verified',
      telephone: 'Verified',
      website: 'Verified',
      stockExchanges: 'Verified',
      paidUpCapital: 'Verified',
      brsrContactPerson: 'Verified',
      contactNumber: 'Verified',
      contactEmail: 'Verified',
      reportingBoundary: 'Verified',
      assuranceProvider: 'Verified',
      assuranceType: 'Verified',
    },
    lastUpdated: '2026-03-30 10:00:00',
    updatedBy: 'ESG Governance Administrator',
  };
}

export function generatePrinciplesSummary(indicators: ESGSubmissionRowItem[]) {
  const principles = [
    {
      num: 1,
      code: 'P1',
      title: 'Ethics, Transparency and Accountable Conduct',
      category: 'Governance',
      summaryText: 'Corporate vigilance register, anti-corruption policies, whistleblower complaints resolution, and contractor personnel ethics training.',
      keyMetrics: '0 Incidents, 1 Complaint Resolved, 145 Persons Trained',
    },
    {
      num: 2,
      code: 'P2',
      title: 'Sustainable and Safe Goods and Services',
      category: 'Environmental',
      summaryText: 'Recycled raw material integration in pavement mix, fly ash utilization in embankments, and Tier-4 fuel-efficient heavy equipment deployment.',
      keyMetrics: '18.5% Recycled Mix, 1,800 MT Fly Ash Utilized, 32 Tier-4 Units',
    },
    {
      num: 3,
      code: 'P3',
      title: 'Employee Well-being',
      category: 'Social',
      summaryText: 'Workforce headcount registers, permanent female representation, zero fatal accidents (0.00 LTIFR), and mandatory toolbox safety talks.',
      keyMetrics: '412 Total Headcount, 14.2% Female, 0.00 LTIFR, 58 Toolbox Talks',
    },
    {
      num: 4,
      code: 'P4',
      title: 'Responsiveness to Stakeholders',
      category: 'Social / Governance',
      summaryText: 'Panchayat & local community consultation meetings, and Project-Affected Persons (PAP) grievance redressal cell operations.',
      keyMetrics: '4 Community Meetings, 2 Grievances Resolved',
    },
    {
      num: 5,
      code: 'P5',
      title: 'Human Rights',
      category: 'Social',
      summaryText: 'Quarterly labor camp audits for prevention of child/forced labor, and contractor wage compliance certification across project sites.',
      keyMetrics: '12 Camp Audits, 100.0% Minimum Wage Certified',
    },
    {
      num: 6,
      code: 'P6',
      title: 'Environmental Protection',
      category: 'Environmental',
      summaryText: 'Scope 1 diesel in earthmoving equipment, Scope 2 grid electricity, dust suppression water spraying, and hazardous lube oil recycling.',
      keyMetrics: '84.6 kL Diesel, 42,500 kWh Power, 1,240 kL Water, 650 L Oil Recycled',
    },
    {
      num: 7,
      code: 'P7',
      title: 'Responsible Public Policy Advocacy',
      category: 'Governance',
      summaryText: 'Active memberships in national industry associations (NHAI, CII, FICCI) contributing to infrastructure sustainability frameworks.',
      keyMetrics: '3 Industry Association Memberships (NHAI, CII)',
    },
    {
      num: 8,
      code: 'P8',
      title: 'Inclusive Growth and Equitable Development',
      category: 'Social / Economic',
      summaryText: 'Direct CSR expenditure disbursed in project periphery villages and local workforce hiring from project-affected revenue villages.',
      keyMetrics: '₹18.75 Lakhs CSR Disbursed, 184 Local Persons Employed',
    },
    {
      num: 9,
      code: 'P9',
      title: 'Customer Value and Responsibility',
      category: 'Quality / Operations',
      summaryText: 'Independent third-party NABL certified concrete core testing, rigorous highway quality assurance, and expedited closure of client NCRs.',
      keyMetrics: '99.4% Core Quality Pass Rate, 3 NCRs Closed',
    },
  ];

  return principles.map((p) => {
    const pInds = indicators.filter((i) => i.principleId === p.num);
    return {
      principleNumber: p.num,
      principleCode: p.code,
      title: p.title,
      category: p.category,
      indicatorsCount: pInds.length,
      summaryText: p.summaryText,
      keyMetrics: p.keyMetrics,
      reportingStatus: 'Reported (100% Core)',
      auditStatus: 'Verified & Assured',
    };
  });
}

  const initialCompanyProfile = getDefaultCompanyProfile();
  const seedIndicatorsList = Object.values(rowsMapExp);
  const principlesSummary = generatePrinciplesSummary(seedIndicatorsList);

  const initialReport: FinalEsgReport = {
    reportId: 'MEIL-BRSR-2026-v1',
    version: 1,
    financialYear: 'FY 2026-27',
    reportingPeriod: {
      currentStart: '01-04-2025',
      currentEnd: '31-03-2026',
      prevStart: '01-04-2024',
      prevEnd: '31-03-2025',
      priorStart: '01-04-2023',
      priorEnd: '31-03-2024',
    },
    projectId: 'proj_exp_02',
    projectName: 'Expressway Project Phase-II (Raipur)',
    siteName: 'Site 02 (Km 42 - Km 88)',
    submittedByAuditor: 'Sanjay Deshmukh (Lead BRSR Assurer)',
    auditorEmail: 'auditor@demo.com',
    submittedAt: '2026-03-30 11:30:00',
    auditNotes: 'Statutory sample testing & methodology verified under SEBI BRSR Core mandate. Approved for Executive Board review.',
    status: 'SUBMITTED_TO_MANAGEMENT',
    pdfGenerationStatus: 'READY',
    pdfFileName: 'MEIL_BRSR_FY2026-27_v1.pdf',
    totalIndicators: seedIndicatorsList.length,
    verifiedIndicators: seedIndicatorsList.filter((r) => r.reviewStatus === 'VERIFIED').length,
    principlesCovered: 9,
    datasetSnapshot: {
      dossier: dossierExp,
      indicators: seedIndicatorsList,
      principlesSummary,
    },
    history: [
      {
        action: 'AUDITOR_SUBMISSION',
        actorName: 'Sanjay Deshmukh (Lead BRSR Assurer)',
        timestamp: '2026-03-30 11:30:00',
        notes: 'Final statutory BRSR report submitted to Management Portal.',
        version: 1,
      },
    ],
  };

  try {
    const pdfBuf = generateBrsrPdf(initialReport, initialCompanyProfile);
    initialReport.pdfBase64 = pdfBuf.toString('base64');
  } catch (err) {
    console.warn('[ESGDatabase] Error generating initial seed PDF:', err);
  }

  return {
    dossiers: [dossierExp, dossierKlis],
    corrections: initialCorrections,
    auditLogs: initialAuditLogs,
    companyProfile: initialCompanyProfile,
    finalReports: [initialReport],
  };
}

// ---------------- DATABASE CLASS ----------------
class ESGDatabase {
  private data: DatabaseSchema;
  private sseClients: Set<(event: string, payload: any) => void> = new Set();

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed?.dossiers && Array.isArray(parsed.dossiers)) {
          if (!parsed.companyProfile) {
            parsed.companyProfile = getDefaultCompanyProfile();
          }
          if (!parsed.finalReports || !Array.isArray(parsed.finalReports) || parsed.finalReports.length === 0) {
            const fresh = createInitialSeedData();
            parsed.finalReports = fresh.finalReports;
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[ESGDatabase] Failed to read disk DB, initializing fresh:', err);
    }

    const fresh = createInitialSeedData();
    this.saveToDisk(fresh);
    return fresh;
  }

  private saveToDisk(customData?: DatabaseSchema) {
    try {
      const target = customData || this.data;
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(target, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ESGDatabase] Error saving to disk:', err);
    }
  }

  // --- SSE REAL-TIME BROADCASTER ---
  public subscribeSSE(listener: (event: string, payload: any) => void): () => void {
    this.sseClients.add(listener);
    return () => {
      this.sseClients.delete(listener);
    };
  }

  public broadcast(event: string, payload: any) {
    for (const send of this.sseClients) {
      try {
        send(event, payload);
      } catch {
        // ignore closed socket
      }
    }
  }

  // --- QUERY METHODS ---
  public getDossiers(filters?: { projectId?: string; status?: string; role?: string }): ESGReportingDossier[] {
    let list = [...this.data.dossiers];
    if (filters?.projectId && filters.projectId !== 'ALL') {
      list = list.filter((d) => d.projectId === filters.projectId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((d) => d.status === filters.status);
    }
    return list;
  }

  public getDossierById(dossierId: string): ESGReportingDossier | null {
    return this.data.dossiers.find((d) => d.dossierId === dossierId || d.projectId === dossierId) || null;
  }

  public getCorrections(filters?: { status?: string; projectId?: string }): CorrectionRequestItem[] {
    let list = [...this.data.corrections];
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((c) => c.status.toLowerCase() === filters.status?.toLowerCase());
    }
    return list;
  }

  public getAuditLogs(): ReviewAuditEntry[] {
    return [...this.data.auditLogs];
  }

  // --- AUDITOR QUERY (ENFORCES ZERO UNVERIFIED RECORDS) ---
  public getAuditorVerifiedRecords(filters?: { projectId?: string; financialYear?: string }) {
    const verifiedList: {
      dossierId: string;
      projectName: string;
      projectCode: string;
      siteName: string;
      financialYear: string;
      monthName: string;
      row: ESGSubmissionRowItem;
      verifiedAt: string;
      verifiedBy: string;
      version: number;
    }[] = [];

    this.data.dossiers.forEach((d) => {
      if (filters?.projectId && filters.projectId !== 'ALL' && d.projectId !== filters.projectId) return;
      if (filters?.financialYear && filters.financialYear !== 'ALL' && d.financialYear !== filters.financialYear) return;

      Object.values(d.rows || {}).forEach((r) => {
        // STRICT AUDITOR SECURITY FILTER:
        if (r.reviewStatus === 'VERIFIED') {
          verifiedList.push({
            dossierId: d.dossierId,
            projectName: d.projectName,
            projectCode: d.projectCode,
            siteName: d.siteName,
            financialYear: d.financialYear,
            monthName: d.monthName,
            row: r,
            verifiedAt: r.reviewerDecision?.reviewTimestamp || r.lastUpdated,
            verifiedBy: r.reviewerDecision?.reviewerName || 'Aarav Patel (Review Lead)',
            version: r.version || 1,
          });
        }
      });
    });

    return verifiedList;
  }

  // --- MUTATIONS WITH CONCURRENCY & VALIDATION ---

  /**
   * 1. Contributor submits new monthly reporting dossier
   */
  public createOrUpdateDossier(dossierData: Omit<ESGReportingDossier, 'dossierId' | 'status' | 'verifiedRows' | 'correctionRequiredRows' | 'pendingRows'> & { dossierId?: string }): ESGReportingDossier {
    const existingIndex = this.data.dossiers.findIndex(
      (d) => (dossierData.dossierId && d.dossierId === dossierData.dossierId) || d.contextKey === dossierData.contextKey
    );

    const nowTimestamp = new Date().toLocaleString();
    const rowsList = Object.values(dossierData.rows || {});
    const totalRows = rowsList.length;

    // Check if any rows already verified
    const verifiedCount = rowsList.filter((r) => r.reviewStatus === 'VERIFIED').length;
    const correctionCount = rowsList.filter((r) => r.reviewStatus === 'CORRECTION_REQUIRED').length;
    const pendingCount = totalRows - verifiedCount - correctionCount;

    let dossierStatus: ESGReportingDossier['status'] = 'Submitted';
    if (correctionCount > 0) dossierStatus = 'Changes Requested';
    else if (verifiedCount === totalRows && totalRows > 0) dossierStatus = 'Fully Reviewed';
    else if (verifiedCount > 0) dossierStatus = 'Partially Reviewed';

    const dossierId = dossierData.dossierId || `dossier_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const fullDossier: ESGReportingDossier = {
      ...dossierData,
      dossierId,
      status: dossierStatus,
      totalRows,
      verifiedRows: verifiedCount,
      correctionRequiredRows: correctionCount,
      pendingRows: pendingCount,
      submittedAt: dossierData.submittedAt || nowTimestamp,
    };

    if (existingIndex >= 0) {
      this.data.dossiers[existingIndex] = fullDossier;
    } else {
      this.data.dossiers.unshift(fullDossier);
    }

    this.saveToDisk();

    // Broadcast SSE real-time event to all connected Reviewers
    this.broadcast('submission_created', {
      dossierId,
      projectName: fullDossier.projectName,
      projectCode: fullDossier.projectCode,
      submittingUser: fullDossier.submittingUser,
      totalRows,
      timestamp: nowTimestamp,
      dossier: fullDossier,
    });

    return fullDossier;
  }

  /**
   * 2. Reviewer marks row as CORRECT
   */
  public markRowCorrect(
    dossierId: string,
    rowId: string,
    options: {
      reviewerName?: string;
      expectedVersion?: number;
    }
  ): { success: boolean; message: string; dossier?: ESGReportingDossier; row?: ESGSubmissionRowItem } {
    const dossier = this.data.dossiers.find((d) => d.dossierId === dossierId);
    if (!dossier) {
      return { success: false, message: `Dossier ${dossierId} not found.` };
    }

    const targetRow = dossier.rows[rowId];
    if (!targetRow) {
      return { success: false, message: `Row ${rowId} not found in submission.` };
    }

    // Optimistic Concurrency Control
    if (options.expectedVersion !== undefined && targetRow.version !== options.expectedVersion) {
      return {
        success: false,
        message: `Concurrency conflict: Row ${rowId} was modified (current revision is v${targetRow.version}, expected v${options.expectedVersion}). Please review the latest revision.`,
      };
    }

    const reviewerName = options.reviewerName || 'Aarav Patel (Review Lead)';
    const nowTimestamp = new Date().toLocaleString();
    const currentVersion = targetRow.version || 1;
    const history = targetRow.reviewerDecision?.history || [];

    const updatedDecision: RowReviewDecision = {
      rowId,
      status: 'VERIFIED',
      reviewerName,
      reviewerId: 'u_rev',
      reviewTimestamp: nowTimestamp,
      version: currentVersion,
      history: [
        ...history,
        {
          action: 'VERIFIED',
          actorName: reviewerName,
          timestamp: nowTimestamp,
          value: targetRow.currentValue,
          version: currentVersion,
          comment: 'Confirmed accurate and substantiated by reviewer.',
        },
      ],
    };

    const updatedRow: ESGSubmissionRowItem = {
      ...targetRow,
      reviewStatus: 'VERIFIED',
      reviewerDecision: updatedDecision,
      lastUpdated: nowTimestamp,
    };

    dossier.rows[rowId] = updatedRow;

    // Recalculate dossier counters
    const rowList = Object.values(dossier.rows);
    dossier.verifiedRows = rowList.filter((r) => r.reviewStatus === 'VERIFIED').length;
    dossier.correctionRequiredRows = rowList.filter((r) => r.reviewStatus === 'CORRECTION_REQUIRED').length;
    dossier.pendingRows = rowList.filter(
      (r) => r.reviewStatus === 'SUBMITTED' || r.reviewStatus === 'UNDER_REVIEW' || r.reviewStatus === 'RESUBMITTED'
    ).length;

    if (dossier.correctionRequiredRows > 0) {
      dossier.status = 'Changes Requested';
    } else if (dossier.verifiedRows === dossier.totalRows && dossier.totalRows > 0) {
      dossier.status = 'Fully Reviewed';
    } else if (dossier.verifiedRows > 0) {
      dossier.status = 'Partially Reviewed';
    }
    dossier.lastReviewedAt = nowTimestamp;
    dossier.reviewerName = reviewerName;

    // Mark any corresponding correction as RESOLVED
    const corrItem = this.data.corrections.find((c) => c.assignmentId === dossierId && c.rowId === rowId);
    if (corrItem) {
      corrItem.status = 'RESOLVED';
    }

    // Append to audit trail
    const auditEntry: ReviewAuditEntry = {
      id: `aud_${Date.now()}_${rowId}`,
      assignmentId: dossierId,
      indicatorCode: targetRow.id,
      indicatorName: targetRow.name,
      submittedBy: dossier.submittingUser,
      reviewedBy: reviewerName,
      reviewDate: nowTimestamp,
      decision: 'APPROVE',
      previousValue: targetRow.previousMonthValue,
      newValue: targetRow.currentValue,
      unit: targetRow.unit,
      reason: 'Row confirmed accurate and substantiated with statutory evidence.',
      evidenceSummary: targetRow.evidenceFiles.length ? `${targetRow.evidenceFiles.length} file(s) attached` : 'Self-declared',
      comments: `Verified row ${targetRow.id} (${targetRow.name})`,
      scopeProject: `${dossier.projectName} (${dossier.siteName})`,
      reportingPeriod: `${dossier.monthName} ${dossier.financialYear}`,
      version: currentVersion,
    };
    this.data.auditLogs.unshift(auditEntry);

    this.saveToDisk();

    // Broadcast real-time SSE event to Reviewers and Auditors!
    this.broadcast('row_verified', {
      dossierId,
      rowId,
      row: updatedRow,
      dossierStatus: dossier.status,
      verifiedRows: dossier.verifiedRows,
      pendingRows: dossier.pendingRows,
      reviewerName,
      timestamp: nowTimestamp,
    });

    return {
      success: true,
      message: `✓ Row "${targetRow.name}" verified and published to authorized Auditor view!`,
      dossier,
      row: updatedRow,
    };
  }

  /**
   * 3. Reviewer marks row as INCORRECT
   */
  public markRowIncorrect(
    dossierId: string,
    rowId: string,
    details: {
      category: string;
      reason: string;
      suggestedCorrection?: string;
      supportingComment?: string;
      reviewerName?: string;
      expectedVersion?: number;
    }
  ): { success: boolean; message: string; dossier?: ESGReportingDossier; row?: ESGSubmissionRowItem; correction?: CorrectionRequestItem } {
    if (!details.reason || !details.reason.trim()) {
      return { success: false, message: 'Rejection reason is mandatory.' };
    }

    const dossier = this.data.dossiers.find((d) => d.dossierId === dossierId);
    if (!dossier) {
      return { success: false, message: `Dossier ${dossierId} not found.` };
    }

    const targetRow = dossier.rows[rowId];
    if (!targetRow) {
      return { success: false, message: `Row ${rowId} not found in submission.` };
    }

    // Optimistic Concurrency Control
    if (details.expectedVersion !== undefined && targetRow.version !== details.expectedVersion) {
      return {
        success: false,
        message: `Concurrency conflict: Row ${rowId} was modified (current revision is v${targetRow.version}, expected v${details.expectedVersion}).`,
      };
    }

    const reviewerName = details.reviewerName || 'Aarav Patel (Review Lead)';
    const nowTimestamp = new Date().toLocaleString();
    const currentVersion = targetRow.version || 1;
    const history = targetRow.reviewerDecision?.history || [];

    const updatedDecision: RowReviewDecision = {
      rowId,
      status: 'CORRECTION_REQUIRED',
      reviewerName,
      reviewerId: 'u_rev',
      reviewTimestamp: nowTimestamp,
      correctionReasonCategory: details.category || 'Incorrect value',
      correctionReason: details.reason,
      suggestedCorrection: details.suggestedCorrection,
      supportingComment: details.supportingComment,
      version: currentVersion,
      history: [
        ...history,
        {
          action: 'CORRECTION_REQUIRED',
          actorName: reviewerName,
          timestamp: nowTimestamp,
          value: targetRow.currentValue,
          version: currentVersion,
          comment: `[${details.category}] ${details.reason}`,
        },
      ],
    };

    const updatedRow: ESGSubmissionRowItem = {
      ...targetRow,
      reviewStatus: 'CORRECTION_REQUIRED',
      reviewerDecision: updatedDecision,
      lastUpdated: nowTimestamp,
    };

    dossier.rows[rowId] = updatedRow;

    // Recalculate dossier counters
    const rowList = Object.values(dossier.rows);
    dossier.verifiedRows = rowList.filter((r) => r.reviewStatus === 'VERIFIED').length;
    dossier.correctionRequiredRows = rowList.filter((r) => r.reviewStatus === 'CORRECTION_REQUIRED').length;
    dossier.pendingRows = rowList.filter(
      (r) => r.reviewStatus === 'SUBMITTED' || r.reviewStatus === 'UNDER_REVIEW' || r.reviewStatus === 'RESUBMITTED'
    ).length;
    dossier.status = 'Changes Requested';
    dossier.lastReviewedAt = nowTimestamp;
    dossier.reviewerName = reviewerName;

    // Create or update correction item in Contributor Correction Center
    const corrId = `corr_${Date.now()}_${rowId}`;
    const newCorrItem: CorrectionRequestItem = {
      id: corrId,
      assignmentId: dossierId,
      rowId,
      indicatorCode: targetRow.id,
      indicatorName: targetRow.name,
      projectName: dossier.projectName,
      siteName: dossier.siteName,
      financialYear: dossier.financialYear,
      monthName: dossier.monthName,
      previousValue: targetRow.currentValue,
      unit: targetRow.unit,
      problem: `[${details.category}] ${details.reason}`,
      reasonCategory: details.category || 'Incorrect value',
      reason: details.reason,
      requiredCorrection: details.suggestedCorrection || 'Provide corrected monthly value and supporting audit documents.',
      reviewerComment: details.supportingComment || details.reason,
      requestedAt: nowTimestamp,
      requestedBy: reviewerName,
      status: 'PENDING_CONTRIBUTOR',
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    };

    // Update or insert into corrections array
    const existingCorrIndex = this.data.corrections.findIndex((c) => c.assignmentId === dossierId && c.rowId === rowId);
    if (existingCorrIndex >= 0) {
      this.data.corrections[existingCorrIndex] = newCorrItem;
    } else {
      this.data.corrections.unshift(newCorrItem);
    }

    // Append to audit trail
    const auditEntry: ReviewAuditEntry = {
      id: `aud_${Date.now()}_${rowId}`,
      assignmentId: dossierId,
      indicatorCode: targetRow.id,
      indicatorName: targetRow.name,
      submittedBy: dossier.submittingUser,
      reviewedBy: reviewerName,
      reviewDate: nowTimestamp,
      decision: 'CORRECTION_REQUIRED',
      previousValue: targetRow.currentValue,
      newValue: targetRow.currentValue,
      unit: targetRow.unit,
      reason: `Flagged: [${details.category}] ${details.reason}`,
      evidenceSummary: targetRow.evidenceFiles.length ? `${targetRow.evidenceFiles.length} file(s)` : 'None',
      comments: details.supportingComment || details.reason,
      scopeProject: `${dossier.projectName} (${dossier.siteName})`,
      reportingPeriod: `${dossier.monthName} ${dossier.financialYear}`,
      version: currentVersion,
    };
    this.data.auditLogs.unshift(auditEntry);

    this.saveToDisk();

    // Broadcast SSE real-time event to Contributor Correction Center & Reviewers
    this.broadcast('correction_requested', {
      dossierId,
      rowId,
      correction: newCorrItem,
      row: updatedRow,
      dossierStatus: dossier.status,
      timestamp: nowTimestamp,
    });

    return {
      success: true,
      message: `Correction request dispatched to Contributor Correction Center for "${targetRow.name}".`,
      dossier,
      row: updatedRow,
      correction: newCorrItem,
    };
  }

  /**
   * 4. Contributor resubmits corrected row
   */
  public resubmitRowCorrection(
    dossierId: string,
    rowId: string,
    newValue: string | number,
    contributorRemarks = 'Corrected according to reviewer feedback.',
    evidenceFile?: { id: string; name: string; type: string; size: number; url?: string }
  ): { success: boolean; message: string; dossier?: ESGReportingDossier; row?: ESGSubmissionRowItem } {
    const dossier = this.data.dossiers.find((d) => d.dossierId === dossierId);
    if (!dossier) {
      return { success: false, message: `Dossier ${dossierId} not found.` };
    }

    const targetRow = dossier.rows[rowId];
    if (!targetRow) {
      return { success: false, message: `Row ${rowId} not found in submission.` };
    }

    const nextVersion = (targetRow.version || 1) + 1;
    const nowTimestamp = new Date().toLocaleString();
    const history = targetRow.reviewerDecision?.history || [];

    const updatedHistory: RowReviewHistoryEntry[] = [
      ...history,
      {
        action: 'RESUBMITTED',
        actorName: dossier.submittingUser || 'Data Contributor',
        timestamp: nowTimestamp,
        value: newValue,
        version: nextVersion,
        comment: contributorRemarks,
      },
    ];

    const updatedRow: ESGSubmissionRowItem = {
      ...targetRow,
      currentValue: newValue,
      remarks: contributorRemarks,
      version: nextVersion,
      reviewStatus: 'RESUBMITTED',
      lastUpdated: nowTimestamp,
      evidenceFiles: evidenceFile
        ? [
            ...targetRow.evidenceFiles,
            {
              id: evidenceFile.id,
              name: evidenceFile.name,
              type: evidenceFile.type,
              size: evidenceFile.size,
              uploadedAt: nowTimestamp,
              url: evidenceFile.url,
            },
          ]
        : targetRow.evidenceFiles,
      reviewerDecision: targetRow.reviewerDecision
        ? {
            ...targetRow.reviewerDecision,
            status: 'RESUBMITTED',
            version: nextVersion,
            history: updatedHistory,
          }
        : undefined,
    };

    dossier.rows[rowId] = updatedRow;

    // Recalculate dossier counters
    const rowList = Object.values(dossier.rows);
    dossier.verifiedRows = rowList.filter((r) => r.reviewStatus === 'VERIFIED').length;
    dossier.correctionRequiredRows = rowList.filter((r) => r.reviewStatus === 'CORRECTION_REQUIRED').length;
    dossier.pendingRows = rowList.filter(
      (r) => r.reviewStatus === 'SUBMITTED' || r.reviewStatus === 'UNDER_REVIEW' || r.reviewStatus === 'RESUBMITTED'
    ).length;
    dossier.status = dossier.correctionRequiredRows > 0 ? 'Changes Requested' : 'Resubmitted';

    // Update corresponding correction item
    const corrItem = this.data.corrections.find((c) => c.assignmentId === dossierId && c.rowId === rowId);
    if (corrItem) {
      corrItem.status = 'RESUBMITTED';
      corrItem.resubmittedValue = newValue;
      corrItem.contributorResponse = contributorRemarks;
      corrItem.resubmittedAt = nowTimestamp;
      if (evidenceFile) {
        corrItem.evidenceFiles = corrItem.evidenceFiles || [];
        corrItem.evidenceFiles.push(evidenceFile);
      }
    }

    // Append to audit trail
    const auditEntry: ReviewAuditEntry = {
      id: `aud_${Date.now()}_${rowId}`,
      assignmentId: dossierId,
      indicatorCode: targetRow.id,
      indicatorName: targetRow.name,
      submittedBy: dossier.submittingUser,
      reviewedBy: 'Pending Reviewer Audit',
      reviewDate: nowTimestamp,
      decision: 'RESUBMIT',
      previousValue: targetRow.currentValue,
      newValue: newValue,
      unit: targetRow.unit,
      reason: contributorRemarks,
      evidenceSummary: evidenceFile ? `New file: ${evidenceFile.name}` : 'Revising numeric entry',
      comments: `Resubmitted with Revision v${nextVersion}`,
      scopeProject: `${dossier.projectName} (${dossier.siteName})`,
      reportingPeriod: `${dossier.monthName} ${dossier.financialYear}`,
      version: nextVersion,
    };
    this.data.auditLogs.unshift(auditEntry);

    this.saveToDisk();

    // Broadcast SSE real-time event to Reviewers
    this.broadcast('row_resubmitted', {
      dossierId,
      rowId,
      row: updatedRow,
      dossierStatus: dossier.status,
      version: nextVersion,
      newValue,
      timestamp: nowTimestamp,
    });

    return {
      success: true,
      message: `Row "${targetRow.name}" resubmitted with Revision v${nextVersion}. Awaiting Reviewer sign-off.`,
      dossier,
      row: updatedRow,
    };
  }

  // --- COMPANY PROFILE METHODS ---
  public getCompanyProfile(): CompanyProfile {
    if (!this.data.companyProfile) {
      this.data.companyProfile = getDefaultCompanyProfile();
    }
    return this.data.companyProfile;
  }

  public updateCompanyProfile(updates: Partial<CompanyProfile>, updatedBy: string): CompanyProfile {
    const current = this.getCompanyProfile();
    this.data.companyProfile = {
      ...current,
      ...updates,
      lastUpdated: new Date().toLocaleString(),
      updatedBy: updatedBy || current.updatedBy,
    };
    this.saveToDisk();
    this.broadcast('company_profile_updated', { profile: this.data.companyProfile });
    return this.data.companyProfile;
  }

  // --- FINAL ESG REPORTS METHODS ---
  public getFinalReports(): FinalEsgReport[] {
    if (!this.data.finalReports) {
      this.data.finalReports = [];
    }
    return [...this.data.finalReports];
  }

  public getFinalReportById(reportId: string): FinalEsgReport | null {
    const reports = this.getFinalReports();
    return reports.find((r) => r.reportId === reportId) || null;
  }

  public submitFinalReportByAuditor(params: {
    dossierId: string;
    auditNotes: string;
    auditorName?: string;
    auditorEmail?: string;
    financialYear?: string;
  }): { success: boolean; message: string; report?: FinalEsgReport } {
    const dossier = this.data.dossiers.find((d) => d.dossierId === params.dossierId);
    if (!dossier) {
      return { success: false, message: `Dossier ${params.dossierId} not found.` };
    }

    const rowList = Object.values(dossier.rows || {});
    const verifiedRows = rowList.filter((r) => r.reviewStatus === 'VERIFIED');

    if (verifiedRows.length === 0) {
      return {
        success: false,
        message: 'Cannot submit report to Management: At least one indicator must be verified by Reviewer and Assurer.',
      };
    }

    const now = new Date();
    const nowTimestamp = now.toLocaleString();
    const fy = params.financialYear || dossier.financialYear || 'FY 2026-27';
    const auditorName = params.auditorName || 'Sanjay Deshmukh (Lead BRSR Assurer)';
    const auditorEmail = params.auditorEmail || 'auditor@demo.com';

    // Check if an existing report for this dossier/project exists to version it
    this.data.finalReports = this.data.finalReports || [];
    const existingIndex = this.data.finalReports.findIndex(
      (r) => r.projectId === dossier.projectId && r.financialYear === fy
    );

    let nextVersion = 1;
    let reportId = `MEIL-BRSR-${dossier.projectCode || dossier.dossierId}-${now.getFullYear()}-v1`;
    let previousVersions: any[] = [];

    if (existingIndex >= 0) {
      const existing = this.data.finalReports[existingIndex];
      nextVersion = existing.version + 1;
      reportId = `MEIL-BRSR-${dossier.projectCode || dossier.dossierId}-${now.getFullYear()}-v${nextVersion}`;
      previousVersions = [
        ...(existing.previousVersions || []),
        {
          version: existing.version,
          submittedAt: existing.submittedAt,
          auditor: existing.submittedByAuditor,
          status: existing.status,
          pdfFileName: existing.pdfFileName,
          returnReason: existing.managementAction?.reason,
        },
      ];
    }

    const companyProfile = this.getCompanyProfile();
    const principlesSummary = generatePrinciplesSummary(rowList);

    const pdfFileName = `MEIL_BRSR_${fy.replace(/\s+/g, '')}_v${nextVersion}.pdf`;

    const newReport: FinalEsgReport = {
      reportId,
      version: nextVersion,
      financialYear: fy,
      reportingPeriod: {
        currentStart: '01-04-2025',
        currentEnd: '31-03-2026',
        prevStart: '01-04-2024',
        prevEnd: '31-03-2025',
        priorStart: '01-04-2023',
        priorEnd: '31-03-2024',
      },
      projectId: dossier.projectId,
      projectName: dossier.projectName,
      siteName: dossier.siteName,
      submittedByAuditor: auditorName,
      auditorEmail,
      submittedAt: nowTimestamp,
      auditNotes: params.auditNotes || 'Statutory sample testing & methodology verified under SEBI BRSR Core mandate.',
      status: 'SUBMITTED_TO_MANAGEMENT',
      pdfGenerationStatus: 'READY',
      pdfFileName,
      totalIndicators: rowList.length,
      verifiedIndicators: verifiedRows.length,
      principlesCovered: 9,
      datasetSnapshot: {
        dossier,
        indicators: rowList,
        principlesSummary,
      },
      history: [
        {
          action: 'AUDITOR_FINAL_SUBMISSION',
          actorName: auditorName,
          timestamp: nowTimestamp,
          notes: params.auditNotes,
          version: nextVersion,
        },
      ],
      previousVersions,
    };

    // Generate actual PDF buffer and store base64 snapshot
    try {
      const pdfBuf = generateBrsrPdf(newReport, companyProfile);
      newReport.pdfBase64 = pdfBuf.toString('base64');
      newReport.pdfGenerationStatus = 'READY';
    } catch (err: any) {
      console.error('[ESGDatabase] Error generating PDF for report:', err);
      newReport.pdfGenerationStatus = 'FAILED';
    }

    if (existingIndex >= 0) {
      this.data.finalReports[existingIndex] = newReport;
    } else {
      this.data.finalReports.unshift(newReport);
    }

    // Also update dossier status to Approved for Auditor / Executive Pending
    dossier.status = 'Approved for Auditor';

    this.saveToDisk();

    // Broadcast SSE event
    this.broadcast('final_report_submitted', {
      reportId: newReport.reportId,
      version: newReport.version,
      projectName: newReport.projectName,
      financialYear: newReport.financialYear,
      submittedByAuditor: newReport.submittedByAuditor,
      submittedAt: newReport.submittedAt,
      status: newReport.status,
      totalIndicators: newReport.totalIndicators,
      verifiedIndicators: newReport.verifiedIndicators,
      pdfFileName: newReport.pdfFileName,
    });

    return {
      success: true,
      message: `Final BRSR Report "${newReport.reportId}" successfully submitted to Management Portal! PDF generated.`,
      report: newReport,
    };
  }

  public returnReportByManagement(
    reportId: string,
    params: { actorName: string; actorEmail: string; reason: string }
  ): { success: boolean; message: string; report?: FinalEsgReport } {
    const report = this.getFinalReportById(reportId);
    if (!report) {
      return { success: false, message: `Report ${reportId} not found.` };
    }

    const nowTimestamp = new Date().toLocaleString();
    report.status = 'MANAGEMENT_RETURNED';
    report.managementAction = {
      action: 'RETURNED',
      actorName: params.actorName || 'Dr. V. Rao (Chief Sustainability Officer)',
      actorEmail: params.actorEmail || 'management@demo.com',
      timestamp: nowTimestamp,
      reason: params.reason,
    };

    report.history = report.history || [];
    report.history.push({
      action: 'MANAGEMENT_RETURNED',
      actorName: params.actorName,
      timestamp: nowTimestamp,
      notes: `Returned to Auditor with reason: ${params.reason}`,
      version: report.version,
    });

    // Create a tracked correction request for Auditor in corrections table
    const corrId = `CORR_MGMT_${Date.now()}`;
    const mgmtCorrItem: CorrectionRequestItem = {
      id: corrId,
      assignmentId: report.datasetSnapshot.dossier.dossierId,
      rowId: 'REPORT-LEVEL',
      indicatorCode: 'BRSR-FINAL-REPORT',
      indicatorName: `Management Review Return: ${report.reportId}`,
      projectName: report.projectName,
      siteName: report.siteName,
      financialYear: report.financialYear,
      monthName: report.datasetSnapshot.dossier.monthName,
      previousValue: `Version ${report.version}`,
      unit: 'Report',
      problem: params.reason,
      reasonCategory: 'Management Revision Request',
      reason: params.reason,
      requiredCorrection: 'Auditor must review management comments, re-verify referenced disclosures, and resubmit.',
      reviewerComment: `Requested by ${params.actorName}`,
      requestedAt: nowTimestamp,
      requestedBy: params.actorName,
      status: 'PENDING_CONTRIBUTOR',
      deadline: '7 days',
    };
    this.data.corrections.unshift(mgmtCorrItem);

    this.saveToDisk();

    // Broadcast SSE event
    this.broadcast('report_returned_to_auditor', {
      reportId: report.reportId,
      version: report.version,
      returnedBy: params.actorName,
      reason: params.reason,
      timestamp: nowTimestamp,
    });

    return {
      success: true,
      message: `Report ${report.reportId} successfully returned to Auditor with tracked correction request.`,
      report,
    };
  }

  public approveReportByManagement(
    reportId: string,
    params: { actorName: string; actorEmail: string; remarks?: string }
  ): { success: boolean; message: string; report?: FinalEsgReport } {
    const report = this.getFinalReportById(reportId);
    if (!report) {
      return { success: false, message: `Report ${reportId} not found.` };
    }

    const nowTimestamp = new Date().toLocaleString();
    report.status = 'MANAGEMENT_APPROVED';
    report.managementAction = {
      action: 'APPROVED',
      actorName: params.actorName || 'Dr. V. Rao (Chief Sustainability Officer)',
      actorEmail: params.actorEmail || 'management@demo.com',
      timestamp: nowTimestamp,
      remarks: params.remarks || 'Approved for corporate publication and annual report integration.',
    };

    report.history = report.history || [];
    report.history.push({
      action: 'MANAGEMENT_APPROVED',
      actorName: params.actorName,
      timestamp: nowTimestamp,
      notes: params.remarks || 'Executive Board Sign-off recorded.',
      version: report.version,
    });

    this.saveToDisk();

    // Broadcast SSE event
    this.broadcast('report_approved_by_management', {
      reportId: report.reportId,
      version: report.version,
      approvedBy: params.actorName,
      timestamp: nowTimestamp,
      remarks: params.remarks,
    });

    return {
      success: true,
      message: `Executive sign-off recorded! Report ${report.reportId} is fully approved for corporate publication.`,
      report,
    };
  }

  public regenerateReportPdf(
    reportId: string,
    actorName: string
  ): { success: boolean; message: string; report?: FinalEsgReport } {
    const report = this.getFinalReportById(reportId);
    if (!report) {
      return { success: false, message: `Report ${reportId} not found.` };
    }

    const companyProfile = this.getCompanyProfile();
    try {
      const pdfBuf = generateBrsrPdf(report, companyProfile);
      report.pdfBase64 = pdfBuf.toString('base64');
      report.pdfGenerationStatus = 'READY';

      report.history = report.history || [];
      report.history.push({
        action: 'PDF_REGENERATED',
        actorName: actorName || 'System',
        timestamp: new Date().toLocaleString(),
        notes: 'PDF regenerated from finalized report snapshot.',
        version: report.version,
      });

      this.saveToDisk();

      this.broadcast('report_pdf_regenerated', {
        reportId: report.reportId,
        version: report.version,
        pdfFileName: report.pdfFileName,
      });

      return {
        success: true,
        message: `PDF for report ${report.reportId} successfully regenerated.`,
        report,
      };
    } catch (err: any) {
      report.pdfGenerationStatus = 'FAILED';
      this.saveToDisk();
      return {
        success: false,
        message: `PDF generation failed: ${err?.message || 'Unknown error'}`,
        report,
      };
    }
  }
}

export const db = new ESGDatabase();
