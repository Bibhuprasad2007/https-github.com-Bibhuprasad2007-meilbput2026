import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { BackendNotice } from '../common/BackendNotice';
import { OrganizationService } from '../../../services';
import type { OrganizationUnitInput } from '../../../types/services';
import { Building2, AlertCircle } from 'lucide-react';

interface AddOrgUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const INITIAL_FORM: OrganizationUnitInput = {
  entityType: 'Subsidiary',
  entityName: '',
  entityCode: '',
  parentEntity: '',
  sector: '',
  country: 'India',
  state: '',
  city: '',
  startDate: '',
  endDate: '',
  responsibleHead: '',
  isActive: true,
};

export const AddOrgUnitModal: React.FC<AddOrgUnitModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<OrganizationUnitInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.entityName.trim()) errs.entityName = 'Entity name is required';
    if (!formData.entityCode.trim()) errs.entityCode = 'Entity code is required';
    if (!formData.sector.trim()) errs.sector = 'Sector / business division is required';
    if (!formData.state.trim()) errs.state = 'State is required';
    if (!formData.city.trim()) errs.city = 'City is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await OrganizationService.createOrganizationUnit(formData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Backend connection is required to save this information.';
      onShowToast(message, 'warning');
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Organization Unit"
      subtitle="Register a new legal subsidiary, business unit, plant, or project scope"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800" noValidate>
        <BackendNotice message="Backend connection is required to save organization units. Form data will be validated but not stored." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Entity Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Entity Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.entityType}
              onChange={(e) =>
                setFormData({ ...formData, entityType: e.target.value as OrganizationUnitInput['entityType'] })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            >
              <option value="Subsidiary">Subsidiary</option>
              <option value="Business Unit">Business Unit</option>
              <option value="Project">Project</option>
              <option value="Plant">Plant</option>
              <option value="Department">Department</option>
            </select>
          </div>

          {/* Entity Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Entity Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.entityCode}
              onChange={(e) => setFormData({ ...formData, entityCode: e.target.value })}
              placeholder="e.g. MEIL-HYD-PLANT-01"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            {errors.entityCode && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.entityCode}
              </p>
            )}
          </div>

          {/* Entity Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Entity Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.entityName}
              onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
              placeholder="e.g. Hyderabad Manufacturing Facility Unit 1"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            {errors.entityName && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.entityName}
              </p>
            )}
          </div>

          {/* Parent Entity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Parent Entity
            </label>
            <select
              value={formData.parentEntity}
              onChange={(e) => setFormData({ ...formData, parentEntity: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            >
              <option value="">No parent entity (Root level)</option>
              <option disabled value="__disabled">Backend records required for parent selection</option>
            </select>
          </div>

          {/* Sector / Business Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Sector / Business Division <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            >
              <option value="">Select Sector...</option>
              <option value="Power & Energy">Power & Energy</option>
              <option value="Hydrocarbons & Petrochemicals">Hydrocarbons & Petrochemicals</option>
              <option value="Water Infrastructure & Irrigation">Water Infrastructure & Irrigation</option>
              <option value="Roads, Bridges & Metros">Roads, Bridges & Metros</option>
              <option value="Manufacturing & Heavy Engineering">Manufacturing & Heavy Engineering</option>
              <option value="Electric Mobility & Transport">Electric Mobility & Transport</option>
            </select>
            {errors.sector && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.sector}
              </p>
            )}
          </div>

          {/* Location Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              State <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Telangana"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            {errors.state && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.state}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Hyderabad"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
            {errors.city && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.city}
              </p>
            )}
          </div>

          {/* Responsible Head */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Responsible Head / Lead
            </label>
            <input
              type="text"
              value={formData.responsibleHead}
              onChange={(e) => setFormData({ ...formData, responsibleHead: e.target.value })}
              placeholder="e.g. Unit General Manager"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-[#003B73] border-slate-300 rounded focus:ring-[#003B73]"
              />
              <span className="text-sm text-slate-700 font-medium">Active in ESG Reporting Boundary</span>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#003B73] hover:bg-[#002B54] rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          >
            <Building2 className="w-4 h-4" />
            <span>Save Unit</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
