"use client";

import { Html } from "@react-three/drei";
import { JSX } from "react";

export interface DataItem {
  value: number;
  unit: string;
  color?: string;
  decimals?: number;
}

export interface DataDisplayProps {
  title: string;
  data: Record<string, { value: number; unit: string; color?: string; decimals?: number }>;
  position?: [number, number, number];
  className?: string;
}

/**
 * Real-time data display panel for experiments
 * Shows calculated values with units and optional color coding
 */
export default function DataDisplay({
  title,
  data,
  position = [0, 0, 0],
  className = "",
}: DataDisplayProps): JSX.Element {
  return (
    <Html position={position} className={className}>
      <div className="bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 min-w-[200px] shadow-2xl">
        <h3 className="text-purple-400 font-semibold text-sm mb-3 border-b border-purple-500/30 pb-2">
          {title}
        </h3>
        <div className="space-y-2">
          {Object.entries(data).map(([key, item]) => (
            <div key={key} className="flex justify-between items-center gap-4">
              <span className="text-gray-400 text-xs capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span
                className="font-mono text-sm font-medium"
                style={{ color: item.color || "#fff" }}
              >
                {item.value.toFixed(item.decimals ?? 2)} {item.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Html>
  );
}

/**
 * Compact data display for showing values inline
 */
export function CompactDataDisplay({
  value,
  unit,
  label,
  color = "#fff",
}: {
  value: number;
  unit: string;
  label: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400">{label}:</span>
      <span className="font-mono" style={{ color }}>
        {value.toFixed(2)} {unit}
      </span>
    </div>
  );
}
