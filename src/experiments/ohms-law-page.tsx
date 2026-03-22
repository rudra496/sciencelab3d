"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OhmsLawSceneComponent,
  OhmsLawData,
  loadTypeOptions,
} from "@/experiments/ohms-law-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  ControlDropdown,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function OhmsLawPage() {
  const router = useRouter();
  const [data, setData] = useState<OhmsLawData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(100);
  const [loadType, setLoadType] = useState<"bulb" | "motor" | "both">("bulb");

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Circuit Parameters">
        <ControlSlider
          label="Voltage (V)"
          value={voltage}
          unit="V"
          min={1}
          max={12}
          step={0.5}
          color="#f59e0b"
          onChange={setVoltage}
          decimals={1}
        />
        <ControlSlider
          label="Resistance (R)"
          value={resistance}
          unit="Ω"
          min={10}
          max={1000}
          step={10}
          color="#ef4444"
          onChange={setResistance}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Load Configuration">
        <ControlDropdown
          label="Load Type"
          value={loadType}
          options={loadTypeOptions}
          onChange={(value) => setLoadType(value as "bulb" | "motor" | "both")}
          color="#8b5cf6"
        />
      </ControlGroup>

      <ControlGroup title="Quick Presets">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setVoltage(12); setResistance(100); }}
            className="py-2 px-3 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-700 text-xs font-medium rounded-lg transition-all border border-amber-300/50"
          >
            🔦 Bright Bulb
            <div className="text-[9px] opacity-75 mt-0.5">12V, 100Ω</div>
          </button>
          <button
            onClick={() => { setVoltage(9); setResistance(50); }}
            className="py-2 px-3 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 text-xs font-medium rounded-lg transition-all border border-blue-300/50"
          >
            ⚡ High Current
            <div className="text-[9px] opacity-75 mt-0.5">9V, 50Ω</div>
          </button>
          <button
            onClick={() => { setVoltage(3); setResistance(500); }}
            className="py-2 px-3 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 text-xs font-medium rounded-lg transition-all border border-green-300/50"
          >
            💡 Dim Bulb
            <div className="text-[9px] opacity-75 mt-0.5">3V, 500Ω</div>
          </button>
          <button
            onClick={() => { setVoltage(12); setResistance(20); }}
            className="py-2 px-3 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 text-xs font-medium rounded-lg transition-all border border-purple-300/50"
          >
            ⚙️ Fast Motor
            <div className="text-[9px] opacity-75 mt-0.5">12V, 20Ω</div>
          </button>
        </div>
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/ohms-law/details")}
        className="w-full py-2.5 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-700 font-medium text-sm rounded-lg transition-all border border-amber-300/50 flex items-center justify-center gap-2"
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
          voltage: { value: data.voltage, unit: "V", color: "#f59e0b", decimals: 1 },
          current: { value: data.current, unit: "A", color: "#3b82f6", decimals: 3 },
          resistance: { value: data.resistance, unit: "Ω", color: "#ef4444", decimals: 0 },
          power: { value: data.power, unit: "W", color: "#22c55e", decimals: 2 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gradient-to-r from-amber-900/30 to-amber-800/30 rounded-lg border border-amber-500/20">
        <div className="text-center font-mono text-amber-400 text-xs space-y-1">
          <div className="text-amber-200 font-semibold mb-2">Ohm's Law</div>
          <div>I = V / R = {data.voltage.toFixed(1)}V / {data.resistance}Ω</div>
          <div className="text-amber-300">I = {data.current.toFixed(3)} A</div>
          <div className="mt-2 text-amber-200 font-semibold">Power</div>
          <div>P = V × I = {data.voltage.toFixed(1)}V × {data.current.toFixed(3)}A</div>
          <div className="text-amber-300">P = {data.power.toFixed(2)} W</div>
        </div>
      </div>
      <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
        <div className="text-[10px] text-blue-300 text-center">
          Electron flow rate: {(data.electronFlowRate / 1e18).toFixed(2)} × 10¹⁸ e⁻/s
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
        title="Ohm's Law"
        description="Explore the relationship between voltage, current, and resistance with interactive circuits"
        cameraPosition={[12, 10, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <OhmsLawSceneComponent
          onDataChange={setData}
          voltage={voltage}
          resistance={resistance}
          loadType={loadType}
          isPlaying={isPlaying}
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
        title="⚙️ Circuit Parameters"
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
