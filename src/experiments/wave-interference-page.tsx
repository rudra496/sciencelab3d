"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  WaveInterferenceSceneComponent,
  WaveData,
} from "@/experiments/wave-interference-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
  ControlCheckbox,
} from "@/components/experiment-ui";

export default function WaveInterferencePage() {
  const router = useRouter();
  const [data, setData] = useState<WaveData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation state
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics parameters
  const [frequency, setFrequency] = useState(2);
  const [amplitude, setAmplitude] = useState(1);
  const [wavelength, setWavelength] = useState(3);
  const [sourceSeparation, setSourceSeparation] = useState(6);
  const [showNodes, setShowNodes] = useState(true);

  const handlePlayPause = () => setIsPlaying((p) => !p);

  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };

  // Calculate derived wave speed for display
  const waveSpeed = wavelength * frequency;

  // Parameter controls
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Wave Parameters">
        <ControlSlider
          label="Frequency"
          value={frequency}
          unit="Hz"
          min={0.5}
          max={5}
          step={0.1}
          color="#ff4444"
          onChange={setFrequency}
          decimals={1}
        />
        <ControlSlider
          label="Wavelength"
          value={wavelength}
          unit="m"
          min={1}
          max={8}
          step={0.25}
          color="#4444ff"
          onChange={setWavelength}
          decimals={2}
        />
        <ControlSlider
          label="Amplitude"
          value={amplitude}
          unit=""
          min={0.2}
          max={2}
          step={0.1}
          color="#aa44ff"
          onChange={setAmplitude}
          decimals={1}
        />
        <ControlSlider
          label="Source Separation"
          value={sourceSeparation}
          unit="m"
          min={2}
          max={12}
          step={0.5}
          color="#00cc88"
          onChange={setSourceSeparation}
          decimals={1}
        />
      </ControlGroup>

      <ControlGroup title="Display Options">
        <ControlCheckbox
          label="Show Interference Nodes"
          checked={showNodes}
          onChange={setShowNodes}
          color="#00cc88"
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/wave-interference/details")}
        className="w-full py-2.5 bg-gradient-to-r from-red-100 via-purple-100 to-blue-100 hover:from-red-200 hover:via-purple-200 hover:to-blue-200 text-gray-700 font-medium text-sm rounded-lg transition-all border border-gray-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  // Data panel content
  const dataPanelContent = data ? (
    <DataGrid
      data={{
        wavelength: { value: data.wavelength, unit: "m", color: "#4444ff", decimals: 2 },
        frequency: { value: data.frequency, unit: "Hz", color: "#ff4444", decimals: 1 },
        sourceSep: { value: data.sourceSeparation, unit: "m", color: "#00cc88", decimals: 1 },
        waveSpeed: { value: data.waveSpeed, unit: "m/s", color: "#aa44ff", decimals: 1 },
        maxAmp: { value: data.maxAmplitude, unit: "m", color: "#ff8800", decimals: 2 },
        constructive: { value: data.constructiveNodes, unit: "", color: "#00ff88", decimals: 0 },
        destructive: { value: data.destructiveNodes, unit: "", color: "#ffaa00", decimals: 0 },
      }}
      columns={2}
    />
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Initializing simulation...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Wave Interference"
        description="Observe constructive and destructive interference patterns from two wave sources"
        cameraPosition={[30, 22, 30]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <WaveInterferenceSceneComponent
          onDataChange={setData}
          frequency={frequency}
          amplitude={amplitude}
          wavelength={wavelength}
          sourceSeparation={sourceSeparation}
          showNodes={showNodes}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
        />
      </ExperimentContainer>

      {/* Simulation Controller */}
      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
      />

      {/* Parameter Controls */}
      <FloatingControlPanel
        title="⚙️ Parameters"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      {/* Data Panel */}
      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
