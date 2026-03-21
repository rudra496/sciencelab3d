"use client";

import { ReactNode, useCallback, useEffect } from "react";

export interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Floating Details Modal with clean UI
 * - Triggered by floating button
 * - Shows explanation, formulas, applications
 * - Responsive and accessible
 */
export function DetailsModal({ isOpen, onClose, title, children }: DetailsModalProps): ReactNode {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Add keyboard listener
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-green-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-green-500/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-green-400">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors p-1 hover:bg-gray-700 rounded"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface DetailsSectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
}

/**
 * Individual section within Details Modal
 */
export function DetailsSection({ title, icon, children }: DetailsSectionProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      {children}
    </section>
  );
}

export interface DetailsFormulaProps {
  formula: string;
  label?: string;
  color?: string;
}

/**
 * Display a formula with syntax highlighting
 */
export function DetailsFormula({ formula, label, color = "text-purple-300" }: DetailsFormulaProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 font-mono text-sm">
      {label && <div className="text-xs text-gray-500 mb-1">{label}</div>}
      <div className={color}>{formula}</div>
    </div>
  );
}

export interface DetailsFormulaListProps {
  formulas: Array<{ formula: string; label?: string; color?: string }>;
}

/**
 * Display multiple formulas
 */
export function DetailsFormulaList({ formulas }: DetailsFormulaListProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-3">
      {formulas.map((item, index) => (
        <DetailsFormula key={index} {...item} />
      ))}
    </div>
  );
}

/**
 * Floating Details Button
 */
export interface DetailsButtonProps {
  onClick: () => void;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function DetailsButton({ onClick, position = "bottom-right" }: DetailsButtonProps) {
  const positionClasses = {
    "top-left": "top-20 left-4",
    "top-right": "top-20 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <button
      onClick={onClick}
      className={`
        fixed z-20 px-4 py-2
        bg-gradient-to-r from-green-600 to-green-700
        hover:from-green-500 hover:to-green-600
        text-white font-semibold text-sm rounded-lg
        transition-all duration-200 shadow-lg shadow-green-500/30
        flex items-center gap-2
        ${positionClasses[position]}
      `}
    >
      <span>ℹ</span>
      <span>Details</span>
    </button>
  );
}

export default DetailsModal;
