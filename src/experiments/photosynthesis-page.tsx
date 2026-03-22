"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import PhotosynthesisSceneComponent, { PhotosynthesisData } from "./photosynthesis-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
  ControlDropdown,
  ControlCheckbox,
  ControlButton,
} from "@/components/experiment-ui";

export default function PhotosynthesisPage() {
  const router = useRouter();
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [lightIntensity, setLightIntensity] = useState(1);
  const [co2Level, setCo2Level] = useState(1);
  const [stepMode, setStepMode] = useState<"auto" | "step">("auto");
  const [showLabels, setShowLabels] = useState(true);

  const [currentData, setCurrentData] = useState<PhotosynthesisData>({
    phase: "Light Reactions",
    step: 1,
    stepDescription: "Step 1: Sunlight hits chloroplast. Water molecules (H₂O) enter from below.",
    o2Produced: 0,
    glucoseProduced: 0,
    atpCount: 0,
    nadphCount: 0,
  });

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setLightIntensity(1);
    setCo2Level(1);
    setStepMode("auto");
  };

  const stepOptions = [
    { label: "Auto Play", value: "auto" as const },
    { label: "Manual Step", value: "step" as const },
  ];

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Environmental Controls">
        <ControlSlider
          label="Light Intensity"
          value={lightIntensity}
          unit=""
          min={0}
          max={2}
          step={0.1}
          color="#fbbf24"
          onChange={setLightIntensity}
          decimals={1}
        />
        <ControlSlider
          label="CO₂ Concentration"
          value={co2Level}
          unit=""
          min={0}
          max={2}
          step={0.1}
          color="#3b82f6"
          onChange={setCo2Level}
          decimals={1}
        />
      </ControlGroup>

      <ControlGroup title="Display Settings">
        <ControlDropdown
          label="Step Mode"
          value={stepMode}
          options={stepOptions}
          onChange={setStepMode}
          color="#22c55e"
        />
        <ControlCheckbox
          label="Show Labels"
          checked={showLabels}
          onChange={setShowLabels}
          color="#22c55e"
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/photosynthesis/details")}
        className="w-full py-2.5 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 font-medium text-sm rounded-lg transition-all border border-green-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = (
    <>
      <div className="mb-3 p-2.5 bg-gray-800/50 rounded-lg">
        <div className="text-center font-bold text-green-400 text-sm mb-1">
          {currentData.phase}
        </div>
        <div className="text-center text-gray-300 text-xs">
          Step {currentData.step}/3
        </div>
      </div>

      <DataGrid
        data={{
          o2: { value: currentData.o2Produced, unit: "units", color: "#ef4444", decimals: 0 },
          glucose: { value: currentData.glucoseProduced, unit: "units", color: "#a855f7", decimals: 0 },
          atp: { value: currentData.atpCount, unit: "count", color: "#fbbf24", decimals: 0 },
          nadph: { value: currentData.nadphCount, unit: "count", color: "#22c55e", decimals: 0 },
        }}
        columns={2}
      />

      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-300 leading-relaxed">
          {currentData.stepDescription}
        </div>
      </div>
    </>
  );

  return (
    <>
      <ExperimentContainer
        title="Photosynthesis"
        description="Explore light reactions and Calvin cycle in chloroplasts"
        cameraPosition={[0, 5, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <PhotosynthesisSceneComponent
          onDataChange={setCurrentData}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          lightIntensity={lightIntensity}
          co2Level={co2Level}
          stepMode={stepMode}
          showLabels={showLabels}
        />
      </ExperimentContainer>

      <SimulationController isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} speed={simulationSpeed} onSpeedChange={setSimulationSpeed} />

      <FloatingControlPanel title="🌱 Photosynthesis Controls" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
