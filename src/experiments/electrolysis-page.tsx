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

type StepMode = "autoplay" | "step-through";
type Electrolyte = "water" | "nacl" | "cuso4";

const STEP_INFO = [
  { id: 1, title: "Setup", description: "Battery connected to electrodes in electrolyte solution" },
  { id: 2, title: "Current Flows", description: "Electrons flow from battery through wires to electrodes" },
  { id: 3, title: "Reactions Begin", description: "Water molecules split at electrode surfaces" },
  { id: 4, title: "Gases Form", description: "H₂ bubbles form at cathode (-), O₂ at anode (+)" },
  { id: 5, title: "Collection", description: "Gases collected in test tubes - H₂:O₂ ratio = 2:1" },
];

export default function ElectrolysisPage() {
  const router = useRouter();
  const [data, setData] = useState<ElectrolysisData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics parameters
  const [voltage, setVoltage] = useState(6);
  const [electrolyte, setElectrolyte] = useState<Electrolyte>("water");

  // Step-by-step mode
  const [stepMode, setStepMode] = useState<StepMode>("step-through");
  const [currentStep, setCurrentStep] = useState(1);
  const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(null);

  const handlePlayPause = () => {
    setIsPlaying((p) => !p);
  };

  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setCurrentStep(1);
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      setAutoPlayTimer(null);
    }
  };

  const handleStepModeChange = (mode: StepMode) => {
    setStepMode(mode);
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      setAutoPlayTimer(null);
    }
    if (mode === "autoplay") {
      // Start auto-advancing through steps
      setCurrentStep(1);
      const timer = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= 5) {
            clearInterval(timer);
            return 5;
          }
          return s + 1;
        });
      }, 4000 / simulationSpeed);
      setAutoPlayTimer(timer);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    if (stepMode === "autoplay" && autoPlayTimer) {
      clearInterval(autoPlayTimer);
      setAutoPlayTimer(null);
      setStepMode("step-through");
    }
  };

  const getElectrolyteLabel = (e: Electrolyte): string => {
    switch (e) {
      case "water": return "Pure Water (H₂O)";
      case "nacl": return "Salt Solution (NaCl)";
      case "cuso4": return "Copper Sulfate (CuSO₄)";
    }
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      {/* Step Mode Selection */}
      <ControlGroup title="Simulation Mode">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleStepModeChange("step-through")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              stepMode === "step-through"
                ? "bg-blue-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            📝 Step-Through
          </button>
          <button
            onClick={() => handleStepModeChange("autoplay")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              stepMode === "autoplay"
                ? "bg-blue-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            ▶️ Auto-Play
          </button>
        </div>
      </ControlGroup>

      {/* Step Navigation (only in step-through mode) */}
      {stepMode === "step-through" && (
        <ControlGroup title="Step Navigation">
          <div className="flex gap-1 flex-wrap">
            {[1, 2, 3, 4, 5].map((step) => (
              <button
                key={step}
                onClick={() => handleStepChange(step)}
                className={`flex-1 min-w-[40px] py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                  currentStep === step
                    ? "bg-green-600 text-white"
                    : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
                }`}
              >
                {step}
              </button>
            ))}
          </div>
          <div className="mt-2 p-2 bg-blue-50/80 rounded-lg text-xs text-blue-800">
            <p className="font-semibold">{STEP_INFO[currentStep - 1].title}</p>
            <p className="text-blue-600 mt-1">{STEP_INFO[currentStep - 1].description}</p>
          </div>
        </ControlGroup>
      )}

      {/* Voltage Control */}
      <ControlGroup title="Voltage">
        <ControlSlider
          label="Voltage"
          value={voltage}
          unit="V"
          min={1}
          max={12}
          step={0.5}
          color="#f59e0b"
          onChange={setVoltage}
          decimals={1}
        />
      </ControlGroup>

      {/* Electrolyte Selection */}
      <ControlGroup title="Electrolyte Solution">
        <div className="space-y-2">
          {(["water", "nacl", "cuso4"] as Electrolyte[]).map((e) => (
            <button
              key={e}
              onClick={() => setElectrolyte(e)}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all text-left ${
                electrolyte === e
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
              }`}
            >
              {getElectrolyteLabel(e)}
            </button>
          ))}
        </div>
      </ControlGroup>

      {/* Simulation Speed */}
      <ControlGroup title="Simulation Speed">
        <ControlSlider
          label="Speed"
          value={simulationSpeed}
          unit="×"
          min={0.25}
          max={3}
          step={0.25}
          color="#8b5cf6"
          onChange={setSimulationSpeed}
          decimals={2}
        />
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
    <div className="space-y-4">
      <DataGrid
        data={{
          voltage: { value: data.voltage, unit: "V", color: "#f59e0b", decimals: 1 },
          current: { value: data.current, unit: "A", color: "#3b82f6", decimals: 2 },
          h2Volume: { value: data.h2Volume, unit: "mL", color: "#2563eb", decimals: 1 },
          o2Volume: { value: data.o2Volume, unit: "mL", color: "#dc2626", decimals: 1 },
        }}
        columns={2}
      />

      {/* Reaction Status */}
      <div className="bg-gray-50/80 rounded-lg p-3 space-y-2">
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</div>
        <div className="text-sm font-medium text-gray-800">{data.reactionStatus}</div>

        {/* Step indicator */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Current Step</span>
            <span className="font-bold text-blue-600">{currentStep}/5</span>
          </div>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  s <= currentStep ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Gas Ratio */}
        {data.h2Volume > 0 && data.o2Volume > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">H₂:O₂ Ratio</span>
              <span className="font-bold text-green-600">
                {(data.h2Volume / Math.max(data.o2Volume, 0.1)).toFixed(1)}:1
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Expected: 2:1</div>
          </div>
        )}
      </div>

      {/* Electrode Reactions Reference */}
      {currentStep >= 3 && (
        <div className="bg-blue-50/80 rounded-lg p-3 space-y-2">
          <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Reactions</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold shrink-0">Cathode (−):</span>
              <span className="text-gray-700">2H₂O + 2e⁻ → H₂(g) + 2OH⁻</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-600 font-bold shrink-0">Anode (+):</span>
              <span className="text-gray-700">2H₂O → O₂(g) + 4H⁺ + 4e⁻</span>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Waiting for simulation data...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Electrolysis of Water"
        description="Learn how electricity splits water into hydrogen and oxygen gas"
        cameraPosition={[12, 10, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ElectrolysisSceneComponent
          onDataChange={setData}
          voltage={voltage}
          electrolyte={electrolyte}
          isRunning={isPlaying}
          step={currentStep}
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
        title="⚡ Electrolysis Controls"
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
