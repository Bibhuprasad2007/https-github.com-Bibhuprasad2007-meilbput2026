import React, { useState } from 'react';
import {
  UserCheck,
  Bell,
  Shield,
  Monitor,
  Info,
} from 'lucide-react';
import { PageHeader } from '../../admin/common/PageHeader';
import { BackendNotice } from '../../admin/common/BackendNotice';
import { useDemoAuth } from '../../../context/DemoAuthContext';

type SettingsTab = 'profile' | 'notifications' | 'preferences';

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile', label: 'Profile & Role', icon: UserCheck },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell },
  { id: 'preferences', label: 'Review Preferences', icon: Monitor },
];

export const ReviewerSettingsPage: React.FC = () => {
  const { session } = useDemoAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviewer Settings"
        description="Manage your reviewer profile, notification preferences, and review workflow preferences."
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex" aria-label="Settings tabs">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#003B73] text-[#003B73] font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-14 h-14 rounded-full bg-sky-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {(session?.user?.name || 'DR').charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {session?.user?.name || 'Demo Reviewer'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {session?.user?.email || 'demo.reviewer@meil.test'}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    <Shield className="w-3 h-3" />
                    <span>Role: Reviewer / Approver</span>
                  </div>
                </div>
              </div>

              {/* Profile Form (Disabled) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: session?.user?.name || '--', placeholder: 'Full name' },
                  { label: 'Work Email', value: session?.user?.email || '--', placeholder: 'Email address' },
                  { label: 'Department', value: '--', placeholder: 'Department' },
                  { label: 'Employee ID', value: '--', placeholder: 'Employee ID' },
                  { label: 'Assigned Entity / Scope', value: '--', placeholder: 'Assigned scope' },
                  { label: 'Contact Number', value: '--', placeholder: 'Phone number' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={field.value}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>

              <BackendNotice message="Profile details are managed by the ESG Administrator. Changes require backend user management service." />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Configure which notifications you receive during the review workflow. All notification preferences require backend service integration.
              </p>

              {[
                { label: 'New submissions assigned for review', description: 'Receive alerts when new BRSR disclosure submissions are assigned to your review queue.' },
                { label: 'Correction resubmissions', description: 'Get notified when a contributor resubmits data after a correction request.' },
                { label: 'Approaching review deadlines', description: 'Reminder notifications when review deadlines are approaching (3 days, 1 day before).' },
                { label: 'Validation flag alerts', description: 'Receive alerts when automated validation detects critical issues in assigned submissions.' },
                { label: 'Evidence upload notifications', description: 'Receive notifications when contributors upload new evidence documents for your assigned disclosures.' },
                { label: 'Admin announcements', description: 'Notifications from the ESG Admin regarding reporting cycle changes, policy updates, or system maintenance.' },
              ].map((pref) => (
                <div key={pref.label} className="flex items-start justify-between gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{pref.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{pref.description}</p>
                  </div>
                  <div className="shrink-0">
                    <button
                      type="button"
                      disabled
                      className="relative w-10 h-5 rounded-full bg-slate-200 cursor-not-allowed transition-colors"
                      title="Requires backend service"
                    >
                      <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                <Info className="w-3.5 h-3.5" />
                <span>Notification delivery channels (Email, In-App, SMS) are configured by the ESG Administrator.</span>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Customize your review workflow preferences. These settings personalize the review experience.
              </p>

              {/* Default Queue View */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Default Queue Sort Order
                </label>
                <select
                  disabled
                  className="w-full max-w-sm px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                >
                  <option>Due Date (Earliest First)</option>
                  <option>Submitted Date (Newest First)</option>
                  <option>Section (A → C)</option>
                  <option>Severity (Critical First)</option>
                </select>
              </div>

              {/* Items Per Page */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Items Per Page
                </label>
                <select
                  disabled
                  className="w-full max-w-sm px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                >
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>

              {/* Auto-expand validation checks */}
              <div className="flex items-start justify-between gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Auto-expand validation checks</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Automatically display validation check results when viewing a submission detail.</p>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    disabled
                    className="relative w-10 h-5 rounded-full bg-slate-200 cursor-not-allowed transition-colors"
                    title="Requires backend service"
                  >
                    <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" />
                  </button>
                </div>
              </div>

              {/* Compact table mode */}
              <div className="flex items-start justify-between gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Compact table mode</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reduce row padding in data tables for denser information display.</p>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    disabled
                    className="relative w-10 h-5 rounded-full bg-slate-200 cursor-not-allowed transition-colors"
                    title="Requires backend service"
                  >
                    <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" />
                  </button>
                </div>
              </div>

              <BackendNotice message="Review preferences will be persisted to your user profile once the backend user settings service is connected." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
