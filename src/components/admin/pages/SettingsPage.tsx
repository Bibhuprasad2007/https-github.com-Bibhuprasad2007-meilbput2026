import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Building,
  Scale,
  Flame,
  Gauge,
  Bell,
  Shield,
  Database,
  Save,
} from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { BackendNotice } from '../common/BackendNotice';
import { SettingsService } from '../../../services';
import type { SettingsInput } from '../../../types/services';

interface OutletContextType {
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SettingsPage: React.FC = () => {
  const { addToast } = useOutletContext<OutletContextType>();
  const [activeTab, setActiveTab] = useState<
    'org' | 'units' | 'emissions' | 'thresholds' | 'notifications' | 'security' | 'governance'
  >('org');

  const [formData, setFormData] = useState<SettingsInput>({
    organizationName: '',
    legalEntityCode: '',
    corporateAddress: '',
    contactEmail: '',
    defaultCurrency: '',
    measurementUnitSystem: '',
    emissionFactorVersion: '',
    varianceThresholdPercent: undefined,
    mandatoryApprovalsCount: undefined,
    enableEmailAlerts: false,
    twoFactorEnforced: false,
    retentionPeriodYears: undefined,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await SettingsService.saveSettings(formData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Backend connection is required to save settings.';
      addToast(message, 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const SETTING_TABS = [
    { id: 'org', label: 'Organization Profile', icon: Building },
    { id: 'units', label: 'Units & Conversion', icon: Scale },
    { id: 'emissions', label: 'Emission Factors', icon: Flame },
    { id: 'thresholds', label: 'Validation Thresholds', icon: Gauge },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'governance', label: 'Data Governance', icon: Database },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration & ESG Governance Settings"
        description="Global portal parameters, GHG emission factor libraries, validation anomaly thresholds, notification policies, and data retention rules."
      />

      {/* Tabs and Form Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1 h-fit">
          {SETTING_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-[#003B73] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content Area */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSave} className="space-y-6" noValidate>
            <BackendNotice message="Backend connection is required to save configuration parameters. Settings are not persisted during prototype evaluation." />

            {/* Tab 1: Organization Profile */}
            {activeTab === 'org' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Corporate Organization Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) =>
                        setFormData({ ...formData, organizationName: e.target.value })
                      }
                      placeholder="Enter legal entity name"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Corporate Identity / CIN
                    </label>
                    <input
                      type="text"
                      value={formData.legalEntityCode}
                      onChange={(e) =>
                        setFormData({ ...formData, legalEntityCode: e.target.value })
                      }
                      placeholder="Enter corporate identification number"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Registered Corporate Address
                    </label>
                    <input
                      type="text"
                      value={formData.corporateAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, corporateAddress: e.target.value })
                      }
                      placeholder="Enter registered headquarters address"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Corporate ESG Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, contactEmail: e.target.value })
                      }
                      placeholder="esg@meil.in"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Reporting Currency
                    </label>
                    <input
                      type="text"
                      value={formData.defaultCurrency}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultCurrency: e.target.value })
                      }
                      placeholder="e.g. INR (₹ Lakhs / Crores)"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Units & Conversion */}
            {activeTab === 'units' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Standard Measurement Units & Conversion Rules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Energy Consumption Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Joules / GigaJoules (GJ) or MWh"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Water Consumption Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kilolitres (kL) / MegaLitres"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      GHG Emissions Metric
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Metric Tonnes CO₂ equivalent (tCO₂e)"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Waste Generation Metric
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Metric Tonnes (MT)"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Emission Factors */}
            {activeTab === 'emissions' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  GHG Emission Factor Library (IPCC / CEA Database)
                </h3>
                <p className="text-xs text-slate-500">
                  All emission factor tables start blank until synchronized with official Central Electricity Authority (CEA) CO₂ baseline and IPCC AR6 database.
                </p>
                <div className="p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                  <Flame className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No Custom Emission Factors Configured</p>
                  <p className="text-xs text-slate-400 mt-1">Factors will synchronize upon backend integration.</p>
                </div>
              </div>
            )}

            {/* Tab 4: Validation Thresholds */}
            {activeTab === 'thresholds' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Automated Anomaly & Outlier Thresholds
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      YoY Variance Warning Threshold (%)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Critical Blocker Threshold (%)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Notification & Escalation Policies
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.enableEmailAlerts}
                      onChange={(e) =>
                        setFormData({ ...formData, enableEmailAlerts: e.target.checked })
                      }
                      className="w-4 h-4 text-[#003B73] border-slate-300 rounded focus:ring-[#003B73]"
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      Dispatch automated email alerts for pending submission deadlines
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 6: Security */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Authentication & Security Protocols
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.twoFactorEnforced}
                      onChange={(e) =>
                        setFormData({ ...formData, twoFactorEnforced: e.target.checked })
                      }
                      className="w-4 h-4 text-[#003B73] border-slate-300 rounded focus:ring-[#003B73]"
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      Enforce Multi-Factor Authentication (MFA) for all Administrator and Reviewer roles
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 7: Data Governance */}
            {activeTab === 'governance' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Data Governance & Audit Retention Policies
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Statutory Evidence Retention Period (Years)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 8"
                    className="w-full max-w-xs px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                  />
                  <p className="text-xs text-slate-400 mt-1">SEBI compliance standard mandates a minimum of 8 years retention.</p>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#003B73] hover:bg-[#002B54] rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#003B73]"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
