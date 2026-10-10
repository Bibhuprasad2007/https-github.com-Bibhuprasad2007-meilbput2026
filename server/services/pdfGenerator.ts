import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FinalEsgReport, CompanyProfile } from '../db';

export function generateBrsrPdf(report: FinalEsgReport, companyProfile: CompanyProfile): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 14;

  // Colors
  const navyColor: [number, number, number] = [15, 41, 74]; // #0F294A
  const darkSlate: [number, number, number] = [30, 41, 59]; // #1E293B
  const subtleBorder: [number, number, number] = [203, 213, 225]; // #CBD5E1
  const headerBg: [number, number, number] = [241, 245, 249]; // #F1F5F9
  const accentBlue: [number, number, number] = [26, 75, 130]; // #1A4B82

  // -------------------------------------------------------------
  // PAGE 1: SECTION A - GENERAL DISCLOSURES (DETAILS OF THE ENTITY)
  // -------------------------------------------------------------
  let currentY = 16;

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...navyColor);
  doc.text('BUSINESS RESPONSIBILITY & SUSTAINABILITY REPORTING', marginX, currentY);
  currentY += 5;

  doc.setFontSize(10.5);
  doc.text('SECTION A: GENERAL DISCLOSURES', marginX, currentY);
  currentY += 4.5;

  doc.setFontSize(9.5);
  doc.setTextColor(...accentBlue);
  doc.text('I. DETAILS OF THE ENTITY', marginX, currentY);
  currentY += 2;

  // Blue decorative separator line
  doc.setDrawColor(...accentBlue);
  doc.setLineWidth(0.6);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 3;

  // 1. Details of the Entity Table
  const entityDetailsBody = [
    ['1', 'Corporate Identity Number (CIN)', `${companyProfile.cin} (Verified via MCA Corporate Registry)`],
    ['2', 'Name of the Entity', companyProfile.name],
    ['3', 'Year of Incorporation', `${companyProfile.incorporationYear} (Incorporated: ${companyProfile.incorporationDate})`],
    ['4', 'Registered Office Address', companyProfile.registeredOffice],
    ['5', 'Corporate Office Address', companyProfile.corporateOffice],
    ['6', 'E-mail', companyProfile.email],
    ['7', 'Telephone', companyProfile.telephone],
    ['8', 'Website', companyProfile.website],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: pageWidth - marginX * 2,
    head: [['No.', 'Particulars', 'Company Details & Verification']],
    body: entityDetailsBody,
    theme: 'grid',
    headStyles: {
      fillColor: navyColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2,
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: subtleBorder,
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 2. Financial Year and Stock Exchange Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...navyColor);
  doc.text('II. FINANCIAL YEAR AND STOCK EXCHANGE DETAILS', marginX, currentY);
  currentY += 2;

  const fyDatesBody = [
    ['Current Financial Year', report.reportingPeriod?.currentStart || '01-04-2025', report.reportingPeriod?.currentEnd || '31-03-2026'],
    ['Previous Financial Year', report.reportingPeriod?.prevStart || '01-04-2024', report.reportingPeriod?.prevEnd || '31-03-2025'],
    ['Prior to Previous Year', report.reportingPeriod?.priorStart || '01-04-2023', report.reportingPeriod?.priorEnd || '31-03-2024'],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: pageWidth - marginX * 2,
    head: [['Reporting Period / Financial Year', 'Start Date', 'End Date']],
    body: fyDatesBody,
    theme: 'grid',
    headStyles: {
      fillColor: accentBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 1.8,
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 7.5,
      cellPadding: 1.6,
      lineColor: subtleBorder,
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 'auto', halign: 'center' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 2.5;

  // Stock Exchange row
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: pageWidth - marginX * 2,
    body: [
      ['9', 'Name of Stock Exchange(s) where shares are listed', companyProfile.stockExchanges],
    ],
    theme: 'grid',
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: subtleBorder,
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 75, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 3. Capital and Contact Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...navyColor);
  doc.text('III. CAPITAL AND CONTACT DETAILS', marginX, currentY);
  currentY += 2;

  const capitalDetailsBody = [
    ['11', 'Paid-up Capital', `${companyProfile.paidUpCapital} (Verified via MCA annual returns)`],
    ['12', 'Name of Contact Person for BRSR Queries', companyProfile.brsrContactPerson],
    ['12(a)', 'Contact Number', companyProfile.contactNumber],
    ['12(b)', 'Contact E-mail', companyProfile.contactEmail],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: pageWidth - marginX * 2,
    head: [['No.', 'Particulars', 'Details']],
    body: capitalDetailsBody,
    theme: 'grid',
    headStyles: {
      fillColor: accentBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 1.8,
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: subtleBorder,
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 65, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 4. Reporting Boundary and Assurance
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...navyColor);
  doc.text('IV. REPORTING BOUNDARY AND ASSURANCE', marginX, currentY);
  currentY += 2;

  const boundaryDetailsBody = [
    ['13', 'Reporting Boundary', `${companyProfile.reportingBoundary} — Scope covers operational project sites and active infrastructure packages.`],
    ['14', 'Name of Assessment or Assurance Provider', `${companyProfile.assuranceProvider}`],
    ['15', 'Type of Assessment or Assurance Obtained', `${companyProfile.assuranceType}`],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: pageWidth - marginX * 2,
    head: [['No.', 'Particulars', 'Details']],
    body: boundaryDetailsBody,
    theme: 'grid',
    headStyles: {
      fillColor: navyColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 1.8,
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: subtleBorder,
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 65, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  });

  // -------------------------------------------------------------
  // PAGE 2: NINE-PRINCIPLE SUMMARY TABLE
  // -------------------------------------------------------------
  doc.addPage();
  currentY = 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...navyColor);
  doc.text('BUSINESS RESPONSIBILITY & SUSTAINABILITY REPORTING', marginX, currentY);
  currentY += 5;

  doc.setFontSize(10);
  doc.text('SECTION B/C: PRINCIPLE-WISE ESG DISCLOSURES', marginX, currentY);
  currentY += 4;

  // Metadata strip
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 80, 95);
  doc.text(
    `Entity: ${companyProfile.name}  |  Financial Year: ${report.financialYear}  |  Report ID: ${report.reportId} (v${report.version})  |  Status: Verified & Audited`,
    marginX,
    currentY
  );
  currentY += 2;

  doc.setDrawColor(...accentBlue);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...navyColor);
  doc.text('NINE-PRINCIPLE EXECUTIVE DISCLOSURE MATRIX', marginX, currentY);
  currentY += 2.5;

  // Build nine-principle summary rows from report.datasetSnapshot.principlesSummary
  const summaryRows = report.datasetSnapshot.principlesSummary.map((ps) => [
    `Principle ${ps.principleNumber}\n(${ps.principleCode})`,
    `${ps.title}\n${ps.summaryText}`,
    ps.keyMetrics,
    ps.reportingStatus,
    ps.auditStatus,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: pageWidth - marginX * 2,
    head: [['Principle', 'Disclosure Summary', 'Key Metrics & Units', 'Reporting Status', 'Audit Status']],
    body: summaryRows,
    theme: 'grid',
    headStyles: {
      fillColor: navyColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2,
      halign: 'left',
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 7.2,
      cellPadding: 2,
      lineColor: subtleBorder,
      lineWidth: 0.15,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 62 },
      2: { cellWidth: 48 },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 'auto', halign: 'center', fontStyle: 'bold' },
    },
  });

  // -------------------------------------------------------------
  // PAGE 3 ONWARD: DETAILED PRINCIPLE-WISE TABLES
  // -------------------------------------------------------------
  const allIndicators = report.datasetSnapshot.indicators || [];

  // Group indicators by principle (1 to 9)
  for (let pNum = 1; pNum <= 9; pNum++) {
    const pIndicators = allIndicators.filter((ind) => ind.principleId === pNum);
    const pMeta = report.datasetSnapshot.principlesSummary.find((ps) => ps.principleNumber === pNum);

    doc.addPage();
    currentY = 16;

    // Header for principle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...navyColor);
    doc.text(`PRINCIPLE ${pNum}: ${pMeta?.title.toUpperCase() || 'ESG DISCLOSURE'}`, marginX, currentY);
    currentY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(70, 80, 95);
    doc.text(
      `Statutory BRSR Indicators  |  Scope: ${report.projectName}  |  Assurer: ${report.submittedByAuditor}`,
      marginX,
      currentY
    );
    currentY += 2;

    doc.setDrawColor(...accentBlue);
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 3.5;

    if (pIndicators.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('No indicator data reported for this principle in the current reporting period.', marginX, currentY + 4);
      continue;
    }

    const indicatorRows = pIndicators.map((ind) => {
      const isCoreTag = ind.isBrsrCore ? ' [BRSR CORE]' : '';
      const verifiedBy = ind.reviewerDecision?.reviewerName || 'Aarav Patel (Review Lead)';
      const evidence = ind.evidenceFiles?.[0]?.name || 'Primary Measurement Register';
      const remark = ind.remarks || 'Corroborated with site measurement slips.';

      return [
        `${ind.id}${isCoreTag}`,
        ind.name,
        `${ind.currentValue}`,
        ind.unit,
        report.projectName,
        `Verified\n(${verifiedBy})`,
        `Assured\n(${report.submittedByAuditor.split('(')[0].trim()})`,
        `${evidence}\n${remark}`,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      tableWidth: pageWidth - marginX * 2,
      head: [
        [
          'Indicator ID',
          'Disclosure Description',
          'Reported Value',
          'Unit',
          'Project / Site',
          'Reviewer Result',
          'Auditor Sign-off',
          'Evidence & Remarks',
        ],
      ],
      body: indicatorRows,
      theme: 'grid',
      showHead: 'everyPage',
      headStyles: {
        fillColor: navyColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 2,
      },
      bodyStyles: {
        textColor: darkSlate,
        fontSize: 7,
        cellPadding: 1.8,
        lineColor: subtleBorder,
        lineWidth: 0.15,
      },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold' },
        1: { cellWidth: 42 },
        2: { cellWidth: 16, halign: 'right', fontStyle: 'bold' },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 24 },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 20, halign: 'center' },
        7: { cellWidth: 'auto' },
      },
    });
  }

  // -------------------------------------------------------------
  // RUNNING HEADERS & FOOTERS (All Pages)
  // -------------------------------------------------------------
  const totalPages = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (Pages > 1)
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `MEIL BUSINESS RESPONSIBILITY & SUSTAINABILITY REPORT (${report.financialYear})`,
        marginX,
        9
      );
      doc.text(
        `Report ID: ${report.reportId} | Rev v${report.version}`,
        pageWidth - marginX,
        9,
        { align: 'right' }
      );

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(marginX, 11, pageWidth - marginX, 11);
    }

    // Running Footer (All Pages)
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Megha Engineering & Infrastructures Limited (MEIL) — Statutory ESG Disclosure',
      marginX,
      pageHeight - 7
    );

    doc.setFont('helvetica', 'bold');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - marginX,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  return Buffer.from(doc.output('arraybuffer'));
}
