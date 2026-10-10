import React from 'react';
import { AuditFindingsTable } from '../AuditFindingsTable';

export const AuditorFindingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <AuditFindingsTable />
    </div>
  );
};
