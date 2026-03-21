"use client";

import { useState, useCallback } from "react";
import {
  PendulumSceneComponent,
  PendulumData,
} from "@/experiments/pendulum-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  EnergyBar,
} from "@/components/experiment-ui";

/** Gravity presets */
const GRAVITY_PRESETS = [
  { label: "Earth", value: 9.81, emoji: "🌍" },
  { label: "Moon", value: 1.62, emoji: "🌙" },
  { label: "Mars", value: 3.72, emoji: "🔴" },
  { label: "Jupiter", value: 24.79, emoji: "🟠" },
  { label: "ISS", value: 0.0001, emoji: "🛸" },
];

export default function PendulumExperimentPage() {
  const [data, setData] = useState<PendulumData | null>(null);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics
  const [length, setLength] = useState(10);
  const [gravity, setGravity] = useState(9.81);
  const [mass, setMass] = useState(2);
  const [damping, setDamping] = useState(0.005);
  const [initialAngle, setInitialAngle] = useState(45);

  // Display
  const [showTrail, setShowTrail] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showAngleArc, setShowAngleArc] = useState(true);
  const [showProtractor, setShowProtractor] = useState(true);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };

  // === CONTROLS PANEL ===
  const controls = (
    <div className="space-y-5">
      {/* Playback */}
      <ControlGroup title="Simulation Controls">
        <div className="flex gap-2">
          <button
            onClick={handlePlayPause}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all shadow-lg ${
              isPlaying
                ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/30"
                : "bg-green-600 hover:bg-green-500 text-white shadow-green-500/30"
            }`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all shadow-lg"
          >
            🔄 Reset
          </button>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Speed</span>
            <span className="font-mono text-purple-400">{simulationSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range" min="0.1" max="3" step="0.1" value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer touch-none"
            style={{ accentColor: "#8b5cf6" }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.1x</span><span>1x</span><span>3x</span>
          </div>
        </div>
      </ControlGroup>

      {/* Physics */}
      <ControlGroup title="Physics Parameters">
        <ControlSlider label="Length (L)" value={length} unit="m" min={2} max={20} step={0.5} color="#a855f7" onChange={setLength} decimals={1} />
        <ControlSlider label="Mass (m)" value={mass} unit="kg" min={0.5} max={15} step={0.5} color="#06d6a0" onChange={setMass} decimals={1} />
        <ControlSlider label="Initial Angle" value={initialAngle} unit="°" min={5} max={170} step={1} color="#3b82f6" onChange={setInitialAngle} decimals={0} />
        <ControlSlider label="Damping" value={damping} unit="" min={0} max={0.1} step={0.001} color="#f59e0b" onChange={setDamping} decimals={3} />

        {/* Gravity with presets */}
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gravity (g)</span>
            <span className="font-mono text-pink-400">{gravity.toFixed(2)} m/s²</span>
          </div>
          <input
            type="range" min="0" max="26" step="0.01" value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer touch-none"
            style={{ accentColor: "#ec4899" }}
          />
          <div className="flex flex-wrap gap-1.5 mt-1">
            {GRAVITY_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setGravity(p.value)}
                className={`px-2 py-1 text-xs rounded-md border transition-all ${
                  Math.abs(gravity - p.value) < 0.05
                    ? "bg-pink-600/30 border-pink-500 text-pink-300"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>
      </ControlGroup>

      {/* Display */}
      <ControlGroup title="Display Options">
        {[
          { label: "Motion Trail", checked: showTrail, onChange: setShowTrail },
          { label: "Force Vectors", checked: showVectors, onChange: setShowVectors },
          { label: "Angle Arc", checked: showAngleArc, onChange: setShowAngleArc },
          { label: "Protractor", checked: showProtractor, onChange: setShowProtractor },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-300 cursor-pointer py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <span>{opt.label}</span>
            <input
              type="checkbox" checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
          </label>
        ))}
      </ControlGroup>
    </div>
  );

  // === DATA PANEL ===
  const dataPanel = data ? (
    <>
      <DataGrid
        data={{
          period: { value: data.period, unit: "s", color: "#a855f7", decimals: 3 },
          measured: { value: data.periodMeasured || data.period, unit: "s", color: "#c084fc", decimals: 3 },
          angle: { value: data.angleDeg, unit: "°", color: "#06d6a0", decimals: 1 },
          angVel: { value: data.angularVelocity, unit: "rad/s", color: "#f59e0b" },
          vel: { value: data.tangentialVelocity, unit: "m/s", color: "#22c55e" },
          osc: { value: data.oscillations, unit: "", color: "#818cf8", decimals: 0 },
        }}
        columns={2}
      />
      <div className="mt-3 pt-3 border-t border-gray-700">
        <EnergyBar
          kinetic={data.kineticEnergy}
          potential={data.potentialEnergy}
          total={data.totalEnergy}
          maxEnergy={data.totalEnergy * 1.3 || 1}
        />
      </div>
    </>
  ) : null;

  // === DETAILS ===
  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">🎯 About Simple Pendulum</h3>
        <p className="text-sm leading-relaxed">
          A simple pendulum is a mass (bob) suspended from a fixed point by a massless, inextensible string.
          When displaced from its equilibrium position and released, it oscillates under the influence of gravity.
          This is one of the most fundamental systems in classical mechanics and demonstrates simple harmonic motion for small angles.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">💡 Key Physics Concepts</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Restoring Force:</strong> F = -mg sin(θ), always directed toward equilibrium</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Simple Harmonic Motion:</strong> For small angles (θ &lt; 15°), sin(θ) ≈ θ, giving SHM</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Isochronism:</strong> Period is independent of mass and amplitude (for small angles)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Energy Conservation:</strong> KE + PE = constant (without damping)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Large-Angle Correction:</strong> For large angles, T increases as θ₀²/16</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">📐 Formulas</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-3">
          <div><span className="text-gray-500 text-xs">Equation of motion:</span><br /><span className="text-purple-300">θ&#x0308; = -(g/L)sin(θ) - b·θ&#x0307;</span></div>
          <div><span className="text-gray-500 text-xs">Period (small angle):</span><br /><span className="text-pink-300">T = 2π√(L/g)</span></div>
          <div><span className="text-gray-500 text-xs">Period (large angle correction):</span><br /><span className="text-pink-300">T ≈ T₀(1 + θ₀²/16 + 11θ₀⁴/3072)</span></div>
          <div><span className="text-gray-500 text-xs">Angular frequency:</span><br /><span className="text-green-300">ω = √(g/L)</span></div>
          <div><span className="text-gray-500 text-xs">Kinetic energy:</span><br /><span className="text-blue-300">KE = ½mL²(dθ/dt)²</span></div>
          <div><span className="text-gray-500 text-xs">Potential energy:</span><br /><span className="text-yellow-300">PE = mgL(1 - cosθ)</span></div>
          <div><span className="text-gray-500 text-xs">Total energy:</span><br /><span className="text-green-300">E = KE + PE = constant</span></div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">🔬 Real-World Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong className="text-white">Grandfather clocks</strong> — Pendulum regulates timekeeping</li>
          <li>• <strong className="text-white">Foucault pendulum</strong> — Demonstrates Earth&apos;s rotation (1851)</li>
          <li>• <strong className="text-white">Seismographs</strong> — Detect and measure earthquakes</li>
          <li>• <strong className="text-white">Metronomes</strong> — Keep musical tempo</li>
          <li>• <strong className="text-white">Torsion pendulum</strong> — Measures gravitational constant (Cavendish experiment)</li>
          <li>• <strong className="text-white">Pendulum waves</strong> — Visual demonstration of wave mechanics</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">🎮 How to Use</h3>
        <ul className="space-y-2 text-sm">
          <li>• Adjust <strong className="text-purple-400">Length</strong> — longer pendulum = longer period</li>
          <li>• Try <strong className="text-pink-400">gravity presets</strong> — see how pendulum behaves on Moon vs Jupiter</li>
          <li>• <strong className="text-green-400">Mass</strong> doesn&apos;t affect period (Galileo&apos;s discovery!)</li>
          <li>• Large <strong className="text-blue-400">angles</strong> break the small-angle approximation</li>
          <li>• Enable <strong className="text-orange-400">Force Vectors</strong> to see gravity, tension, and net force</li>
          <li>• Watch the <strong className="text-yellow-400">energy bars</strong> — KE↔PE exchange in real time</li>
          <li>• Use <strong className="text-purple-400">Speed</strong> slider for slow-motion analysis</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">🧠 Interesting Facts</h3>
        <ul className="space-y-2 text-sm">
          <li>• Galileo discovered pendulum isochronism by watching a chandelier swing in Pisa Cathedral (1582)</li>
          <li>• A pendulum 1 meter long has a period of approximately 2 seconds</li>
          <li>• The Foucault pendulum at the Panthéon in Paris takes ~32 hours to complete a full rotation</li>
          <li>• On the ISS (microgravity), a pendulum simply won&apos;t oscillate — try the ISS preset!</li>
        </ul>
      </section>
    </div>
  );

  return (
    <ExperimentContainer
      title="Simple Pendulum"
      description="Explore oscillatory motion, energy conservation, and gravitational effects with an advanced pendulum simulation"
      cameraPosition={[30, 20, 30]}
      backgroundColor="#050510"
      controls={controls}
      dataPanel={dataPanel}
      details={details}
      simulationBar={{
        isPlaying,
        onPlayPause: handlePlayPause,
        onReset: handleReset,
        speed: simulationSpeed,
        onSpeedChange: setSimulationSpeed,
      }}
    >
      <PendulumSceneComponent
        onDataChange={setData}
        length={length}
        gravity={gravity}
        mass={mass}
        damping={damping}
        initialAngle={(initialAngle * Math.PI) / 180}
        showTrail={showTrail}
        showVectors={showVectors}
        showAngleArc={showAngleArc}
        showProtractor={showProtractor}
        isPlaying={isPlaying}
        simulationSpeed={simulationSpeed}
        resetTrigger={resetTrigger}
      />
    </ExperimentContainer>
  );
}
