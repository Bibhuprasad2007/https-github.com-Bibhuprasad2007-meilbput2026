/**
 * Service contracts and data transfer interfaces for the MEIL ESG Admin Portal.
 * 
 * NOTE: These interfaces define typed boundaries for future backend services
 * (e.g. REST API, GraphQL, Microservices). No mocked data or seeded fixtures
 * are stored here.
 */

export interface OrganizationUnitInput {
  entityType: 'Subsidiary' | 'Business Unit' | 'Project' | 'Plant' | 'Department';
  entityName: string;
  entityCode: string;
  parentEntity?: string;
  sector: string;
  country: string;
  state: string;
  city: string;
  startDate?: string;
  endDate?: string;
  responsibleHead?: string;
  isActive: boolean;
}

export interface UserInput {
  fullName: string;
  employeeId: string;
  workEmail: string;
  mobileNumber?: string;
  department: string;
  role: 'Data Contributor' | 'Reviewer / Approver' | 'Management' | 'Auditor / Assurer';
  subsidiary?: string;
  businessUnit?: string;
  assignedProjects?: string[];
  assignedSections?: string[];
  accountExpiry?: string;
  isActive: boolean;
}

export interface ReportingCycleInput {
  cycleName: string;
  financialYearStart: string;
  financialYearEnd: string;
  reportingBoundary: 'Standalone' | 'Consolidated';
  reportPackage: 'Comprehensive' | 'Lite' | 'Core';
  frequency: 'Annual' | 'Semi-Annual' | 'Quarterly' | 'Monthly';
  contributorDeadline: string;
  reviewerDeadline: string;
  correctionDeadline: string;
  finalLockDate: string;
  previousCycle?: string;
  status: 'Draft' | 'Active' | 'Under Review' | 'Locked' | 'Archived';
}

export interface TaskAssignmentInput {
  reportingCycleId: string;
  section: string;
  principle?: string;
  disclosureId: string;
  subsidiary?: string;
  businessUnit?: string;
  projectPlant?: string;
  department?: string;
  contributorId: string;
  reviewerId: string;
  frequency: string;
  evidenceRequired: boolean;
  dueDate: string;
  reminderRule: string;
}

export interface ReminderInput {
  targetRole?: string;
  scope?: string;
  subject: string;
  message: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export interface EvidenceUploadInput {
  title: string;
  documentType: string;
  projectPlant?: string;
  reportingPeriod?: string;
  disclosureId?: string;
  notes?: string;
}

export interface SettingsInput {
  organizationName?: string;
  legalEntityCode?: string;
  corporateAddress?: string;
  contactEmail?: string;
  defaultCurrency?: string;
  measurementUnitSystem?: string;
  emissionFactorVersion?: string;
  varianceThresholdPercent?: number;
  mandatoryApprovalsCount?: number;
  enableEmailAlerts?: boolean;
  twoFactorEnforced?: boolean;
  retentionPeriodYears?: number;
}
