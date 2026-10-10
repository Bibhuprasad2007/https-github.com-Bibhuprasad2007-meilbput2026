import { Router, Request, Response } from 'express';
import { db } from '../db';

export const apiRouter = Router();

// Middleware to extract client auth context from headers
function getAuthContext(req: Request) {
  const role = (req.headers['x-user-role'] as string) || 'reviewer';
  const email = (req.headers['x-user-email'] as string) || 'reviewer@demo.com';
  const name = (req.headers['x-user-name'] as string) || 'Aarav Patel (Review Lead)';
  return { role, email, name };
}

// ---------------- 1. REAL-TIME SSE STREAM ----------------
apiRouter.get('/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Subscribe to DB real-time events
  const unsubscribe = db.subscribeSSE((event, payload) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  });

  // Heartbeat ping every 25 seconds to keep connection alive
  const pingInterval = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(pingInterval);
    unsubscribe();
  });
});

// ---------------- 2. DOSSIER SUBMISSION QUEUE ----------------
apiRouter.get('/dossiers', (req: Request, res: Response) => {
  const { projectId, status } = req.query;
  const { role } = getAuthContext(req);

  const dossiers = db.getDossiers({
    projectId: projectId as string,
    status: status as string,
    role,
  });

  res.json({
    success: true,
    total: dossiers.length,
    dossiers,
  });
});

apiRouter.get('/dossiers/:dossierId', (req: Request, res: Response) => {
  const { dossierId } = req.params;
  const dossier = db.getDossierById(dossierId);

  if (!dossier) {
    return res.status(404).json({ success: false, message: `Dossier ${dossierId} not found` });
  }

  res.json({ success: true, dossier });
});

// Contributor submits complete reporting table
apiRouter.post('/dossiers', (req: Request, res: Response) => {
  const { role, name } = getAuthContext(req);

  if (role !== 'contributor' && role !== 'esg_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only authorized Data Contributors can submit reporting dossiers.',
    });
  }

  const {
    contextKey,
    projectId,
    projectName,
    projectCode,
    siteId,
    siteName,
    financialYear,
    month,
    monthName,
    rows,
    submittingUser,
  } = req.body;

  if (!contextKey || !projectId || !rows) {
    return res.status(400).json({
      success: false,
      message: 'Bad Request: Missing required dossier fields (contextKey, projectId, rows).',
    });
  }

  const savedDossier = db.createOrUpdateDossier({
    contextKey,
    projectId,
    projectName: projectName || 'Project',
    projectCode: projectCode || '',
    siteId: siteId || '',
    siteName: siteName || '',
    financialYear: financialYear || 'FY 2026-27',
    month: Number(month) || 1,
    monthName: monthName || 'March 2027',
    totalRows: Object.keys(rows || {}).length,
    rows,
    submittingUser: submittingUser || name || 'Suresh Kumar (Site Contributor)',
    submittedAt: new Date().toLocaleString(),
  });

  res.status(201).json({
    success: true,
    message: `Dossier successfully submitted for ${savedDossier.projectName} (${savedDossier.monthName}). Sent to Reviewer queue.`,
    dossier: savedDossier,
  });
});

// ---------------- 3. ROW-LEVEL REVIEW ACTIONS ----------------

// Reviewer clicks CORRECT
apiRouter.post('/dossiers/:dossierId/rows/:rowId/correct', (req: Request, res: Response) => {
  const { role, name } = getAuthContext(req);

  if (role !== 'reviewer' && role !== 'esg_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only authorized Reviewers can verify indicator rows.',
    });
  }

  const { dossierId, rowId } = req.params;
  const { expectedVersion } = req.body;

  const result = db.markRowCorrect(dossierId, rowId, {
    reviewerName: name,
    expectedVersion,
  });

  if (!result.success) {
    const statusCode = result.message.includes('Concurrency conflict') ? 409 : 400;
    return res.status(statusCode).json(result);
  }

  res.json(result);
});

