"use client";

import { useState } from "react";
import { PendulumSceneComponent, PendulumData } from "@/experiments/pendulum-scene";
import { ExperimentContainer } from "@/components/experiment-ui/ExperimentContainer";
import { ControlGroup, ControlSlider, DataGrid, EnergyBar } from "@/components/experiment-ui/ExperimentControls";

// Experiment configuration state interface
interface PendulumConfig {
  length: number;
  gravity: number;
  mass: number;
  damping: number;
  initialAngle: number;
  showTrail: boolean;
  showPhaseSpace: boolean;
  showString: boolean;
}

export default function PendulumExperimentPage() {
  const [data, setData] = useState<PendulumData | null>(null);
  const [config, setConfig] = useState<PendulumConfig>({
    length: 12,
    gravity: 9.81,
    mass: 2,
    damping: 0.005,
    initialAngle: 45,
    showTrail: true,
    showPhaseSpace: false,
    showString: true,
  });
  const [resetTrigger, setResetTrigger] = useState(0);

  // Reset function
  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
  };

  // Update config helper
  const updateConfig = (key: keyof PendulumConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Controls panel content
  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Physics Parameters">
        <ControlSlider
          label="Length (L)"
          value={config.length}
          unit="m"
          min={5}
          max={20}
          step={0.5}
          color="#a855f7"
          onChange={(v) => updateConfig("length", v)}
        />
        <ControlSlider
          label="Gravity (g)"
          value={config.gravity}
          unit="m/s²"
          min={1}
          max={20}
          step={0.1}
          color="#ec4899"
          onChange={(v) => updateConfig("gravity", v)}
        />
        <ControlSlider
          label="Mass (m)"
          value={config.mass}
          unit="kg"
          min={0.5}
          max={10}
          step={0.5}
          color="#06d6a0"
          onChange={(v) => updateConfig("mass", v)}
        />
        <ControlSlider
          label="Damping"
          value={config.damping}
          unit=""
          min={0}
          max={0.1}
          step={0.001}
          color="#f59e0b"
          onChange={(v) => updateConfig("damping", v)}
          decimals={3}
        />
        <ControlSlider
          label="Initial Angle"
          value={config.initialAngle}
          unit="°"
          min={5}
          max={80}
          step={1}
          color="#3b82f6"
          onChange={(v) => updateConfig("initialAngle", v)}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Display Options">
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
            <span>Show Motion Trail</span>
            <input
              type="checkbox"
              checked={config.showTrail}
              onChange={(e) => updateConfig("showTrail", e.target.checked)}
              className="w-5 h-5 rounded accent-purple-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
            <span>Show Phase Space</span>
            <input
              type="checkbox"
              checked={config.showPhaseSpace}
              onChange={(e) => updateConfig("showPhaseSpace", e.target.checked)}
              className="w-5 h-5 rounded accent-purple-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
            <span>Show String</span>
            <input
              type="checkbox"
              checked={config.showString}
              onChange={(e) => updateConfig("showString", e.target.checked)}
              className="w-5 h-5 rounded accent-purple-500"
            />
          </label>
        </div>
      </ControlGroup>

      <button
        onClick={handleReset}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/30"
      >
        🔄 Reset Simulation
      </button>
    </div>
  );

  // Data panel content
  const dataPanel = data ? (
    <>
      <DataGrid
        data={{
          period: { value: data.period, unit: "s", color: "#a855f7" },
          frequency: { value: data.frequency, unit: "Hz", color: "#ec4899" },
          angle: { value: data.angleDeg, unit: "°", color: "#06d6a0", decimals: 1 },
          angVel: { value: data.angularVelocity, unit: "rad/s", color: "#f59e0b" },
        }}
        columns={2}
      />
      <div className="mt-4 pt-4 border-t border-gray-700">
        <EnergyBar
          kinetic={data.kineticEnergy}
          potential={data.potentialEnergy}
          total={data.totalEnergy}
          maxEnergy={data.totalEnergy * 1.3}
        />
      </div>
    </>
  ) : null;

  // Details/Info panel content
  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About Simple Pendulum</h3>
        <p className="text-sm leading-relaxed">
          A simple pendulum consists of a mass (bob) suspended from a fixed point by a string of negligible mass.
          When displaced from equilibrium and released, it oscillates back and forth under the influence of gravity.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Physics Concepts</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Period (T):</strong> Time for one complete oscillation. For small angles: T = 2π√(L/g)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Frequency (f):</strong> Number of oscillations per second. f = 1/T</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Simple Harmonic Motion:</strong> For angles &lt; 15°, motion is approximately SHM</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Energy Conservation:</strong> Total energy = KE + PE = constant (without damping)</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Formulas</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-2">
          <div className="text-purple-300">Period: T = 2π√(L/g)</div>
          <div className="text-pink-300">Angular Frequency: ω = √(g/L)</div>
          <div className="text-green-300">Kinetic Energy: KE = ½mv²</div>
          <div className="text-blue-300">Potential Energy: PE = mgh = mgL(1 - cosθ)</div>
          <div className="text-yellow-300">Total Energy: E = KE + PE</div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Controls Guide</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong className="text-white">Length:</strong> Longer pendulums have longer periods</li>
          <li>• <strong className="text-white">Gravity:</strong> Higher gravity = faster oscillations</li>
          <li>• <strong className="text-white">Mass:</strong> Does NOT affect period (surprisingly!)</li>
          <li>• <strong className="text-white">Damping:</strong> Air resistance/friction slows motion over time</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Real-World Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• Grandfather clocks</li>
          <li>• Seismographs for earthquake detection</li>
          <li>• Metronomes for musicians</li>
          <li>• Foucault pendulum demonstrates Earth's rotation</li>
        </ul>
      </section>
    </div>
  );

  return (
    <ExperimentContainer
      title="Simple Pendulum"
      description="Explore simple harmonic motion with a realistic pendulum simulation. Adjust length, mass, and gravity to observe how they affect the period."
      cameraPosition={[40, 30, 40]}
      backgroundColor="#050510"
      controls={controls}
      dataPanel={dataPanel}
      details={details}
    >
      <PendulumSceneComponent
        onDataChange={setData}
        length={config.length}
        gravity={config.gravity}
        mass={config.mass}
        damping={config.damping}
        initialAngle={(config.initialAngle * Math.PI) / 180}
        showTrail={config.showTrail}
        showPhaseSpace={config.showPhaseSpace}
        showString={config.showString}
        resetTrigger={resetTrigger}
      />
    </ExperimentContainer>
  );
}
