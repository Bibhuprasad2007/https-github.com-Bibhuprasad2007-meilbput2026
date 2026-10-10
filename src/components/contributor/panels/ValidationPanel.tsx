import React from 'react';
import { ClipboardCheck, AlertTriangle, Info, XCircle } from 'lucide-react';
import { EmptyState } from '../../admin/common/EmptyState';
import type { ValidationResultItem } from '../../../types/contributor';

interface ValidationPanelProps {
  validationResults?: ValidationResultItem[];
  onTriggerValidation?: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validationResults = [],
  onTriggerValidation,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-900">
            Multi-Tier Automated ESG Data Quality &amp; Validation Checks
          </p>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            The validation subsystem executes automated checks including mandatory fields, numerical range thresholds, unit compliance, temporal period consistency, mandatory evidence attachment, and year-on-year variance anomalies.
          </p>
        </div>
      </div>

      {validationResults.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <EmptyState
            icon={ClipboardCheck}
            title="Validation rules are not available for this assignment."
            description="Automated validation results and consistency checks will display here once the assignment service and BRSR rule engine are connected."
            actionText={onTriggerValidation ? 'Run Validation Check' : undefined}
            onAction={onTriggerValidation}
          />
        </div>
      ) : (
        /* Results List (When results available from backend) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Validation Findings</h3>
            <span className="text-xs text-slate-500 font-medium">
              {validationResults.length} checks evaluated
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {validationResults.map((item) => {
              const isError = item.severity === 'error';
              const isWarning = item.severity === 'warning';

              return (
                <div key={item.id} className="p-4 flex items-start gap-3">
                  {isError ? (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {item.ruleCode}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          isError
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isWarning
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{item.ruleName}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{item.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
