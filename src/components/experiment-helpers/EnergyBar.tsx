"use client";

import { Html } from "@react-three/drei";
import { JSX } from "react";

export interface EnergyBarProps {
  kinetic: number;
  potential: number;
  total?: number;
  position?: [number, number, number];
  showLabels?: boolean;
}

/**
 * Energy conservation visualization component
 * Shows kinetic, potential, and total energy as colored bars
 *
 * Based on principle: E_total = KE + PE = constant (for conservative systems)
 */
export default function EnergyBar({
  kinetic,
  potential,
  total,
  position = [0, 0, 0],
  showLabels = true,
}: EnergyBarProps): JSX.Element {
  // Calculate total if not provided
  const totalEnergy = total ?? kinetic + potential;
  const maxEnergy = totalEnergy * 1.2; // Add 20% headroom

  const kePercent = (kinetic / maxEnergy) * 100;
  const pePercent = (potential / maxEnergy) * 100;
  const totalPercent = (totalEnergy / maxEnergy) * 100;

  return (
    <Html position={position}>
      <div className="bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 min-w-[220px] shadow-2xl">
        {showLabels && (
          <h3 className="text-purple-400 font-semibold text-sm mb-3 border-b border-purple-500/30 pb-2">
            Energy
          </h3>
        )}
        <div className="space-y-3">
          {/* Kinetic Energy */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-orange-400">Kinetic (KE)</span>
              <span className="font-mono text-orange-400">{kinetic.toFixed(2)} J</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-100"
                style={{ width: `${kePercent}%` }}
              />
            </div>
          </div>

          {/* Potential Energy */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-400">Potential (PE)</span>
              <span className="font-mono text-blue-400">{potential.toFixed(2)} J</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-100"
                style={{ width: `${pePercent}%` }}
              />
            </div>
          </div>

          {/* Total Energy */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-400">Total (E)</span>
              <span className="font-mono text-green-400">{totalEnergy.toFixed(2)} J</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-100"
                style={{ width: `${totalPercent}%` }}
              />
            </div>
          </div>

          {/* Energy conservation indicator */}
          <div className="pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-500 text-center">
              Conservation: {((1 - Math.abs(kinetic + potential - totalEnergy) / (totalEnergy || 1)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
}

/**
 * Circular energy gauge component
 */
export function EnergyGauge({
  kinetic,
  potential,
  total,
  size = 80,
}: {
  kinetic: number;
  potential: number;
  total?: number;
  size?: number;
}) {
  const totalEnergy = total ?? kinetic + potential;
  const keRatio = kinetic / (totalEnergy || 1);
  const peRatio = potential / (totalEnergy || 1);

  const keAngle = keRatio * 360;
  const peAngle = peRatio * 360;

  return (
    <div
      className="relative rounded-full border-4 border-gray-700"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(
          from 90deg,
          #f97316 0deg ${keAngle}deg,
          #3b82f6 ${keAngle}deg ${keAngle + peAngle}deg
        )`,
      }}
    >
      <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs text-gray-400">Total</div>
          <div className="text-sm font-mono font-bold">{totalEnergy.toFixed(1)}</div>
          <div className="text-xs text-gray-500">Joules</div>
        </div>
      </div>
    </div>
  );
}
