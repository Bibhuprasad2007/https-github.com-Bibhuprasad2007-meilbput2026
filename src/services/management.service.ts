import { assertBackendConnected, BackendNotConnectedError } from './base';
import type {
  ManagementKpi,
  ManagementRisk,
  ManagementSignOffRequest,
  ManagementReportSummary,
  ManagementClarificationRequest,
  ManagementActivityLog,
  TargetPerformanceItem,
  BRSRReadinessSectionItem,
  DataLineageNode,
} from '../types/management';

export { BackendNotConnectedError };

/**
 * Management Dashboard Service Contract
 */
export const ManagementDashboardService = {
  async getSummaryKpis(_reportingCycleId?: string): Promise<ManagementKpi[]> {
    return [];
  },
  async getReadinessOverview(_reportingCycleId?: string): Promise<Record<string, unknown> | null> {
    return null;
  },
};

/**
 * ESG Consolidated Performance Service Contract
 */
export const ESGPerformanceService = {
  async getConsolidatedScores(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
  async getHierarchicalPerformance(_scopeId?: string): Promise<never[]> {
    return [];
  },
};

/**
 * Environmental Performance Service Contract
 */
export const EnvironmentalPerformanceService = {
  async getEmissionsSummary(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
  async getEnergyMix(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
  async getWaterAndWasteData(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
};

/**
 * Social Performance Service Contract
 */
export const SocialPerformanceService = {
  async getWorkforceMetrics(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
  async getSafetyAndTrainingMetrics(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
};

/**
 * Governance Performance Service Contract
 */
export const GovernancePerformanceService = {
  async getGovernanceMetrics(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
  async getComplianceRecords(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
};

/**
 * BRSR Readiness Service Contract
 */
export const BRSRReadinessService = {
  async getReadinessBreakdown(_reportingCycleId?: string): Promise<BRSRReadinessSectionItem[]> {
    return [];
  },
  async getPrincipleReadiness(_principleCode: string): Promise<Record<string, unknown> | null> {
    return null;
  },
};

/**
 * Management Risk & Exceptions Service Contract
 */
export const ManagementRiskService = {
  async getRisks(_filters?: Record<string, string>): Promise<ManagementRisk[]> {
    return [];
  },
  async getExceptions(_filters?: Record<string, string>): Promise<never[]> {
    return [];
  },
};

/**
 * Target Performance Service Contract
 */
export const TargetPerformanceService = {
  async getTargets(_filters?: Record<string, string>): Promise<TargetPerformanceItem[]> {
    return [];
  },
};

/**
 * Data Lineage Service Contract
 */
export const DataLineageService = {
  async getLineageTree(_metricId: string): Promise<DataLineageNode[]> {
    return [];
  },
};

/**
 * Management Sign-Off Service Contract
 */
export const ManagementSignOffService = {
  async getSignOffPrerequisites(_reportId: string): Promise<Record<string, unknown> | null> {
    return null;
  },
  async submitSignOff(_request: ManagementSignOffRequest): Promise<never> {
    assertBackendConnected('record management BRSR sign-off');
  },
  async requestClarification(_request: ManagementClarificationRequest): Promise<never> {
    assertBackendConnected('submit clarification request to ESG Admin');
  },
};

/**
 * Management Reports Service Contract
 */
export const ManagementReportService = {
  async getGeneratedReports(_filters?: Record<string, string>): Promise<ManagementReportSummary[]> {
    return [];
  },
  async getReportPreview(_reportId: string): Promise<Record<string, unknown> | null> {
    return null;
  },
};

/**
 * Management Activity Service Contract
 */
export const ManagementActivityService = {
  async getActivityLogs(_filters?: Record<string, string>): Promise<ManagementActivityLog[]> {
    return [];
  },
};
