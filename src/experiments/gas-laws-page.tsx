"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  GasLawsSceneComponent,
  GasData,
} from "@/experiments/gas-laws-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function GasLawsPage() {
  const router = useRouter();
  const [data, setData] = useState<GasData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Physics
  const [temperature, setTemperature] = useState(300);
  const [volume, setVolume] = useState(5);
  const [numParticles, setNumParticles] = useState(100);

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
      <ControlGroup title="Gas Law Parameters">
        <ControlSlider
          label="Temperature (T)"
          value={temperature}
          unit="K"
          min={100}
          max={800}
          step={10}
          color="#06d6a0"
          onChange={setTemperature}
          decimals={0}
        />
        <ControlSlider
          label="Volume (V)"
          value={volume}
          unit="L"
          min={1}
          max={10}
          step={0.5}
          color="#a855f7"
          onChange={setVolume}
          decimals={1}
        />
        <ControlSlider
          label="Particles (n)"
          value={numParticles}
          unit=""
          min={20}
          max={200}
          step={10}
          color="#22c55e"
          onChange={setNumParticles}
          decimals={0}
        />
      </ControlGroup>

      {/* Details link */}
      <button
        onClick={() => router.push("/experiments/gas-laws/details")}
        className="w-full py-2.5 bg-gradient-to-r from-emerald-100 to-emerald-200 hover:from-emerald-200 hover:to-emerald-300 text-emerald-700 font-medium text-sm rounded-lg transition-all border border-emerald-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  // === DATA PANEL CONTENT ===
  const dataPanelContent = data ? (
    <DataGrid
      data={{
        temperature: { value: temperature, unit: "K", color: "#06d6a0", decimals: 0 },
        volume: { value: volume, unit: "L", color: "#a855f7", decimals: 1 },
        pressure: { value: data.pressure / 1000, unit: "kPa", color: "#ec4899", decimals: 1 },
        avgSpeed: { value: data.avgSpeed, unit: "m/s", color: "#f59e0b", decimals: 2 },
      }}
      columns={2}
    />
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Waiting for simulation data...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Gas Laws (Ideal Gas)"
        description="Explore PV = nRT with interactive particle simulation"
        cameraPosition={[30, 22, 30]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <GasLawsSceneComponent
          onDataChange={setData}
          temperature={temperature}
          volume={volume}
          numParticles={numParticles}
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
        title="⚙️ Gas Law Parameters"
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
