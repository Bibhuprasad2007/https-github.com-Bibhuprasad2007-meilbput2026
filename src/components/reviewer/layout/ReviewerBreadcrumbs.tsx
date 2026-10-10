import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  reviewer: 'Reviewer Portal',
  dashboard: 'Dashboard',
  'review-queue': 'Review Queue',
  'submission-detail': 'Submission Detail',
  'validation-issues': 'Validation Issues',
  'evidence-review': 'Evidence Review',
  'activity-history': 'Activity History',
  settings: 'Settings',
};

export const ReviewerBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-slate-500">
      <Link
        to="/reviewer/dashboard"
        className="flex items-center gap-1 text-slate-500 hover:text-[#003B73] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Reviewer</span>
      </Link>

      {pathnames.map((segment, index) => {
        if (segment === 'reviewer' && index === 0) return null;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = ROUTE_LABELS[segment] || segment.replace(/-/g, ' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="text-slate-800 font-semibold truncate capitalize">{label}</span>
            ) : (
              <Link to={to} className="text-slate-500 hover:text-[#003B73] transition-colors truncate capitalize">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
