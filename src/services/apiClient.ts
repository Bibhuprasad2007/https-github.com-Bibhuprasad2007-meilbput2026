import type { ESGReportingDossier, ESGSubmissionRowItem } from '../context/NexusDataContext';

export interface BackendDossiersResponse {
  success: boolean;
  total: number;
  dossiers: ESGReportingDossier[];
}

export interface BackendDossierDetailResponse {
  success: boolean;
  dossier: ESGReportingDossier;
}

export interface BackendActionResponse {
  success: boolean;
  message: string;
  dossier?: ESGReportingDossier;
  row?: ESGSubmissionRowItem;
}

export interface BackendAuditorRecord {
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
}

export interface BackendAuditorResponse {
  success: boolean;
  total: number;
  records: BackendAuditorRecord[];
  auditPolicy: string;
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

function getAuthHeaders(): HeadersInit {
  let role = 'reviewer';
  let email = 'reviewer@demo.com';
  let name = 'Aarav Patel (Review Lead)';

  try {
    const raw = sessionStorage.getItem('meil_demo_auth_session') || sessionStorage.getItem('meil_demo_admin_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.role) role = parsed.role;
      if (parsed?.user?.email) email = parsed.user.email;
      if (parsed?.user?.name) name = parsed.user.name;
    }
  } catch {
    // ignore
  }

  return {
    'Content-Type': 'application/json',
    'x-user-role': role,
    'x-user-email': email,
    'x-user-name': name,
  };
}

export const apiClient = {
  async getDossiers(params?: { projectId?: string; status?: string }): Promise<ESGReportingDossier[]> {
    const query = new URLSearchParams();
    if (params?.projectId && params.projectId !== 'ALL') query.set('projectId', params.projectId);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);

    const url = `/api/dossiers${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch dossiers: ${res.statusText}`);
    const data: BackendDossiersResponse = await res.json();
    return data.dossiers || [];
  },

  async getDossierById(dossierId: string): Promise<ESGReportingDossier | null> {
    const res = await fetch(`/api/dossiers/${dossierId}`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    const data: BackendDossierDetailResponse = await res.json();
    return data.dossier || null;
  },

  async submitDossier(dossierData: any): Promise<BackendActionResponse> {
    const res = await fetch('/api/dossiers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dossierData),
    });
    return res.json();
  },

  async markRowCorrect(dossierId: string, rowId: string, expectedVersion?: number): Promise<BackendActionResponse> {
    const res = await fetch(`/api/dossiers/${dossierId}/rows/${rowId}/correct`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ expectedVersion }),
    });
    return res.json();
  },

  async markRowIncorrect(
    dossierId: string,
    rowId: string,
    details: {
      category: string;
      reason: string;
      suggestedCorrection?: string;
      supportingComment?: string;
      expectedVersion?: number;
    }
  ): Promise<BackendActionResponse> {
    const res = await fetch(`/api/dossiers/${dossierId}/rows/${rowId}/incorrect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(details),
    });
    return res.json();
  },

  async resubmitRowCorrection(
    dossierId: string,
    rowId: string,
    newValue: string | number,
    remarks?: string,
    evidenceFile?: any
  ): Promise<BackendActionResponse> {
    const res = await fetch(`/api/dossiers/${dossierId}/rows/${rowId}/resubmit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newValue, remarks, evidenceFile }),
    });
    return res.json();
  },

  async getCorrections(status?: string): Promise<any[]> {
    const url = `/api/corrections${status && status !== 'all' ? `?status=${status}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.corrections || [];
  },

  async getAuditorVerifiedRecords(filters?: { projectId?: string; financialYear?: string }): Promise<BackendAuditorRecord[]> {
    const query = new URLSearchParams();
    if (filters?.projectId && filters.projectId !== 'ALL') query.set('projectId', filters.projectId);
    if (filters?.financialYear && filters.financialYear !== 'ALL') query.set('financialYear', filters.financialYear);

    const url = `/api/auditor/verified-records${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const data: BackendAuditorResponse = await res.json();
    return data.records || [];
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch('/api/audit-logs', { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  },

  async getCompanyProfile(): Promise<CompanyProfile | null> {
    const res = await fetch('/api/company-profile', { headers: getAuthHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile || null;
  },

  async updateCompanyProfile(updates: Partial<CompanyProfile>): Promise<{ success: boolean; message: string; profile?: CompanyProfile }> {
    const res = await fetch('/api/company-profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async getManagementReports(): Promise<FinalEsgReport[]> {
    const res = await fetch('/api/management/reports', { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.reports || [];
  },

  async getManagementReportById(reportId: string): Promise<FinalEsgReport | null> {
    const res = await fetch(`/api/management/reports/${reportId}`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data.report || null;
  },

  async submitFinalReportByAuditor(params: {
    dossierId: string;
    auditNotes: string;
    financialYear?: string;
  }): Promise<{ success: boolean; message: string; report?: FinalEsgReport }> {
    const res = await fetch('/api/auditor/submit-final-report', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async returnManagementReport(reportId: string, reason: string): Promise<{ success: boolean; message: string; report?: FinalEsgReport }> {
    const res = await fetch(`/api/management/reports/${reportId}/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  async approveManagementReport(reportId: string, remarks?: string): Promise<{ success: boolean; message: string; report?: FinalEsgReport }> {
    const res = await fetch(`/api/management/reports/${reportId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ remarks }),
    });
    return res.json();
  },

  async regenerateManagementReportPdf(reportId: string): Promise<{ success: boolean; message: string; report?: FinalEsgReport }> {
    const res = await fetch(`/api/management/reports/${reportId}/regenerate-pdf`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getPdfDownloadUrl(reportId: string, download = true): string {
    return `/api/management/reports/${reportId}/pdf${download ? '?download=true' : ''}`;
  },

  subscribeToEvents(onEvent: (event: string, data: any) => void): () => void {
    const eventSource = new EventSource('/api/events');

    const handleEvent = (event: string) => (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent(event, parsed);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    const eventNames = [
      'submission_created',
      'row_verified',
      'correction_requested',
      'row_resubmitted',
      'submission_status_changed',
      'final_report_submitted',
      'report_returned_to_auditor',
      'report_approved_by_management',
      'report_pdf_regenerated',
      'company_profile_updated',
    ];

    eventNames.forEach((ev) => {
      eventSource.addEventListener(ev, handleEvent(ev));
    });

    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent('message', parsed);
      } catch {
        // ignore
      }
    };

    return () => {
      eventSource.close();
    };
  },
};
