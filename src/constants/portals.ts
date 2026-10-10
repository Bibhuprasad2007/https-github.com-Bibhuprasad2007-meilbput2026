import { Settings2, FileText, Users, BarChart3, ShieldCheck } from 'lucide-react';
import type { PortalRole } from '../types/auth';

export interface PortalItem {
  id: PortalRole;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  allowsSelfRegistration: boolean;
}

export const PORTAL_OPTIONS: PortalItem[] = [
  {
    id: 'esg-admin',
    title: 'ESG Admin',
    shortTitle: 'ESG Administrator',
    icon: Settings2,
    description: 'System governance, organization settings, user authorization, and reporting cycle management.',
    allowsSelfRegistration: true,
  },
  {
    id: 'data-contributor',
    title: 'Data Contributor',
    shortTitle: 'Data Contributor',
    icon: FileText,
    description: 'Input environmental, social, and governance operational metrics across assigned business units.',
    allowsSelfRegistration: false,
  },
  {
    id: 'reviewer-approver',
    title: 'Reviewer / Approver',
    shortTitle: 'Reviewer & Approver',
    icon: Users,
    description: 'Verify submissions, manage workflow approvals, and ensure multi-tier data accuracy.',
    allowsSelfRegistration: false,
  },
  {
    id: 'management',
    title: 'Management',
    shortTitle: 'Executive Management',
    icon: BarChart3,
    description: 'High-level ESG performance visibility, sustainability progress, and corporate disclosure tracking.',
    allowsSelfRegistration: false,
  },
  {
    id: 'auditor-assurer',
    title: 'Auditor / Assurer',
    shortTitle: 'Auditor & Assurer',
    icon: ShieldCheck,
    description: 'Independent audit trail verification, compliance checks, and BRSR core assurance.',
    allowsSelfRegistration: false,
  },
];
