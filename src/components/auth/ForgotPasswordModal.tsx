import React, { useState } from 'react';
import { Mail, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
  onSubmitSuccess: (message: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin,
  onSubmitSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Work email is required');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid work email address');
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setEmail('');
      onClose();
      onSubmitSuccess('Password recovery service will be connected in the next phase.');
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Password"
      subtitle="Enter your work email address to receive password recovery instructions."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
        <div>
          <label htmlFor="recovery-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Work Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="name@company.com"
              className={`w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border rounded-lg transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-[#003B73] focus:ring-sky-100'
              }`}
            />
          </div>
          {error && (
            <p className="flex items-center gap-1 text-xs text-rose-600 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-1/3 py-2.5 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-2/3 py-2.5 px-4 bg-[#003B73] hover:bg-[#002B54] text-white font-semibold text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Instructions</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
