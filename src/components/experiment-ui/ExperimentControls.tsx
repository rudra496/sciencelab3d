"use client";

import { ReactNode } from "react";

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
