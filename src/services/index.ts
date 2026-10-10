import { assertBackendConnected, BackendNotConnectedError } from './base';
import type {
  OrganizationUnitInput,
  UserInput,
  ReportingCycleInput,
  TaskAssignmentInput,
  ReminderInput,
  EvidenceUploadInput,
  SettingsInput,
} from '../types/services';

export { BackendNotConnectedError, assertBackendConnected };

/**
 * Organization Service contract
 */
export const OrganizationService = {
  async getOrganizationUnits(): Promise<never[]> {
    return [];
  },
  async createOrganizationUnit(_data: OrganizationUnitInput): Promise<never> {
    assertBackendConnected('save organization unit');
  },
  async updateOrganizationUnit(_id: string, _data: Partial<OrganizationUnitInput>): Promise<never> {
    assertBackendConnected('update organization unit');
  },
  async deleteOrganizationUnit(_id: string): Promise<never> {
    assertBackendConnected('delete organization unit');
  },
};

/**
 * User & Role Management Service contract
 */
export const UserService = {
  async getUsers(): Promise<never[]> {
    return [];
  },
  async createUser(_data: UserInput): Promise<never> {
    assertBackendConnected('create user');
  },
  async resendInvite(_userId: string): Promise<never> {
    assertBackendConnected('resend invitation email');
  },
  async resetPassword(_userId: string): Promise<never> {
    assertBackendConnected('trigger password reset');
  },
};

/**
 * Reporting Cycle Service contract
 */
export const ReportingCycleService = {
  async getReportingCycles(): Promise<never[]> {
    return [];
  },
  async createReportingCycle(_data: ReportingCycleInput): Promise<never> {
    assertBackendConnected('create reporting cycle');
  },
  async lockReportingCycle(_cycleId: string): Promise<never> {
    assertBackendConnected('lock reporting cycle');
  },
};

/**
 * BRSR Framework Service contract
 */
export const BRSRFrameworkService = {
  async getDisclosures(_section?: string, _principle?: string): Promise<never[]> {
    return [];
  },
  async importFramework(): Promise<never> {
    assertBackendConnected('import official BRSR framework metadata');
  },
};

/**
 * Task Assignment Service contract
 */
export const AssignmentService = {
  async getAssignments(): Promise<never[]> {
    return [];
  },
  async createAssignment(_data: TaskAssignmentInput): Promise<never> {
    assertBackendConnected('create task assignment');
  },
  async sendReminder(_data: ReminderInput): Promise<never> {
    assertBackendConnected('dispatch reminder notifications');
  },
};

/**
 * Submission Monitoring Service contract
 */
export const SubmissionService = {
  async getSubmissions(): Promise<never[]> {
    return [];
  },
  async reassignSubmission(_submissionId: string, _assigneeId: string): Promise<never> {
    assertBackendConnected('reassign submission');
  },
  async escalateSubmission(_submissionId: string): Promise<never> {
    assertBackendConnected('escalate submission');
  },
};

/**
 * Validation & Exceptions Service contract
 */
export const ValidationService = {
  async getExceptions(): Promise<never[]> {
    return [];
  },
  async revalidateSection(_sectionId: string): Promise<never> {
    assertBackendConnected('trigger revalidation rule checks');
  },
};

/**
 * Evidence & Audit Service contract
 */
export const EvidenceService = {
  async getEvidenceDocuments(): Promise<never[]> {
    return [];
  },
  async uploadEvidence(_data: EvidenceUploadInput): Promise<never> {
    assertBackendConnected('upload evidence file to secure storage');
  },
  async getAuditTrail(): Promise<never[]> {
    return [];
  },
};

/**
 * Report Readiness Service contract
 */
export const ReportReadinessService = {
  async getReadinessStatus(): Promise<never[]> {
    return [];
  },
  async markReadyForManagement(_cycleId: string): Promise<never> {
    assertBackendConnected('mark report as ready for executive management');
  },
};

/**
 * Settings Service contract
 */
export const SettingsService = {
  async getSettings(): Promise<Record<string, unknown>> {
    return {};
  },
  async saveSettings(_data: SettingsInput): Promise<never> {
    assertBackendConnected('save system settings');
  },
};
