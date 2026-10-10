import React from 'react';
import { AlertCircle } from 'lucide-react';

interface BackendNoticeProps {
  message?: string;
  className?: string;
}

export const BackendNotice: React.FC<BackendNoticeProps> = ({
  message = 'Backend connection is required to save this information. In this prototype phase, form data is validated but not persisted.',
  className = '',
}) => {
  return (
    <div
      role="note"
      className={`flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-xs leading-relaxed ${className}`}
    >
      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-800 mb-0.5">Prototype Mode Notice</p>
        <p className="text-amber-700">{message}</p>
      </div>
    </div>
  );
};
