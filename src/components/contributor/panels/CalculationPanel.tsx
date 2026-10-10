import React from 'react';
import { Calculator, Info, Cpu } from 'lucide-react';
import { EmptyState } from '../../admin/common/EmptyState';
import type { CalculationRuleMetadata } from '../../../types/contributor';

interface CalculationPanelProps {
  calculationRule?: CalculationRuleMetadata | null;
}

export const CalculationPanel: React.FC<CalculationPanelProps> = ({ calculationRule = null }) => {
  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">
            ESG &amp; Carbon Calculation Engine Transparency
          </p>
          <p className="text-slate-600 leading-relaxed">
            Standard ESG calculations (e.g. Scope 1 direct emissions, Scope 2 grid electricity, water intensity, and energy conversion) are calculated transparently using official backend emission factor tables (CEA, IPCC, DEFRA). No unverified factor constants are used in frontend prototypes.
          </p>
        </div>
      </div>

      {!calculationRule ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <EmptyState
            icon={Calculator}
            title="No calculation rule is configured for this disclosure."
            description="When emission factors, standard conversion rates, or intensity formulas are configured for this metric by the ESG Admin, the real-time calculation pipeline will display here."
          />
        </div>
      ) : (
        /* Calculation Breakdown Grid (When rule configured) */
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Cpu className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Calculation Pipeline Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Activity Data
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {calculationRule.activityData || '--'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Activity Unit
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {calculationRule.activityUnit || '--'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Emission Factor
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {calculationRule.emissionFactor !== undefined ? calculationRule.emissionFactor : '--'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Factor Source &amp; Version
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {calculationRule.emissionFactorSource
                  ? `${calculationRule.emissionFactorSource} (${calculationRule.emissionFactorVersion || 'Latest'})`
                  : '--'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Conversion Factor
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {calculationRule.conversionFactor !== undefined ? calculationRule.conversionFactor : '--'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Calculated Output
              </p>
              <p className="text-sm font-bold text-teal-800 mt-1">
                {calculationRule.calculatedOutput !== undefined ? calculationRule.calculatedOutput : '--'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Output Unit
              </p>
              <p className="text-sm font-bold text-teal-800 mt-1">
                {calculationRule.outputUnit || '--'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Calculation Rule Code
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                --
              </p>
            </div>
          </div>

          {/* Formula Display */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Active Calculation Formula
            </p>
            <code className="text-xs font-mono text-slate-800 block">
              {calculationRule.calculationFormula || 'Output = Activity Data × Emission Factor × Conversion Factor'}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};
