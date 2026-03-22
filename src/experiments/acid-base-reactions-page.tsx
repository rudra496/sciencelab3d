"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AcidBaseReactionsSceneComponent, AcidBaseReactionsData } from "@/experiments/acid-base-reactions-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function AcidBaseReactionsPage() {
  const router = useRouter();
  const [data, setData] = useState<AcidBaseReactionsData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics
  const [acidStrength, setAcidStrength] = useState(5);
  const [baseStrength, setBaseStrength] = useState(5);
  const [temperature, setTemperature] = useState(298);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Reaction Parameters">
        <ControlSlider
          label="Acid Strength"
          value={acidStrength}
          unit="M"
          min={1}
          max={10}
          step={0.5}
          color="#ec4899"
          onChange={setAcidStrength}
          decimals={1}
        />
        <ControlSlider
          label="Base Strength"
          value={baseStrength}
          unit="M"
          min={1}
          max={10}
          step={0.5}
          color="#3b82f6"
          onChange={setBaseStrength}
          decimals={1}
        />
        <ControlSlider
          label="Temperature"
          value={temperature}
          unit="K"
          min={273}
          max={373}
          step={1}
          color="#ef4444"
          onChange={setTemperature}
          decimals={0}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/acid-base-reactions/details")}
        className="w-full py-2.5 bg-gradient-to-r from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300 text-pink-700 font-medium text-sm rounded-lg transition-all border border-pink-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  // === DATA PANEL CONTENT ===
  const dataPanelContent = data ? (
    <DataGrid
      data={{
        pH: { value: data.pH, unit: "", color: data.pH > 7 ? "#3b82f6" : data.pH < 7 ? "#ef4444" : "#22c55e", decimals: 2 },
        numAcid: { value: data.numAcid, unit: "mols", color: "#ef4444", decimals: 0 },
        numBase: { value: data.numBase, unit: "mols", color: "#3b82f6", decimals: 0 },
        numProduct: { value: data.numProduct, unit: "mols", color: "#22c55e", decimals: 0 },
        temperature: { value: data.temperature, unit: "K", color: "#f59e0b", decimals: 0 },
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
        title="Acid-Base Reactions"
        description="Explore neutralization reactions and pH changes"
        cameraPosition={[12, 8, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <AcidBaseReactionsSceneComponent
          onDataChange={setData}
          acidStrength={acidStrength}
          baseStrength={baseStrength}
          temperature={temperature}
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
        title="⚙️ Reaction Parameters"
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
