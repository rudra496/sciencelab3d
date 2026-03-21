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
    <div className="mb-6 last:mb-0">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 pb-2 border-b border-gray-700">
        {title}
      </h3>
      <div className="space-y-3">
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
    <div className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
      <span className="text-sm text-gray-400">{label}</span>
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
    <div className={`space-y-2 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="font-mono" style={{ color }}>
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
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
  return (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {Object.entries(data).map(([key, item]) => (
        <div
          key={key}
          className="flex items-center justify-between py-2 px-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
        >
          <span className="text-xs text-gray-400 capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </span>
          <span
            className="text-sm font-mono font-medium"
            style={{ color: item.color || "#fff" }}
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
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-orange-400">Kinetic (KE)</span>
          <span className="font-mono text-orange-400">{kinetic.toFixed(2)} J</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-100"
            style={{ width: `${(kinetic / max) * 100}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-blue-400">Potential (PE)</span>
          <span className="font-mono text-blue-400">{potential.toFixed(2)} J</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-100"
            style={{ width: `${(potential / max) * 100}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-green-400">Total (E)</span>
          <span className="font-mono text-green-400">{total.toFixed(2)} J</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-100"
            style={{ width: `${(total / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
