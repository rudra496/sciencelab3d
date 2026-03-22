"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TitrationSceneComponent, TitrationData } from "@/experiments/titration-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function TitrationPage() {
  const router = useRouter();
  const [data, setData] = useState<TitrationData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics
  const [titrantConcentration, setTitrantConcentration] = useState(0.1);
  const [analyteVolume, setAnalyteVolume] = useState(25);
  const [indicatorType, setIndicatorType] = useState<"phenolphthalein" | "methyl-orange" | "bromothymol">("phenolphthalein");
  const [dropsAdded, setDropsAdded] = useState(0);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setDropsAdded(0);
  };
  const handleAddDrop = () => setDropsAdded((p) => p + 1);

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Titration Parameters">
        <ControlSlider
          label="Titrant Concentration"
          value={titrantConcentration}
          unit="M"
          min={0.01}
          max={0.5}
          step={0.01}
          color="#8b5cf6"
          onChange={setTitrantConcentration}
          decimals={2}
        />
        <ControlSlider
          label="Analyte Volume"
          value={analyteVolume}
          unit="mL"
          min={10}
          max={50}
          step={1}
          color="#22c55e"
          onChange={setAnalyteVolume}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Indicator Type">
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => setIndicatorType("phenolphthalein")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              indicatorType === "phenolphthalein"
                ? "bg-violet-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            🌸 Phenolphthalein (pH 8.2-10)
          </button>
          <button
            onClick={() => setIndicatorType("methyl-orange")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              indicatorType === "methyl-orange"
                ? "bg-violet-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            🍊 Methyl Orange (pH 3.1-4.4)
          </button>
          <button
            onClick={() => setIndicatorType("bromothymol")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              indicatorType === "bromothymol"
                ? "bg-violet-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            💛 Bromothymol Blue (pH 6.0-7.6)
          </button>
        </div>
      </ControlGroup>

      <button
        onClick={handleAddDrop}
        className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2"
      >
        💧 Add Titrant Drop ({dropsAdded})
      </button>

      <button
        onClick={() => router.push("/experiments/titration/details")}
        className="w-full py-2.5 bg-gradient-to-r from-violet-100 to-violet-200 hover:from-violet-200 hover:to-violet-300 text-violet-700 font-medium text-sm rounded-lg transition-all border border-violet-300/50 flex items-center justify-center gap-2"
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
          drops: { value: data.dropsAdded, unit: "drops", color: "#8b5cf6", decimals: 0 },
          ph: { value: data.currentPH, unit: "", color: data.currentPH > 7 ? "#3b82f6" : data.currentPH < 7 ? "#ef4444" : "#22c55e", decimals: 2 },
          titrant: { value: data.titrantConcentration, unit: "M", color: "#06d6a0", decimals: 3 },
          analyte: { value: data.analyteVolume, unit: "mL", color: "#f59e0b", decimals: 0 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Status:</span>
          <span className={`font-bold ${data.currentPH > 7 ? "text-blue-400" : data.currentPH < 7 ? "text-red-400" : "text-green-400"}`}>
            {data.currentPH > 7 ? "🔵 Basic" : data.currentPH < 7 ? "🔴 Acidic" : "🟢 Neutral"}
          </span>
        </div>
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
        title="Titration"
        description="Determine unknown concentrations through acid-base titration"
        cameraPosition={[10, 8, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <TitrationSceneComponent
          onDataChange={setData}
          titrantConcentration={titrantConcentration}
          analyteVolume={analyteVolume}
          indicatorType={indicatorType}
          dropsAdded={dropsAdded}
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
        title="⚙️ Titration Parameters"
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
