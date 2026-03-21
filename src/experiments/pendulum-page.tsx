"use client";

import { useState } from "react";
import {
  PendulumSceneComponent,
  PendulumData,
} from "@/experiments/pendulum-scene";
import {
  ExperimentContainer,
  ControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  EnergyBar,
  DetailsModal,
  DetailsSection,
  DetailsFormulaList,
  DetailsButton,
} from "@/components/experiment-ui";

export default function PendulumExperimentPage() {
  const [data, setData] = useState<PendulumData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics parameters
  const [length, setLength] = useState(12);
  const [gravity, setGravity] = useState(9.81);
  const [mass, setMass] = useState(2);
  const [damping, setDamping] = useState(0.005);
  const [initialAngle, setInitialAngle] = useState(45);
  const [showTrail, setShowTrail] = useState(true);
  const [showVectors, setShowVectors] = useState(true);

  // Handlers
  const handlePlayPause = (playing: boolean) => setIsPlaying(playing);
  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };
  const handleSpeedChange = (speed: number) => setSimulationSpeed(speed);

  // Custom controls for ControlPanel
  const customControls = (
    <>
      <ControlGroup title="Physics Parameters">
        <ControlSlider
          label="Length (L)"
          value={length}
          unit="m"
          min={5}
          max={20}
          step={0.5}
          color="#a855f7"
          onChange={setLength}
          decimals={1}
        />
        <ControlSlider
          label="Gravity (g)"
          value={gravity}
          unit="m/s²"
          min={1}
          max={20}
          step={0.1}
          color="#ec4899"
          onChange={setGravity}
          decimals={1}
        />
        <ControlSlider
          label="Mass (m)"
          value={mass}
          unit="kg"
          min={0.5}
          max={10}
          step={0.5}
          color="#06d6a0"
          onChange={setMass}
          decimals={1}
        />
        <ControlSlider
          label="Damping"
          value={damping}
          unit=""
          min={0}
          max={0.05}
          step={0.001}
          color="#f59e0b"
          onChange={setDamping}
          decimals={3}
        />
        <ControlSlider
          label="Initial Angle"
          value={initialAngle}
          unit="°"
          min={5}
          max={80}
          step={1}
          color="#3b82f6"
          onChange={setInitialAngle}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Display Options">
        <label className="flex items-center justify-between text-xs sm:text-sm text-gray-300 cursor-pointer py-2 px-2 sm:px-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <span>Show Trail</span>
          <input
            type="checkbox"
            checked={showTrail}
            onChange={(e) => setShowTrail(e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500"
          />
        </label>
        <label className="flex items-center justify-between text-xs sm:text-sm text-gray-300 cursor-pointer py-2 px-2 sm:px-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <span>Show Vectors</span>
          <input
            type="checkbox"
            checked={showVectors}
            onChange={(e) => setShowVectors(e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500"
          />
        </label>
      </ControlGroup>
    </>
  );

  // Data panel
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
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
        <EnergyBar
          kinetic={data.kineticEnergy}
          potential={data.potentialEnergy}
          total={data.totalEnergy}
          maxEnergy={data.totalEnergy * 1.3}
        />
      </div>
    </>
  ) : null;

  // Details content
  const detailsContent = (
    <>
      <DetailsSection title="About Simple Pendulum" icon="🎯">
        <p className="text-sm leading-relaxed">
          A simple pendulum consists of a mass (bob) suspended from a fixed point by a string.
          When displaced from equilibrium and released, it oscillates back and forth under gravity.
        </p>
      </DetailsSection>

      <DetailsSection title="Key Physics Concepts" icon="💡">
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Period (T):</strong> Time for one oscillation. T = 2π√(L/g)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Frequency (f):</strong> Oscillations per second. f = 1/T</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Simple Harmonic Motion:</strong> Approximation for angles &lt; 15°</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Energy Conservation:</strong> KE + PE = constant (without damping)</span>
          </li>
        </ul>
      </DetailsSection>

      <DetailsSection title="Formulas" icon="📐">
        <DetailsFormulaList
          formulas={[
            { formula: "T = 2π√(L/g)", label: "Period", color: "text-purple-300" },
            { formula: "f = 1/T = (1/2π)√(g/L)", label: "Frequency", color: "text-pink-300" },
            { formula: "ω = √(g/L)", label: "Angular frequency", color: "text-green-300" },
            { formula: "KE = ½mv² = ½mL²(dθ/dt)²", label: "Kinetic energy", color: "text-blue-300" },
            { formula: "PE = mgh = mgL(1 - cosθ)", label: "Potential energy", color: "text-yellow-300" },
            { formula: "E = KE + PE", label: "Total energy", color: "text-green-300" },
          ]}
        />
      </DetailsSection>

      <DetailsSection title="Real-World Applications" icon="🔬">
        <ul className="space-y-2 text-sm">
          <li>• <strong className="text-white">Grandfather clocks</strong> — Timekeeping</li>
          <li>• <strong className="text-white">Seismographs</strong> — Earthquake detection</li>
          <li>• <strong className="text-white">Metronomes</strong> — Musical timing</li>
          <li>• <strong className="text-white">Foucault pendulum</strong> — Demonstrates Earth's rotation</li>
        </ul>
      </DetailsSection>

      <DetailsSection title="How to Use" icon="🎮">
        <ul className="space-y-2 text-sm">
          <li>• Adjust <strong className="text-purple-400">Length</strong> to see period change</li>
          <li>• Change <strong className="text-pink-400">Gravity</strong> for different planets</li>
          <li>• <strong className="text-green-400">Mass</strong> doesn't affect period (surprisingly!)</li>
          <li>• Use <strong className="text-blue-400">Damping</strong> to add air resistance</li>
          <li>• <strong className="text-orange-400">Play/Pause</strong> to freeze simulation</li>
          <li>• Adjust <strong className="text-yellow-400">Speed</strong> for slow-motion</li>
        </ul>
      </DetailsSection>
    </>
  );

  return (
    <>
      <ExperimentContainer
        title="Simple Pendulum"
        description="Explore simple harmonic motion with a realistic pendulum simulation"
        cameraPosition={[40, 30, 40]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
        details={detailsContent}
      >
        <PendulumSceneComponent
          onDataChange={setData}
          length={length}
          gravity={gravity}
          mass={mass}
          damping={damping}
          initialAngle={(initialAngle * Math.PI) / 180}
          showTrail={showTrail}
          showString={true}
          showVectors={showVectors}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          onReset={handleReset}
          resetTrigger={resetTrigger}
        />
      </ExperimentContainer>

      {/* Control Panel */}
      <ControlPanel
        title="Pendulum Controls"
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
        defaultPlaying={isPlaying}
        defaultSpeed={simulationSpeed}
      >
        {customControls}
      </ControlPanel>

      {/* Details Button */}
      <DetailsButton onClick={() => setShowDetails(true)} position="bottom-right" />

      {/* Details Modal */}
      <DetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Simple Pendulum - Experiment Details"
      >
        {detailsContent}
      </DetailsModal>
    </>
  );
}
