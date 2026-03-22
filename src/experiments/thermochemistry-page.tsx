"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThermochemistrySceneComponent, ThermochemistryData } from "@/experiments/thermochemistry-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function ThermochemistryPage() {
  const router = useRouter();
  const [data, setData] = useState<ThermochemistryData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [progress, setProgress] = useState(0);

  // Physics
  const [reactionType, setReactionType] = useState<"exothermic" | "endothermic">("exothermic");
  const [activationEnergy, setActivationEnergy] = useState(50);
  const [enthalpyChange, setEnthalpyChange] = useState(40);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePlayPause = () => {
    if (isAnimating) {
      setIsAnimating(false);
    } else {
      setProgress(0);
      setIsAnimating(true);
    }
  };
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setProgress(0);
    setIsAnimating(false);
  };
  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    if (newProgress >= 1) {
      setIsAnimating(false);
    }
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Reaction Parameters">
        <ControlSlider
          label="Activation Energy"
          value={activationEnergy}
          unit="kJ/mol"
          min={10}
          max={100}
          step={5}
          color="#f59e0b"
          onChange={setActivationEnergy}
          decimals={0}
        />
        <ControlSlider
          label="Enthalpy Change"
          value={enthalpyChange}
          unit="kJ/mol"
          min={10}
          max={80}
          step={5}
          color="#ef4444"
          onChange={setEnthalpyChange}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Reaction Type">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setReactionType("exothermic")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              reactionType === "exothermic"
                ? "bg-red-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            🔥 Exothermic
          </button>
          <button
            onClick={() => setReactionType("endothermic")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              reactionType === "endothermic"
                ? "bg-red-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            ❄️ Endothermic
          </button>
        </div>
      </ControlGroup>

      <button
        onClick={() => { setProgress(0); setIsAnimating(true); }}
        disabled={isAnimating}
        className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        ⚗️ Start Reaction
      </button>

      <button
        onClick={() => router.push("/experiments/thermochemistry/details")}
        className="w-full py-2.5 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 font-medium text-sm rounded-lg transition-all border border-red-300/50 flex items-center justify-center gap-2"
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
          reactantEnergy: { value: data.reactantEnergy, unit: "kJ/mol", color: "#ff6b35", decimals: 0 },
          productEnergy: { value: data.productEnergy, unit: "kJ/mol", color: "#06d6a0", decimals: 0 },
          activationEnergy: { value: data.transitionStateEnergy - data.reactantEnergy, unit: "kJ/mol", color: "#f59e0b", decimals: 0 },
          enthalpyChange: { value: Math.abs(data.productEnergy - data.reactantEnergy), unit: "kJ/mol", color: "#ec4899", decimals: 0 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Progress:</span>
          <span className="font-mono text-red-400">
            {Math.round(progress * 100)}%
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
        title="Thermochemistry"
        description="Explore exothermic and endothermic reactions with energy diagrams"
        cameraPosition={[10, 8, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ThermochemistrySceneComponent
          onDataChange={setData}
          reactionType={reactionType}
          activationEnergy={activationEnergy}
          enthalpyChange={enthalpyChange}
          isAnimating={isAnimating}
          onProgressChange={handleProgressChange}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isAnimating}
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
