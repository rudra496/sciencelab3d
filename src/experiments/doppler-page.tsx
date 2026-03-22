"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DopplerSceneComponent,
  DopplerData,
} from "@/experiments/doppler-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function DopplerPage() {
  const router = useRouter();
  const [data, setData] = useState<DopplerData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Physics
  const [sourceFrequency, setSourceFrequency] = useState(2);
  const [sourceVelocity, setSourceVelocity] = useState(5);
  const [waveSpeed, setWaveSpeed] = useState(10);
  const [showWavefronts, setShowWavefronts] = useState(true);
  const [showCompression, setShowCompression] = useState(true);

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
      <ControlGroup title="Wave Parameters">
        <ControlSlider
          label="Source Frequency (f₀)"
          value={sourceFrequency}
          unit="Hz"
          min={0.5}
          max={5}
          step={0.1}
          color="#f59e0b"
          onChange={setSourceFrequency}
          decimals={1}
        />
        <ControlSlider
          label="Source Velocity (vₛ)"
          value={sourceVelocity}
          unit="m/s"
          min={0}
          max={15}
          step={0.5}
          color="#3b82f6"
          onChange={setSourceVelocity}
          decimals={1}
        />
        <ControlSlider
          label="Wave Speed (v)"
          value={waveSpeed}
          unit="m/s"
          min={5}
          max={20}
          step={1}
          color="#22c55e"
          onChange={setWaveSpeed}
          decimals={0}
        />
      </ControlGroup>

      {/* Display Options */}
      <ControlGroup title="Display Options">
        {[
          { label: "Show Wavefronts", checked: showWavefronts, onChange: setShowWavefronts },
          { label: "Show Compression Visual", checked: showCompression, onChange: setShowCompression },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-orange-500"
            />
          </label>
        ))}
      </ControlGroup>

      {/* Details link */}
      <button
        onClick={() => router.push("/experiments/doppler/details")}
        className="w-full py-2.5 bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 text-orange-700 font-medium text-sm rounded-lg transition-all border border-orange-300/50 flex items-center justify-center gap-2"
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
          sourceFrequency: { value: data.sourceFrequency, unit: "Hz", color: "#f59e0b", decimals: 1 },
          observedFrequency: { value: data.observedFrequency, unit: "Hz", color: data.shiftType === "blueshift" ? "#3b82f6" : "#ef4444", decimals: 1 },
          machNumber: { value: data.machNumber, unit: "", color: "#ec4899", decimals: 2 },
        }}
        columns={1}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Shift:</span>
          <span
            className={`font-bold ${
              data.shiftType === "blueshift"
                ? "text-blue-400"
                : data.shiftType === "redshift"
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {data.shiftType === "blueshift"
              ? "🔵 Blueshift"
              : data.shiftType === "redshift"
              ? "🔴 Redshift"
              : "🟢 None"}
          </span>
        </div>
        {data.machNumber >= 1 && (
          <div className="mt-2 text-xs text-purple-400">
            ⚠️ SUPERSONIC! Mach {data.machNumber.toFixed(2)}
          </div>
        )}
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
        title="Doppler Effect"
        description="Observe frequency shift from moving sound sources"
        cameraPosition={[0, 35, 45]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <DopplerSceneComponent
          onDataChange={setData}
          sourceFrequency={sourceFrequency}
          sourceVelocity={sourceVelocity}
          waveSpeed={waveSpeed}
          showWavefronts={showWavefronts}
          showCompression={showCompression}
          resetTrigger={resetTrigger}
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
        title="⚙️ Doppler Parameters"
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
