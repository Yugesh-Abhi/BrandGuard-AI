
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#05060B]/85 backdrop-blur-lg transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`
          relative z-10 my-8 w-full ${maxWidth}
          rounded-2xl
          bg-[#121420]
          border border-[#272A3B]
          shadow-2xl shadow-purple-950/30
          p-6
          text-[#EAF2FF]
          transform transition-all duration-300
        `}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#272A3B]">

          <div>
            <h3
              id="modal-title"
              className="text-xl font-bold text-white tracking-tight"
            >
              {title}
            </h3>

            {subtitle && (
              <p className="text-xs text-[#B0B8CA] mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="
              p-2 rounded-lg
              text-[#7D879C]
              hover:text-[#00E5FF]
              hover:bg-[#1B1E2D]
              transition-all duration-200
            "
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* Content */}
        <div className="mt-5">
          {children}
        </div>

      </div>
    </div>
  );
};
