"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChemicalBondingSceneComponent,
  ChemicalBondingData,
  BondType,
} from "@/experiments/chemical-bonding-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function ChemicalBondingPage() {
  const router = useRouter();
  const [data, setData] = useState<ChemicalBondingData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Bond type selection
  const [bondType, setBondType] = useState<BondType>("ionic");

  // Step controls
  const [stepMode, setStepMode] = useState<"auto" | "manual">("auto");
  const [manualStep, setManualStep] = useState(0);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setManualStep(0);
  };

  const handleNextStep = () => {
    const steps = bondType === "metallic" ? 4 : 5;
    setManualStep((prev) => Math.min(prev + 1, steps - 1));
  };

  const handlePrevStep = () => {
    setManualStep((prev) => Math.max(prev - 1, 0));
  };

  const handleBondTypeChange = (type: BondType) => {
    setBondType(type);
    setManualStep(0);
    setResetTrigger((n) => n + 1);
  };

  // Bond type info
  const bondInfo: Record<BondType, { title: string; description: string; example: string; color: string }> = {
    ionic: {
      title: "Ionic Bond",
      description: "Electrons are transferred from metal to non-metal, creating oppositely charged ions that attract.",
      example: "NaCl (Sodium Chloride)",
      color: "#AB5CF2",
    },
    covalent: {
      title: "Covalent Bond",
      description: "Electrons are shared between atoms to complete their outer shells.",
      example: "H₂O (Water)",
      color: "#FF0D0D",
    },
    metallic: {
      title: "Metallic Bond",
      description: "Valence electrons are delocalized, forming a 'sea of electrons' that holds metal atoms together.",
      example: "Fe (Iron)",
      color: "#E06633",
    },
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Bond Type">
        <div className="space-y-3">
          {(["ionic", "covalent", "metallic"] as BondType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleBondTypeChange(type)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all text-left ${
                bondType === type
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg"
                  : "bg-gray-100/80 text-gray-700 hover:bg-gray-200/80"
              }`}
            >
              <div className="font-bold">{bondInfo[type].title}</div>
              <div className={`text-xs mt-1 ${bondType === type ? "text-emerald-100" : "text-gray-500"}`}>
                {bondInfo[type].example}
              </div>
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup title="Bond Info">
        <div className="bg-blue-50/80 rounded-lg p-3 border border-blue-200/50">
          <div className="text-xs text-gray-600 mb-2 font-medium">
            {bondInfo[bondType].title}
          </div>
          <div className="text-xs text-gray-600 leading-relaxed">
            {bondInfo[bondType].description}
          </div>
        </div>
      </ControlGroup>

      <ControlGroup title="Animation Mode">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setStepMode("auto")}
            className={`py-2 px-3 text-xs rounded-lg font-medium transition-all ${
              stepMode === "auto"
                ? "bg-emerald-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            Auto Play
          </button>
          <button
            onClick={() => setStepMode("manual")}
            className={`py-2 px-3 text-xs rounded-lg font-medium transition-all ${
              stepMode === "manual"
                ? "bg-emerald-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            Manual Steps
          </button>
        </div>
      </ControlGroup>

      {stepMode === "manual" && (
        <ControlGroup title="Step Control">
          <div className="flex gap-2">
            <button
              onClick={handlePrevStep}
              disabled={manualStep === 0}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                manualStep === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ← Prev
            </button>
            <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium">
              {manualStep + 1}/{bondType === "metallic" ? 4 : 5}
            </div>
            <button
              onClick={handleNextStep}
              disabled={manualStep >= (bondType === "metallic" ? 3 : 4)}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                manualStep >= (bondType === "metallic" ? 3 : 4)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Next →
            </button>
          </div>
        </ControlGroup>
      )}

      <ControlGroup title="Animation Speed">
        <ControlSlider
          label="Speed"
          value={simulationSpeed}
          onChange={setSimulationSpeed}
          min={0.25}
          max={2}
          step={0.25}
          unit="x"
          color="#8b5cf6"
          decimals={2}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/chemical-bonding/details")}
        className="w-full py-2.5 bg-gradient-to-r from-emerald-100 to-emerald-200 hover:from-emerald-200 hover:to-emerald-300 text-emerald-700 font-medium text-sm rounded-lg transition-all border border-emerald-300/50 flex items-center justify-center gap-2"
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
          step: { value: data.step + 1, unit: `/${data.totalSteps}`, color: "#10b981", decimals: 0 },
          bondEnergy: { value: data.bondEnergy, unit: "kJ/mol", color: "#f59e0b", decimals: 0 },
          enDiff: { value: data.electronegativityDiff, unit: "ΔEN", color: "#ef4444", decimals: 2 },
          bondLength: { value: data.bondLength, unit: "Å", color: "#3b82f6", decimals: 2 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Current Step</div>
        <div className="text-xs text-gray-300 leading-relaxed">
          {data.description}
        </div>
      </div>

      {/* Bond classification */}
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Bond Classification</div>
        <div className="text-emerald-400 text-sm font-medium">
          {data.bondType === "ionic" && "Ionic (ΔEN > 1.7)"}
          {data.bondType === "covalent" &&
            (data.electronegativityDiff > 0.5
              ? "Polar Covalent (0.5 < ΔEN < 1.7)"
              : "Nonpolar Covalent (ΔEN < 0.5)")}
          {data.bondType === "metallic" && "Metallic (delocalized electrons)"}
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
        title="Chemical Bonding"
        description="Explore how atoms connect through ionic, covalent, and metallic bonds. Watch step-by-step animations of bond formation."
        cameraPosition={[12, 8, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ChemicalBondingSceneComponent
          onDataChange={setData}
          bondType={bondType}
          isPlaying={isPlaying}
          animationSpeed={simulationSpeed}
          stepMode={stepMode}
          manualStep={manualStep}
          resetTrigger={resetTrigger}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={data?.step ?? 0}
      />

      <FloatingControlPanel
        title="⚛️ Chemical Bonding"
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
