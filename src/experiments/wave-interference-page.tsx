"use client";

import { useState } from "react";
import {
  WaveInterferenceSceneComponent,
  WaveData,
} from "@/experiments/wave-interference-scene";
import {
  ExperimentContainer,
  ControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  DetailsModal,
  DetailsSection,
  DetailsFormulaList,
  DetailsButton,
} from "@/components/experiment-ui";

export default function WaveInterferencePage() {
  const [data, setData] = useState<WaveData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics parameters
  const [frequency, setFrequency] = useState(2);
  const [amplitude, setAmplitude] = useState(0.8);
  const [sourceSeparation, setSourceSeparation] = useState(4);
  const [waveSpeed, setWaveSpeed] = useState(3);
  const [showNodes, setShowNodes] = useState(true);

  // Handlers
  const handlePlayPause = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setFrequency(2);
    setAmplitude(0.8);
    setSourceSeparation(4);
    setWaveSpeed(3);
  };

  const handleSpeedChange = (speed: number) => {
    setSimulationSpeed(speed);
  };

  // Custom controls for the ControlPanel
  const customControls = (
    <>
      <ControlGroup title="Wave Parameters">
        <ControlSlider
          label="Frequency"
          value={frequency}
          unit="Hz"
          min={0.5}
          max={5}
          step={0.1}
          color="#8b5cf6"
          onChange={setFrequency}
          decimals={1}
        />
        <ControlSlider
          label="Amplitude"
          value={amplitude}
          unit=""
          min={0.1}
          max={2}
          step={0.1}
          color="#ec4899"
          onChange={setAmplitude}
          decimals={1}
        />
        <ControlSlider
          label="Source Separation"
          value={sourceSeparation}
          unit="m"
          min={1}
          max={10}
          step={0.5}
          color="#06b6d4"
          onChange={setSourceSeparation}
          decimals={1}
        />
        <ControlSlider
          label="Wave Speed"
          value={waveSpeed}
          unit="m/s"
          min={1}
          max={10}
          step={0.5}
          color="#22c55e"
          onChange={setWaveSpeed}
          decimals={1}
        />
      </ControlGroup>

      <ControlGroup title="Display Options">
        <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <span>Show Interference Pattern</span>
          <input
            type="checkbox"
            checked={showNodes}
            onChange={(e) => setShowNodes(e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500"
          />
        </label>
      </ControlGroup>
    </>
  );

  // Data panel
  const dataPanel = data ? (
    <DataGrid
      data={{
        wavelength: {
          value: data.wavelength,
          unit: "m",
          color: "#8b5cf6",
          decimals: 2,
        },
        frequency: {
          value: frequency,
          unit: "Hz",
          color: "#ec4899",
          decimals: 1,
        },
        maxIntensity: {
          value: data.maxIntensity,
          unit: "",
          color: "#06b6d4",
          decimals: 2,
        },
        antinodes: {
          value: data.constructiveCount,
          unit: "pts",
          color: "#22c55e",
          decimals: 0,
        },
        nodes: {
          value: data.destructiveCount,
          unit: "pts",
          color: "#ef4444",
          decimals: 0,
        },
      }}
      columns={2}
    />
  ) : null;

  // Details content
  const detailsContent = (
    <>
      <DetailsSection title="About Wave Interference" icon="🌊">
        <p className="text-sm leading-relaxed">
          Wave interference occurs when two or more waves overlap in space. The resulting wave
          is the sum of the individual waves. This experiment demonstrates the interference
          pattern created by two coherent point sources in a water tank.
        </p>
      </DetailsSection>

      <DetailsSection title="Key Concepts" icon="💡">
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>
              <strong className="text-white">Superposition Principle:</strong> When waves overlap,
              their displacements add algebraically
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>
              <strong className="text-white">Constructive Interference:</strong> Waves in phase
              create larger amplitude (antinodes)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>
              <strong className="text-white">Destructive Interference:</strong> Waves out of
              phase cancel each other (nodes)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>
              <strong className="text-white">Path Difference:</strong> Determines interference
              type: Δr = mλ (constructive) or Δr = (m+½)λ (destructive)
            </span>
          </li>
        </ul>
      </DetailsSection>

      <DetailsSection title="Formulas" icon="📐">
        <DetailsFormulaList
          formulas={[
            {
              formula: "y = A·sin(kr - ωt)",
              label: "Wave equation",
              color: "text-purple-300",
            },
            {
              formula: "λ = v/f",
              label: "Wavelength (speed/frequency)",
              color: "text-pink-300",
            },
            {
              formula: "k = 2π/λ",
              label: "Wave number",
              color: "text-cyan-300",
            },
            {
              formula: "ω = 2πf",
              label: "Angular frequency",
              color: "text-green-300",
            },
            {
              formula: "Δr = mλ (constructive)",
              label: "Path difference for constructive",
              color: "text-green-300",
            },
            {
              formula: "Δr = (m+½)λ (destructive)",
              label: "Path difference for destructive",
              color: "text-red-300",
            },
          ]}
        />
      </DetailsSection>

      <DetailsSection title="Real-World Applications" icon="🔬">
        <ul className="space-y-2 text-sm">
          <li>• <strong className="text-white">Acoustics:</strong> Noise cancellation headphones use destructive interference</li>
          <li>• <strong className="text-white">Optics:</strong> Thin film interference (soap bubbles, oil slicks)</li>
          <li>• <strong className="text-white">Radio:</strong> Antenna arrays for directional transmission</li>
          <li>• <strong className="text-white">Medical Imaging:</strong> Ultrasound and MRI use wave interference principles</li>
          <li>• <strong className="text-white">Quantum Mechanics:</strong> Electron double-slit experiment</li>
        </ul>
      </DetailsSection>

      <DetailsSection title="How to Use" icon="🎮">
        <ul className="space-y-2 text-sm">
          <li>• Adjust <strong className="text-purple-400">Frequency</strong> to change wave oscillation rate</li>
          <li>• Change <strong className="text-pink-400">Amplitude</strong> to modify wave height</li>
          <li>• Move <strong className="text-cyan-400">Source Separation</strong> to see pattern changes</li>
          <li>• Use <strong className="text-green-400">Play/Pause</strong> to freeze the simulation</li>
          <li>• Adjust <strong className="text-yellow-400">Speed</strong> for slow-motion analysis</li>
          <li>• Green circles = antinodes (constructive)</li>
          <li>• Red X marks = nodes (destructive)</li>
        </ul>
      </DetailsSection>
    </>
  );

  return (
    <>
      <ExperimentContainer
        title="Wave Interference"
        description="Explore the interference pattern created by two coherent wave sources. Observe constructive and destructive interference in real-time."
        cameraPosition={[25, 20, 25]}
        backgroundColor="#050510"
        controls={null} // Using ControlPanel instead
        dataPanel={dataPanel}
        details={detailsContent}
      >
        <WaveInterferenceSceneComponent
          onDataChange={setData}
          frequency={frequency}
          amplitude={amplitude}
          sourceSeparation={sourceSeparation}
          waveSpeed={waveSpeed}
          showNodes={showNodes}
          showIntensity={true}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          onReset={handleReset}
          resetTrigger={resetTrigger}
        />
      </ExperimentContainer>

      {/* Floating Control Panel */}
      <ControlPanel
        title="Wave Controls"
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
        title="Wave Interference - Experiment Details"
      >
        {detailsContent}
      </DetailsModal>
    </>
  );
}
