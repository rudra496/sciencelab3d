"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ElectromagneticSceneComponent,
  EMFieldData,
} from "@/experiments/electromagnetic-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function ElectromagneticPage() {
  const router = useRouter();
  const [data, setData] = useState<EMFieldData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Physics
  const [charge1, setCharge1] = useState(5);
  const [charge2, setCharge2] = useState(-5);
  const [testCharge, setTestCharge] = useState(1);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showEquipotential, setShowEquipotential] = useState(true);

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
      <ControlGroup title="Electric Charges">
        <ControlSlider
          label="Charge 1 (q₁)"
          value={charge1}
          unit="µC"
          min={-10}
          max={10}
          step={1}
          color={charge1 >= 0 ? "#ef4444" : "#3b82f6"}
          onChange={setCharge1}
          decimals={0}
        />
        <ControlSlider
          label="Charge 2 (q₂)"
          value={charge2}
          unit="µC"
          min={-10}
          max={10}
          step={1}
          color={charge2 >= 0 ? "#ef4444" : "#3b82f6"}
          onChange={setCharge2}
          decimals={0}
        />
        <ControlSlider
          label="Test Charge (q₀)"
          value={testCharge}
          unit="µC"
          min={0.1}
          max={5}
          step={0.1}
          color="#f59e0b"
          onChange={setTestCharge}
          decimals={1}
        />
      </ControlGroup>

      {/* Display Options */}
      <ControlGroup title="Display Options">
        {[
          { label: "Show Field Lines", checked: showFieldLines, onChange: setShowFieldLines },
          { label: "Show Field Vectors", checked: showVectors, onChange: setShowVectors },
          { label: "Show Equipotential Lines", checked: showEquipotential, onChange: setShowEquipotential },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-red-500"
            />
          </label>
        ))}
      </ControlGroup>

      {/* Details link */}
      <button
        onClick={() => router.push("/experiments/electromagnetic/details")}
        className="w-full py-2.5 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 font-medium text-sm rounded-lg transition-all border border-red-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  // === DATA PANEL CONTENT ===
  const dataPanelContent = data ? (
    <DataGrid
      data={{
        electricField: { value: data.electricField, unit: "N/C", color: "#f59e0b", decimals: 2 },
        potential: { value: data.potential, unit: "V", color: "#8b5cf6", decimals: 1 },
        force: { value: data.force, unit: "N", color: "#ec4899", decimals: 3 },
        distance: { value: data.distance, unit: "m", color: "#22c55e", decimals: 1 },
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
        title="Electromagnetic Field"
        description="Visualize electric fields, forces, and equipotential lines"
        cameraPosition={[0, 0, 40]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ElectromagneticSceneComponent
          onDataChange={setData}
          charge1={charge1}
          charge2={charge2}
          testCharge={testCharge}
          showFieldLines={showFieldLines}
          showVectors={showVectors}
          showEquipotential={showEquipotential}
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
        title="⚙️ Electric Field Parameters"
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