// Reviewer clicks INCORRECT
apiRouter.post('/dossiers/:dossierId/rows/:rowId/incorrect', (req: Request, res: Response) => {
  const { role, name } = getAuthContext(req);

  if (role !== 'reviewer' && role !== 'esg_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only authorized Reviewers can request row corrections.',
    });
  }

  const { dossierId, rowId } = req.params;
  const { category, reason, suggestedCorrection, supportingComment, expectedVersion } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error: A detailed rejection reason is mandatory.',
    });
  }

  const result = db.markRowIncorrect(dossierId, rowId, {
    category: category || 'Incorrect value',
    reason,
    suggestedCorrection,
    supportingComment,
    reviewerName: name,
    expectedVersion,
  });

  if (!result.success) {
    const statusCode = result.message.includes('Concurrency conflict') ? 409 : 400;
    return res.status(statusCode).json(result);
  }

  res.json(result);
});

// Contributor RESUBMITS corrected row
apiRouter.post('/dossiers/:dossierId/rows/:rowId/resubmit', (req: Request, res: Response) => {
  const { role } = getAuthContext(req);

  if (role !== 'contributor' && role !== 'esg_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only authorized Data Contributors can resubmit corrected records.',
    });
  }

  const { dossierId, rowId } = req.params;
  const { newValue, remarks, evidenceFile } = req.body;

  if (newValue === undefined || newValue === null || String(newValue).trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Validation error: Corrected value cannot be empty.',
    });
  }

  const result = db.resubmitRowCorrection(dossierId, rowId, newValue, remarks, evidenceFile);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// ---------------- 4. CONTRIBUTOR CORRECTION CENTER ----------------
apiRouter.get('/corrections', (req: Request, res: Response) => {
  const { status, projectId } = req.query;
  const corrections = db.getCorrections({
    status: status as string,
    projectId: projectId as string,
  });

  res.json({ success: true, total: corrections.length, corrections });
});

// ---------------- 5. AUDITOR PORTAL: STRICTLY VERIFIED RECORDS ONLY ----------------
apiRouter.get('/auditor/verified-records', (req: Request, res: Response) => {
  const { projectId, financialYear } = req.query;

  // Backend enforced rule: ONLY records with status === 'VERIFIED'
  const records = db.getAuditorVerifiedRecords({
    projectId: projectId as string,
    financialYear: financialYear as string,
  });

  res.json({
    success: true,
    total: records.length,
    records,
    auditPolicy: 'Strict Statutory BRSR Core Assurance — Verified Only',
  });
});

// ---------------- 6. AUDIT TRAIL ----------------
apiRouter.get('/audit-logs', (_req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({ success: true, total: logs.length, logs });
});

// ---------------- 7. COMPANY PROFILE (SECTION A DISCLOSURES) ----------------
apiRouter.get('/company-profile', (_req: Request, res: Response) => {
  const profile = db.getCompanyProfile();
  res.json({ success: true, profile });
});

apiRouter.put('/company-profile', (req: Request, res: Response) => {
  const { role, name } = getAuthContext(req);
  if (role !== 'esg_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only authorized ESG Administrators can update statutory company profile.',
    });
  }

  const updated = db.updateCompanyProfile(req.body, name);
  res.json({ success: true, message: 'Company profile updated successfully.', profile: updated });
});

// ---------------- 8. AUDITOR SUBMITS FINAL REPORT TO MANAGEMENT ----------------
apiRouter.post('/auditor/submit-final-report', (req: Request, res: Response) => {
  const { role, name, email } = getAuthContext(req);

  if (role !== 'auditor' && role !== 'esg_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only authorized Statutory Auditors can submit final assurance reports to Management.',
    });
  }

  const { dossierId, auditNotes, financialYear } = req.body;

  if (!dossierId) {
    return res.status(400).json({
      success: false,
      message: 'Validation error: dossierId is required for final assurance submission.',
    });
  }

  const result = db.submitFinalReportByAuditor({
    dossierId,
    auditNotes: auditNotes || 'Statutory sample testing & methodology verified under SEBI BRSR Core mandate.',
    auditorName: name || 'Sanjay Deshmukh (Lead BRSR Assurer)',
    auditorEmail: email || 'auditor@demo.com',
    financialYear,
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
});

