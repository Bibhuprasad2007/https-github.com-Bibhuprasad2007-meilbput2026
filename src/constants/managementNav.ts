import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Leaf,
  Users,
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  FileCheck2,
  FileSpreadsheet,
  History,
} from 'lucide-react';

export interface ManagementNavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const MANAGEMENT_NAV_ITEMS: ManagementNavigationItem[] = [
  { name: 'Executive Dashboard', path: '/management/dashboard', icon: LayoutDashboard },
  { name: 'ESG Overview', path: '/management/esg-overview', icon: BarChart3 },
  { name: 'Environmental', path: '/management/environmental', icon: Leaf },
  { name: 'Social', path: '/management/social', icon: Users },
  { name: 'Governance', path: '/management/governance', icon: ShieldCheck },
  { name: 'BRSR Readiness', path: '/management/brsr-readiness', icon: ClipboardCheck },
  { name: 'Risks & Exceptions', path: '/management/risks', icon: AlertTriangle },
  { name: 'Management Sign-Off', path: '/management/sign-off', icon: FileCheck2 },
  { name: 'Reports', path: '/management/reports', icon: FileSpreadsheet },
  { name: 'My Activity', path: '/management/activity', icon: History },
];
