/**
 * Data Contributor Portal TypeScript Models and Types.
 * 
 * NOTE: These are strictly typed contracts for future backend services.
 * No mocked arrays or seeded records are stored in this file.
 */

export type ContributorAssignmentStatus =
  | 'not_started'
  | 'in_progress'
  | 'draft'
  | 'ready_to_submit'
  | 'submitted'
  | 'correction_requested'
  | 'resubmitted'
  | 'approved'
  | 'overdue';

export interface ContributorAssignment {
  id: string;
  disclosureCode: string;
  disclosureName: string;
  reportingPeriod: string;
  scopeId: string;
  unit?: string;
  dueDate?: string;
  status: ContributorAssignmentStatus;
  brsrSection?: string;
  brsrPrinciple?: string;
  companyName?: string;
  businessUnit?: string;
  projectPlant?: string;
  department?: string;
  reportingFrequency?: string;
}

export interface DisclosureFieldDefinition {
  id: string;
  label: string;
  description?: string;
  type:
    | 'text'
    | 'long_text'
    | 'integer'
    | 'decimal'
    | 'percentage'
    | 'currency'
    | 'energy'
    | 'mass'
    | 'volume'
    | 'distance'
    | 'date'
    | 'boolean'
    | 'single_select'
    | 'multi_select'
    | 'table'
    | 'calculated';
  required: boolean;
  unit?: string;
  minimum?: number;
  maximum?: number;
  decimalPlaces?: number;
  evidenceRequired?: boolean;
  options?: { label: string; value: string }[];
}

export interface ContributorDataEntry {
  assignmentId: string;
  fieldValues: Record<string, unknown>;
  methodology?: string;
  remarks?: string;
  collectionMethod?: string;
  dataSource?: string;
  assumptions?: string;
  internalRef?: string;
  startDate?: string;
  endDate?: string;
}

export interface ContributorSubmissionRequest {
  assignmentId: string;
  declarationAccepted: boolean;
  finalNote?: string;
}

export interface ContributorEvidenceDocument {
  id: string;
  documentName: string;
  evidenceType: string;
  fileFormat: string;
  fileSizeBytes: number;
  uploadedOn: string;
  linkedDisclosure: string;
  projectScope: string;
  reportingPeriod: string;
  verificationStatus: string;
  description?: string;
  issuingAuthority?: string;
  confidentiality?: string;
}

export interface ContributorCorrectionItem {
  id: string;
  submissionId: string;
  disclosureCode: string;
  disclosureName: string;
  scope: string;
  reviewerComment: string;
  correctionCategory: string;
  returnedOn: string;
  dueDate: string;
  status: string;
  brsrSection?: string;
  reviewerName?: string;
}

export interface ContributorSubmissionRecord {
  id: string;
  submissionId: string;
  disclosureCode: string;
  disclosureName: string;
  scope: string;
  reportingPeriod: string;
  submittedOn: string;
  validationStatus: string;
  reviewStatus: string;
  lastUpdated: string;
  brsrSection?: string;
}

export interface ContributorActivityLog {
  id: string;
  timestamp: string;
  action: string;
  assignmentOrSubmissionId: string;
  disclosureName: string;
  scope: string;
  result: string;
  details: string;
}

export interface CalculationRuleMetadata {
  activityData?: string;
  activityUnit?: string;
  emissionFactor?: number;
  emissionFactorSource?: string;
  emissionFactorVersion?: string;
  conversionFactor?: number;
  calculatedOutput?: number;
  outputUnit?: string;
  calculationFormula?: string;
  manualExplanation?: string;
}

export interface ValidationResultItem {
  id: string;
  ruleCode: string;
  ruleName: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  fieldId?: string;
}
