"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ElectrolysisSceneComponent, ElectrolysisData } from "@/experiments/electrolysis-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function ElectrolysisPage() {
  const router = useRouter();
  const [data, setData] = useState<ElectrolysisData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics
  const [voltage, setVoltage] = useState(5);
  const [electrolyte, setElectrolyte] = useState<"water" | "copper-sulfate">("water");

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Electrolysis Parameters">
        <ControlSlider
          label="Voltage"
          value={voltage}
          unit="V"
          min={1}
          max={10}
          step={0.5}
          color="#3b82f6"
          onChange={setVoltage}
          decimals={1}
        />
      </ControlGroup>

      <ControlGroup title="Electrolyte Type">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setElectrolyte("water")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              electrolyte === "water"
                ? "bg-blue-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            💧 Water
          </button>
          <button
            onClick={() => setElectrolyte("copper-sulfate")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              electrolyte === "copper-sulfate"
                ? "bg-blue-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            🔵 CuSO₄
          </button>
        </div>
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/electrolysis/details")}
        className="w-full py-2.5 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 font-medium text-sm rounded-lg transition-all border border-blue-300/50 flex items-center justify-center gap-2"
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
          h2: { value: data.h2Produced, unit: "bubbles", color: "#8b5cf6", decimals: 0 },
          o2: { value: data.o2Produced, unit: "bubbles", color: "#ff6b35", decimals: 0 },
          voltage: { value: data.voltage, unit: "V", color: "#f59e0b", decimals: 1 },
          ratio: { value: data.h2Produced / Math.max(1, data.o2Produced), unit: ":1", color: "#06d6a0", decimals: 1 },
        }}
        columns={2}
      />
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Waiting for simulation data...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Electrolysis"
        description="Observe the decomposition of compounds using electrical energy"
        cameraPosition={[10, 8, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ElectrolysisSceneComponent
          onDataChange={setData}
          voltage={voltage}
          electrolyte={electrolyte}
          isRunning={isPlaying}
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
        title="⚙️ Electrolysis Parameters"
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
