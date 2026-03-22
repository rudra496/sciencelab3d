"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  FloatingControlPanel,
  SimulationController,
  DataPanel,
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
  const router = useRouter();
  const [data, setData] = useState<PendulumData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

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
    setTimeElapsed(0);
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      {/* Physics Parameters */}
      <ControlGroup title="Physics Parameters">
        <ControlSlider label="Length (L)" value={length} unit="m" min={2} max={20} step={0.5} color="#a855f7" onChange={setLength} decimals={1} />
        <ControlSlider label="Mass (m)" value={mass} unit="kg" min={0.5} max={15} step={0.5} color="#06d6a0" onChange={setMass} decimals={1} />
        <ControlSlider label="Initial Angle" value={initialAngle} unit="°" min={5} max={170} step={1} color="#3b82f6" onChange={setInitialAngle} decimals={0} />
        <ControlSlider label="Damping" value={damping} unit="" min={0} max={0.1} step={0.001} color="#f59e0b" onChange={setDamping} decimals={3} />

        {/* Gravity with presets */}
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Gravity (g)</span>
            <span className="font-mono text-pink-600">{gravity.toFixed(2)} m/s²</span>
          </div>
          <input
            type="range" min="0" max="26" step="0.01" value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer touch-none"
            style={{ accentColor: "#ec4899" }}
          />
          <div className="flex flex-wrap gap-1.5 mt-1">
            {GRAVITY_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setGravity(p.value)}
                className={`px-2 py-1 text-xs rounded-md border transition-all ${
                  Math.abs(gravity - p.value) < 0.05
                    ? "bg-pink-600/30 border-pink-500 text-pink-700"
                    : "bg-gray-200/50 border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>
      </ControlGroup>

      {/* Display Options */}
      <ControlGroup title="Display Options">
        {[
          { label: "Motion Trail", checked: showTrail, onChange: setShowTrail },
          { label: "Force Vectors", checked: showVectors, onChange: setShowVectors },
          { label: "Angle Arc", checked: showAngleArc, onChange: setShowAngleArc },
          { label: "Protractor", checked: showProtractor, onChange: setShowProtractor },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input
              type="checkbox" checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
          </label>
        ))}
      </ControlGroup>

      {/* Details link */}
      <button
        onClick={() => router.push("/experiments/pendulum/details")}
        className="w-full py-2.5 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 font-medium text-sm rounded-lg transition-all border border-purple-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  // === DATA PANEL CONTENT ===
  const dataPanelContent = data ? (
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
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Waiting for simulation data...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Simple Pendulum"
        description="Explore oscillatory motion, energy conservation, and gravitational effects"
        cameraPosition={[30, 20, 30]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
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

      {/* Simulation Controller - Always Visible */}
      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={timeElapsed}
      />

      {/* Parameter Controls - Toggleable */}
      <FloatingControlPanel
        title="⚙️ Pendulum Parameters"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      {/* Data Panel - Floating Toggleable */}
      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
