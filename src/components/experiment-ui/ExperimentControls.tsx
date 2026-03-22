"use client";

import { ReactNode, useState } from "react";

export interface ControlGroupProps {
  title: string;
  children: ReactNode;
}

/**
 * Grouped controls section
 */
export function ControlGroup({ title, children }: ControlGroupProps) {
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 pb-2 border-b border-gray-300">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

export interface ControlItemProps {
  label: string;
  value: number | string;
  unit?: string;
  color?: string;
}

/**
 * Individual control display item
 */
export function ControlItem({ label, value, unit, color = "#a855f7" }: ControlItemProps) {
  const displayValue = typeof value === "number" ? value.toFixed(2) : value;

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-sm font-mono font-bold" style={{ color }}>
        {displayValue}
        {unit && <span className="text-xs text-gray-500 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

export interface ControlSliderProps {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step: number;
  color?: string;
  onChange: (value: number) => void;
  decimals?: number;
  disabled?: boolean;
}

/**
 * Interactive slider control
 */
export function ControlSlider({ label, value, unit, min, max, step, color = "#a855f7", onChange, decimals = 2, disabled = false }: ControlSliderProps) {
  return (
    <div className={`space-y-1 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex justify-between text-xs">
        <span className="text-gray-700">{label}</span>
        <span className="font-mono text-xs" style={{ color }}>
          {decimals === 0 ? value.toFixed(0) : value.toFixed(decimals)}
          {unit && <span className="text-xs text-gray-500 ml-1">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 touch-none"
        style={{ accentColor: color }}
      />
    </div>
  );
}

export interface DataGridProps {
  data: Record<string, { value: number; unit: string; color?: string; decimals?: number }>;
  columns?: 1 | 2 | 3;
}

/**
 * Grid layout for data display
 */
export function DataGrid({ data, columns = 1 }: DataGridProps) {
  // Use a lookup object to avoid dynamic Tailwind classes
  const colClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
  };

  return (
    <div className={`grid ${colClasses[columns] || "grid-cols-1"} gap-2`}>
      {Object.entries(data).map(([key, item]) => (
        <div
          key={key}
          className="flex items-center justify-between py-1.5 px-2 bg-gray-100/30 rounded-lg border border-gray-300/30"
        >
          <span className="text-xs text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </span>
          <span
            className="text-xs font-mono font-medium"
            style={{ color: item.color || "#333" }}
          >
            {item.value.toFixed(item.decimals ?? 2)} {item.unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export interface EnergyBarProps {
  kinetic: number;
  potential: number;
  total: number;
  maxEnergy?: number;
}

/**
 * Energy bar visualization
 */
export function EnergyBar({ kinetic, potential, total, maxEnergy }: EnergyBarProps) {
  const max = maxEnergy || total * 1.2;

  return (
    <div className="space-y-2">
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-orange-400">Kinetic (KE)</span>
          <span className="font-mono text-orange-400 text-xs">{kinetic.toFixed(2)} J</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-orange-600 to-orange-400 transition-all duration-100"
            style={{ width: `${(kinetic / max) * 100}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-blue-400">Potential (PE)</span>
          <span className="font-mono text-blue-400 text-xs">{potential.toFixed(2)} J</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-600 to-blue-400 transition-all duration-100"
            style={{ width: `${(potential / max) * 100}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-green-400">Total (E)</span>
          <span className="font-mono text-green-400 text-xs">{total.toFixed(2)} J</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-green-600 to-green-400 transition-all duration-100"
            style={{ width: `${(total / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NEW UNIVERSAL CONTROL COMPONENTS
// ============================================================================

export interface DropdownOption {
  label: string;
  value: string;
  emoji?: string;
  color?: string;
}

export interface ControlDropdownProps<T extends string = string> {
  label: string;
  value: T;
  options: DropdownOption[];
  onChange: (value: T) => void;
  color?: string;
  disabled?: boolean;
}

/**
 * Dropdown control for selecting from a list of options
 * Replaces Leva's select/options controls
 */
export function ControlDropdown<T extends string = string>({
  label,
  value,
  options,
  onChange,
  color = "#a855f7",
  disabled = false
}: ControlDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`space-y-1 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex justify-between text-xs">
        <span className="text-gray-700">{label}</span>
      </div>
      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full flex items-center justify-between py-2 px-3 bg-white rounded-lg border-2 text-left text-sm transition-all"
          style={{ borderColor: color, opacity: disabled ? 0.5 : 1 }}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.emoji && <span>{selectedOption.emoji}</span>}
            <span className="font-medium" style={{ color }}>
              {selectedOption?.label || value}
            </span>
          </span>
          <span className="text-gray-400">{isOpen ? "▲" : "▼"}</span>
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border-2 shadow-lg overflow-hidden"
               style={{ borderColor: color }}>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value as T);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 py-2 px-3 text-left text-sm transition-colors ${
                  option.value === value ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                {option.emoji && <span>{option.emoji}</span>}
                <span style={{ color: option.color || color }}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "warning";

const BUTTON_STYLES: Record<ButtonVariant, { bg: string; hover: string; shadow: string }> = {
  primary: {
    bg: "bg-gradient-to-r from-blue-600 to-blue-700",
    hover: "hover:from-blue-500 hover:to-blue-600",
    shadow: "shadow-blue-500/40"
  },
  secondary: {
    bg: "bg-gradient-to-r from-gray-600 to-gray-700",
    hover: "hover:from-gray-500 hover:to-gray-600",
    shadow: "shadow-gray-500/40"
  },
  danger: {
    bg: "bg-gradient-to-r from-red-600 to-red-700",
    hover: "hover:from-red-500 hover:to-red-600",
    shadow: "shadow-red-500/40"
  },
  success: {
    bg: "bg-gradient-to-r from-green-600 to-green-700",
    hover: "hover:from-green-500 hover:to-green-600",
    shadow: "shadow-green-500/40"
  },
  warning: {
    bg: "bg-gradient-to-r from-orange-600 to-orange-700",
    hover: "hover:from-orange-500 hover:to-orange-600",
    shadow: "shadow-orange-500/40"
  }
};

export interface ControlButtonProps {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  icon?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Button control for actions (Start, Reset, Add Drop, etc.)
 * Replaces Leva's button controls
 */
export function ControlButton({
  label,
  onClick,
  variant = "primary",
  icon,
  disabled = false,
  fullWidth = false,
  size = "md"
}: ControlButtonProps) {
  const style = BUTTON_STYLES[variant];
  
  const sizeClasses: Record<"sm" | "md" | "lg", string> = {
    sm: "py-2 px-3 text-xs",
    md: "py-2.5 px-4 text-sm",
    lg: "py-3 px-5 text-base"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 font-semibold rounded-lg
        transition-all shadow-lg ${style.bg} ${style.hover} ${style.shadow}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${fullWidth ? "w-full" : ""}
        ${sizeClasses[size]}
        text-white
      `}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

export interface ControlCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  disabled?: boolean;
}

/**
 * Checkbox control for boolean toggles
 * Replaces Leva's boolean controls
 */
export function ControlCheckbox({
  label,
  checked,
  onChange,
  color = "#a855f7",
  disabled = false
}: ControlCheckboxProps) {
  return (
    <label className={`
      flex items-center justify-between text-sm text-gray-700
      cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg
      border border-gray-300/50 transition-all
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}
    `}>
      <span>{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`
          w-10 h-6 rounded-full transition-colors duration-200
          ${checked ? "opacity-100" : "opacity-40"}
        `} style={{ backgroundColor: color }} />
        <div className={`
          absolute top-1 left-1 w-4 h-4 bg-white rounded-full
          shadow transition-transform duration-200
          ${checked ? "translate-x-4" : "translate-x-0"}
        `} />
      </div>
    </label>
  );
}

export interface PresetOption {
  label: string;
  value: number | string;
  emoji?: string;
  color?: string;
}

export interface ControlPresetButtonsProps {
  label: string;
  value: number | string;
  presets: PresetOption[];
  onChange: (value: number | string) => void;
  displayValue?: (value: number | string) => string;
}

/**
 * Preset buttons for quick selection (like gravity presets)
 */
export function ControlPresetButtons({
  label,
  value,
  presets,
  onChange,
  displayValue
}: ControlPresetButtonsProps) {
  const isActive = (presetValue: number | string) => {
    if (typeof presetValue === "number" && typeof value === "number") {
      return Math.abs(presetValue - value) < 0.05;
    }
    return presetValue === value;
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-mono text-pink-600">
          {displayValue ? displayValue(value) : String(value)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onChange(preset.value)}
            className={`
              px-2 py-1 text-xs rounded-md border transition-all
              ${isActive(preset.value)
                ? "bg-pink-600/30 border-pink-500 text-pink-700"
                : "bg-gray-200/50 border-gray-300 text-gray-600 hover:border-gray-400"
              }
            `}
          >
            {preset.emoji && <span className="mr-1">{preset.emoji}</span>}
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface ControlProgressBarProps {
  label: string;
  value: number; // 0 to 1
  color?: string;
  showPercentage?: boolean;
}

/**
 * Progress bar for showing reaction/animation progress
 */
export function ControlProgressBar({
  label,
  value,
  color = "#22c55e",
  showPercentage = true
}: ControlProgressBarProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-700">{label}</span>
        {showPercentage && (
          <span className="font-mono text-xs" style={{ color }}>
            {percentage}%
          </span>
        )}
      </div>
      <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}
