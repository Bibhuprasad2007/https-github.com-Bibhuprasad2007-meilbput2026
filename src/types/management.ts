/**
 * Management Portal TypeScript Models and Types.
 * 
 * NOTE: These are strictly typed contracts for future backend services.
 * No mocked arrays or seeded records are stored in this file.
 */

export type ESGCategory =
  | 'environmental'
  | 'social'
  | 'governance';

export type ManagementSignOffStatus =
  | 'not_ready'
  | 'ready_for_review'
  | 'clarification_requested'
  | 'approved_for_assurance'
  | 'signed_off';

export interface ManagementKpi {
  id: string;
  name: string;
  category: ESGCategory;
  value?: number;
  unit?: string;
  previousValue?: number;
  targetValue?: number;
  reportingPeriod: string;
}

export interface ManagementRisk {
  id: string;
  title: string;
  category: ESGCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  organizationalScope: string;
  status: string;
  dueDate?: string;
  linkedMetric?: string;
  owner?: string;
}

export interface ManagementSignOffRequest {
  reportId: string;
  reportVersion: string;
  note?: string;
  confirmationAccepted: boolean;
  typedConfirmation?: string;
}

export interface ManagementReportSummary {
  id: string;
  reportName: string;
  reportingCycle: string;
  organizationalScope: string;
  version: string;
  generatedBy: string;
  generatedOn: string;
  signOffStatus: ManagementSignOffStatus;
  assuranceStatus: string;
  completenessPercentage?: number;
}

export interface ManagementClarificationRequest {
  category: string;
  section: string;
  comment: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responseDueDate?: string;
}

export interface ManagementActivityLog {
  id: string;
  timestamp: string;
  managementAction: string;
  reportOrSection: string;
  organizationalScope: string;
  outcome: string;
  comment?: string;
  details: string;
}

export interface TargetPerformanceItem {
  id: string;
  targetName: string;
  category: ESGCategory;
  baselineYear: string;
  targetYear: string;
  baselineValue?: number;
  targetValue?: number;
  currentApprovedValue?: number;
  unit?: string;
  progressPercentage?: number;
  responsibleOrgUnit: string;
  status: 'on_track' | 'at_risk' | 'off_track' | 'achieved' | 'not_available';
}

export interface BRSRReadinessSectionItem {
  sectionCode: string;
  sectionName: string;
  principles?: string[];
  requiredDisclosures: number;
  dataReceived: number;
  reviewerApproved: number;
  evidenceComplete: number;
  openIssues: number;
  readinessStatus: string;
}

export interface DataLineageNode {
  kpiId: string;
  kpiName: string;
  disclosureCode: string;
  subsidiary: string;
  businessUnit: string;
  projectPlant: string;
  contributorSubmissionId: string;
  evidenceDocumentId?: string;
}
