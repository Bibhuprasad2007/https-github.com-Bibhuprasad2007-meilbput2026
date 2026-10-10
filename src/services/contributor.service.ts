import { assertBackendConnected, BackendNotConnectedError } from './base';
import type {
  ContributorAssignment,
  ContributorDataEntry,
  ContributorSubmissionRequest,
  ContributorEvidenceDocument,
  ContributorCorrectionItem,
  ContributorSubmissionRecord,
  ContributorActivityLog,
  CalculationRuleMetadata,
  ValidationResultItem,
  DisclosureFieldDefinition,
} from '../types/contributor';

export { BackendNotConnectedError };

/**
 * Contributor Assignment Service Contract
 */
export const ContributorAssignmentService = {
  async getMyAssignments(_filters?: Record<string, string>): Promise<ContributorAssignment[]> {
    return [];
  },
  async getAssignmentById(_assignmentId: string): Promise<ContributorAssignment | null> {
    return null;
  },
  async getAssignmentFieldDefinitions(_assignmentId: string): Promise<DisclosureFieldDefinition[]> {
    return [];
  },
};

/**
 * Contributor Data Entry Service Contract
 */
export const ContributorDataEntryService = {
  async getDataEntry(_assignmentId: string): Promise<ContributorDataEntry | null> {
    return null;
  },
  async submitDataEntry(_data: ContributorDataEntry): Promise<never> {
    assertBackendConnected('submit ESG disclosure data');
  },
};

/**
 * Contributor Draft Service Contract
 */
export const ContributorDraftService = {
  async getDraft(_assignmentId: string): Promise<ContributorDataEntry | null> {
    return null;
  },
  async saveDraft(_draft: ContributorDataEntry): Promise<never> {
    assertBackendConnected('save disclosure draft to server');
  },
  async clearDraft(_assignmentId: string): Promise<never> {
    assertBackendConnected('clear disclosure draft');
  },
};

/**
 * Contributor Validation Service Contract
 */
export const ContributorValidationService = {
  async validateEntry(_assignmentId: string, _entryData: Record<string, unknown>): Promise<ValidationResultItem[]> {
    return [];
  },
};

/**
 * Contributor Calculation Service Contract
 */
export const ContributorCalculationService = {
  async getCalculationRule(_assignmentId: string): Promise<CalculationRuleMetadata | null> {
    return null;
  },
  async calculateOutput(_assignmentId: string, _activityData: number, _factorId?: string): Promise<number | null> {
    return null;
  },
};

/**
 * Future calculation service contract alias
 */
export const CalculationService = ContributorCalculationService;

/**
 * Contributor Evidence Service Contract
 */
export const ContributorEvidenceService = {
  async getEvidenceDocuments(_filters?: Record<string, string>): Promise<ContributorEvidenceDocument[]> {
    return [];
  },
  async getAssignmentEvidence(_assignmentId: string): Promise<ContributorEvidenceDocument[]> {
    return [];
  },
  async uploadEvidence(_assignmentId: string, _file: File, _metadata: Record<string, string>): Promise<never> {
    assertBackendConnected('upload supporting evidence document');
  },
  async deleteEvidence(_evidenceId: string): Promise<never> {
    assertBackendConnected('delete supporting evidence');
  },
};

/**
 * Contributor Bulk Upload Service Contract
 */
export const ContributorBulkUploadService = {
  async getTemplate(_scopeId: string, _reportingCycleId: string): Promise<null> {
    return null;
  },
  async parseAndValidateUpload(_file: File): Promise<{ totalRows: number; validRows: number; errorRows: number }> {
    assertBackendConnected('validate bulk upload spreadsheet');
  },
  async submitBulkRecords(_file: File): Promise<never> {
    assertBackendConnected('submit bulk upload records');
  },
};

/**
 * Contributor Submission Service Contract
 */
export const ContributorSubmissionService = {
  async getMySubmissions(_filters?: Record<string, string>): Promise<ContributorSubmissionRecord[]> {
    return [];
  },
  async submitForReview(_request: ContributorSubmissionRequest): Promise<never> {
    assertBackendConnected('submit assignment for reviewer review');
  },
};

/**
 * Contributor Correction Service Contract
 */
export const ContributorCorrectionService = {
  async getCorrections(_filters?: Record<string, string>): Promise<ContributorCorrectionItem[]> {
    return [];
  },
  async resubmitCorrection(_assignmentId: string, _responseNotes: string): Promise<never> {
    assertBackendConnected('resubmit corrected disclosure');
  },
};

/**
 * Contributor Activity Service Contract
 */
export const ContributorActivityService = {
  async getActivityLogs(_filters?: Record<string, string>): Promise<ContributorActivityLog[]> {
    return [];
  },
};
