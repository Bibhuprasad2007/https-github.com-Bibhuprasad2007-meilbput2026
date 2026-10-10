import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarClock,
  Layers,
  ClipboardList,
  Activity,
  AlertTriangle,
  FileCheck2,
  CheckSquare,
  Settings,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const ADMIN_NAV_ITEMS: NavigationItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Organization', path: '/admin/organization', icon: Building2 },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Reporting Periods', path: '/admin/reporting-periods', icon: CalendarClock },
  { name: 'Indicator Master', path: '/admin/indicator-master', icon: Layers },
  { name: 'Data Collection', path: '/admin/data-collection', icon: ClipboardList },
  { name: 'Validation Rules', path: '/admin/validation-rules', icon: AlertTriangle },
  { name: 'Evidence Configuration', path: '/admin/evidence-configuration', icon: FileCheck2 },
  { name: 'BRSR Control Center', path: '/admin/brsr-control-center', icon: Activity },
  { name: 'BRSR Core', path: '/admin/brsr-core', icon: Activity },
  { name: 'Consolidation', path: '/admin/consolidation', icon: Layers },
  { name: 'Assessment', path: '/admin/assessment', icon: CheckSquare },
  { name: 'Reports', path: '/admin/reports', icon: ClipboardList },
  { name: 'Notifications', path: '/admin/notifications', icon: AlertTriangle },
  { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileCheck2 },
  { name: 'System Settings', path: '/admin/settings', icon: Settings },
];