// ---------------- 9. MANAGEMENT PORTAL FINAL ESG REPORTS ----------------
apiRouter.get('/management/reports', (req: Request, res: Response) => {
  const reports = db.getFinalReports();
  res.json({
    success: true,
    total: reports.length,
    reports,
  });
});

apiRouter.get('/management/reports/:reportId', (req: Request, res: Response) => {
  const { reportId } = req.params;
  const report = db.getFinalReportById(reportId);

  if (!report) {
    return res.status(404).json({ success: false, message: `Report "${reportId}" not found.` });
  }

  res.json({ success: true, report });
});

// Stream / Download Generated BRSR PDF
apiRouter.get('/management/reports/:reportId/pdf', (req: Request, res: Response) => {
  const { reportId } = req.params;
  const isDownload = req.query.download === 'true' || req.query.download === '1';

  const report = db.getFinalReportById(reportId);
  if (!report) {
    return res.status(404).json({ success: false, message: `Report "${reportId}" not found.` });
  }

  let pdfBuffer: Buffer;

  if (report.pdfBase64) {
    pdfBuffer = Buffer.from(report.pdfBase64, 'base64');
  } else {
    // Generate on demand if not cached
    const companyProfile = db.getCompanyProfile();
    const { generateBrsrPdf } = require('../services/pdfGenerator');
    pdfBuffer = generateBrsrPdf(report, companyProfile);
  }

  const filename = report.pdfFileName || `MEIL_BRSR_${report.reportId}.pdf`;
  const disposition = isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', disposition);
  res.setHeader('Content-Length', pdfBuffer.length);
  res.setHeader('Cache-Control', 'public, max-age=3600');

  res.send(pdfBuffer);
});

// Management Returns Report to Auditor
apiRouter.post('/management/reports/:reportId/return', (req: Request, res: Response) => {
  const { role, name, email } = getAuthContext(req);

  if (role !== 'management' && role !== 'esg_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only authorized Management personnel can return finalized ESG reports.',
    });
  }

  const { reportId } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error: A detailed return reason is required for corporate audit trail compliance.',
    });
  }

  const result = db.returnReportByManagement(reportId, {
    actorName: name || 'Dr. V. Rao (Chief Sustainability Officer)',
    actorEmail: email || 'management@demo.com',
    reason: reason.trim(),
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Management Approves Report (Board Sign-Off)
apiRouter.post('/management/reports/:reportId/approve', (req: Request, res: Response) => {
  const { role, name, email } = getAuthContext(req);

  if (role !== 'management' && role !== 'esg_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only authorized Management personnel can sign off and approve finalized ESG reports.',
    });
  }

  const { reportId } = req.params;
  const { remarks } = req.body;

  const result = db.approveReportByManagement(reportId, {
    actorName: name || 'Dr. V. Rao (Chief Sustainability Officer)',
    actorEmail: email || 'management@demo.com',
    remarks,
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Regenerate PDF
apiRouter.post('/management/reports/:reportId/regenerate-pdf', (req: Request, res: Response) => {
  const { role, name } = getAuthContext(req);

  if (role !== 'management' && role !== 'auditor' && role !== 'esg_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You do not have permission to trigger report PDF regeneration.',
    });
  }

  const { reportId } = req.params;
  const result = db.regenerateReportPdf(reportId, name);

  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json(result);
});

// ---------------- 10. HEALTH CHECK ----------------
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MEIL BRSR Reporting Portal Engine',
  });
});

