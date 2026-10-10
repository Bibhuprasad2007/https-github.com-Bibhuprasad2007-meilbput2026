import React, { useState } from 'react';
import { PORTAL_OPTIONS } from '../../constants/portals';
import type { PortalRole } from '../../types/auth';
import { Modal } from '../ui/Modal';
import { RoleLoginForm } from './RoleLoginForm';
import { AdminRegistrationForm } from './AdminRegistrationForm';

interface AuthModalProps {
  selectedRole: PortalRole | null;
  isOpen: boolean;
  onClose: () => void;
  onForgotPassword: () => void;
  onSubmitSuccess: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  selectedRole,
  isOpen,
  onClose,
  onForgotPassword,
  onSubmitSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  if (!selectedRole) return null;

  const currentPortal = PORTAL_OPTIONS.find((p) => p.id === selectedRole) || PORTAL_OPTIONS[0];
  const isEsgAdmin = selectedRole === 'esg-admin';

  const modalTitle = isEsgAdmin 
    ? 'ESG Admin Portal'
    : `${currentPortal.title} Portal`;

  const modalSubtitle = isEsgAdmin
    ? activeTab === 'login'
      ? 'Sign in to access corporate ESG governance tools'
      : 'Register the primary Company Administrator for your organization'
    : currentPortal.description;

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      maxWidth={activeTab === 'register' && isEsgAdmin ? 'max-w-lg' : 'max-w-md'}
    >
      {/* ESG Admin Multi-tab Interface */}
      {isEsgAdmin ? (
        <div>
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 mb-5">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors duration-150 focus:outline-none ${
                activeTab === 'login'
                  ? 'border-[#003B73] text-[#003B73]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('register')}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors duration-150 focus:outline-none ${
                activeTab === 'register'
                  ? 'border-[#E31E24] text-[#E31E24]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Register Company Admin
            </button>
          </div>

          {/* Active Tab Form */}
          {activeTab === 'login' ? (
            <RoleLoginForm
              roleId={selectedRole}
              roleTitle={currentPortal.title}
              onForgotPassword={onForgotPassword}
              onSubmitSuccess={(msg) => {
                onClose();
                onSubmitSuccess(msg);
              }}
            />
          ) : (
            <AdminRegistrationForm
              onSubmitSuccess={(msg) => {
                onClose();
                onSubmitSuccess(msg);
              }}
            />
          )}
        </div>
      ) : (
        /* Non-Admin Direct Login Form */
        <RoleLoginForm
          roleId={selectedRole}
          roleTitle={currentPortal.title}
          onForgotPassword={onForgotPassword}
          onSubmitSuccess={(msg) => {
            onClose();
            onSubmitSuccess(msg);
          }}
        />
      )}
    </Modal>
  );
};
