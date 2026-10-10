import { assertBackendConnected, BackendNotConnectedError } from './base';
import type {
  ReviewAssignment,
  ReviewDecision,
  SubmissionReviewDetail,
  ValidationIssue,
  EvidenceDocument,
  ReviewComment,
  ReviewActivityLog,
} from '../types/reviewer';

export { BackendNotConnectedError };

/**
 * Review Queue Service Contract
 */
export const ReviewQueueService = {
  async getAssignedQueue(_filters?: Record<string, string>): Promise<ReviewAssignment[]> {
    return [];
  },
  async getQueueItemById(_id: string): Promise<ReviewAssignment | null> {
    return null;
  },
};

/**
 * Submission Review Service Contract
 */
export const SubmissionReviewService = {
  async getSubmissionDetail(_submissionId: string): Promise<SubmissionReviewDetail | null> {
    return null;
  },
  async getSubmittedData(_submissionId: string): Promise<Record<string, unknown> | null> {
    return null;
  },
  async getValidationChecks(_submissionId: string): Promise<never[]> {
    return [];
  },
};

/**
 * Validation Review Service Contract
 */
export const ValidationReviewService = {
  async getValidationIssues(_filters?: Record<string, string>): Promise<ValidationIssue[]> {
    return [];
  },
};

/**
 * Evidence Review Service Contract
 */
export const EvidenceReviewService = {
  async getEvidenceList(_filters?: Record<string, string>): Promise<EvidenceDocument[]> {
    return [];
  },
  async flagEvidence(_evidenceId: string, _reason: string): Promise<never> {
    assertBackendConnected('flag evidence document');
  },
};

/**
 * Reviewer Comment Service Contract
 */
export const ReviewerCommentService = {
  async getComments(_submissionId: string): Promise<ReviewComment[]> {
    return [];
  },
  async postComment(_submissionId: string, _commentText: string): Promise<never> {
    assertBackendConnected('post reviewer comment');
  },
};

/**
 * Review Decision Service Contract
 */
export const ReviewDecisionService = {
  async approveSubmission(_decision: ReviewDecision): Promise<never> {
    assertBackendConnected('approve ESG disclosure submission');
  },
  async requestCorrection(_decision: ReviewDecision): Promise<never> {
    assertBackendConnected('request correction from data contributor');
  },
  async rejectSubmission(_decision: ReviewDecision): Promise<never> {
    assertBackendConnected('reject ESG disclosure submission');
  },
};

/**
 * Reviewer Activity & History Service Contract
 */
export const ReviewerActivityService = {
  async getActivityHistory(_filters?: Record<string, string>): Promise<ReviewActivityLog[]> {
    return [];
  },
  async getReturnedSubmissions(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
  async getApprovedHistory(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
};
