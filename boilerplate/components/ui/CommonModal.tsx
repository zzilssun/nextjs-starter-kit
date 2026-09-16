import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string; // e.g., 'max-w-lg', 'max-w-xl', 'max-w-2xl'
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  headerExtra?: ReactNode;
  description?: string;
  hideCloseButton?: boolean;
  showHeader?: boolean;
  contentPadding?: string;
  panelClassName?: string;
}

/**
 * [Common Modal Component]
 * - Uses React Portal to render at document.body level (Fixes Z-Index stacking context issues)
 * - Fixed Z-Index: z-[100] (Always on top)
 * - Fixed Header: Title + Close Button
 * - Scrollable Content: overflow-y-auto
 * - Keyboard Accessibility: ESC to close (closeOnEsc)
 * - WAI-ARIA Compliant: role="dialog", aria-modal="true"
 */
export const CommonModal = ({
  isOpen,
  onClose,
  title = "",
  children,
  footer,
  maxWidth = "max-w-lg",
  closeOnBackdropClick = true,
  closeOnEsc = true,
  headerExtra,
  description,
  hideCloseButton = false,
  showHeader = true,
  contentPadding = "p-5",
  panelClassName = "",
}: CommonModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "common-modal-title" : undefined}
    >
      <div
        className={`bg-white text-gray-900 rounded-xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh] overflow-hidden animate-slideUp ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Fixed) */}
        {showHeader && (
          <div className="px-5 py-4 flex justify-between items-center flex-shrink-0 bg-gray-50 border-b border-gray-100">
            <div className="flex-1 min-w-0 pr-4">
              {title && (
                <h3 id="common-modal-title" className="font-bold text-lg text-gray-900 truncate">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs font-medium mt-0.5 text-gray-500">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {headerExtra}
              {!hideCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content (Scrollable) */}
        <div className={`flex-1 overflow-y-auto ${contentPadding} relative`}>{children}</div>

        {/* Footer (Fixed if provided) */}
        {footer && (
          <div className="px-5 py-4 flex justify-end gap-2 flex-shrink-0 border-t border-gray-100 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
