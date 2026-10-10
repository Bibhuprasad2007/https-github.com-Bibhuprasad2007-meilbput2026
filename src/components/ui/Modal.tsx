import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus modal
      modalRef.current?.focus();

      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }

      // Simple focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#060c18]/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} bg-white text-slate-900 rounded-t-2xl sm:rounded-xl shadow-2xl z-10 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 focus:outline-none max-h-[92vh] flex flex-col`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h3 id="modal-title" className="text-xl font-bold text-slate-900">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#003B73]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
