"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DoubleSlitSceneComponent,
  DoubleSlitData,
} from "@/experiments/double-slit-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function DoubleSlitPage() {
  const router = useRouter();
  const [data, setData] = useState<DoubleSlitData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Quantum parameters
  const [wavelength, setWavelength] = useState(500);
  const [slitSeparation, setSlitSeparation] = useState(2);
  const [slitWidth, setSlitWidth] = useState(0.3);
  const [particleRate, setParticleRate] = useState(3);

  // Display options
  const [showParticles, setShowParticles] = useState(true);
  const [showWaveView, setShowWaveView] = useState(false);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };

  // Color based on wavelength
  const wavelengthColor = `hsl(${540 - wavelength * 0.6}, 100%, 50%)`;

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Quantum Parameters">
        <ControlSlider
          label="Wavelength (λ)"
          value={wavelength}
          unit="nm"
          min={380}
          max={700}
          step={10}
          color={wavelengthColor}
          onChange={setWavelength}
          decimals={0}
        />
        <ControlSlider
          label="Slit Separation (d)"
          value={slitSeparation}
          unit="mm"
          min={0.5}
          max={5}
          step={0.1}
          color="#ec4899"
          onChange={setSlitSeparation}
          decimals={1}
        />
        <ControlSlider
          label="Slit Width (a)"
          value={slitWidth}
          unit="mm"
          min={0.1}
          max={1}
          step={0.05}
          color="#22c55e"
          onChange={setSlitWidth}
          decimals={2}
        />
        <ControlSlider
          label="Fire Rate"
          value={particleRate}
          unit="/s"
          min={1}
          max={10}
          step={1}
          color="#8b5cf6"
          onChange={setParticleRate}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Display Options">
        {[
          { label: "Show Particles", checked: showParticles, onChange: setShowParticles },
          { label: "Theory Curve", checked: showWaveView, onChange: setShowWaveView },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
          </label>
        ))}
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/double-slit/details")}
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
          wavelength: { value: data.wavelength, unit: "nm", color: wavelengthColor, decimals: 0 },
          fringeSpacing: { value: data.fringeSpacing, unit: "mm", color: "#a855f7", decimals: 3 },
          slitSeparation: { value: data.slitSeparation, unit: "mm", color: "#ec4899", decimals: 2 },
          particleCount: { value: data.particleCount, unit: "", color: "#22c55e", decimals: 0 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-purple-400">Wave-Particle Duality:</strong> Individual particles hit randomly but accumulate to form an interference pattern.
        </p>
        <p className="text-xs text-gray-500 mt-2 font-mono">
          I(y) = cos²(π·d·y/λ·L) · sinc²(π·a·y/λ·L)
        </p>
      </div>
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Starting simulation...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Double-Slit Experiment"
        description="Quantum mechanics: particles build up wave interference patterns"
        cameraPosition={[25, 15, 25]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <DoubleSlitSceneComponent
          onDataChange={setData}
          wavelength={wavelength}
          slitSeparation={slitSeparation}
          slitWidth={slitWidth}
          particleRate={particleRate}
          showParticles={showParticles}
          showWaveView={showWaveView}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
      />

      <FloatingControlPanel
        title="⚛️ Quantum Parameters"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
