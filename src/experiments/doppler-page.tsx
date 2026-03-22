"use client";

import { useState } from "react";
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

  // Physics parameters
  const [sourceFrequency, setSourceFrequency] = useState(2);
  const [sourceVelocity, setSourceVelocity] = useState(5);
  const [waveSpeed, setWaveSpeed] = useState(10);
  const [showWavefronts, setShowWavefronts] = useState(true);

  // Motion control
  const [autoOscillate, setAutoOscillate] = useState(true);
  const [sourceDirection, setSourceDirection] = useState(0); // -1 to 1
  const [observerPosition, setObserverPosition] = useState(15);

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
      {/* Wave Parameters */}
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
          label="Source Speed (vₛ)"
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

      {/* Motion Control */}
      <ControlGroup title="Source Motion">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Mode</span>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoOscillate(true)}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                autoOscillate
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setAutoOscillate(false)}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                !autoOscillate
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Manual
            </button>
          </div>
        </div>

        {!autoOscillate && (
          <div className="mb-3 p-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Direction</span>
              <span className="text-xs font-mono text-gray-800">
                {sourceDirection > 0.1 ? "→ Right" : sourceDirection < -0.1 ? "← Left" : "● Stop"}
              </span>
            </div>
            <ControlSlider
              label=""
              value={sourceDirection}
              unit=""
              min={-1}
              max={1}
              step={0.1}
              color="#f59e0b"
              onChange={setSourceDirection}
              decimals={1}
            />
          </div>
        )}

        <ControlSlider
          label="Observer Position"
          value={observerPosition}
          unit="m"
          min={-20}
          max={20}
          step={1}
          color="#8b5cf6"
          onChange={setObserverPosition}
          decimals={0}
        />
      </ControlGroup>

      {/* Display Options */}
      <ControlGroup title="Display Options">
        <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
          <span>Show Wavefronts</span>
          <input
            type="checkbox"
            checked={showWavefronts}
            onChange={(e) => setShowWavefronts(e.target.checked)}
            className="w-4 h-4 rounded accent-orange-500"
          />
        </label>
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
          observedFrequency: { value: data.observedFrequency, unit: "Hz", color: data.shiftType === "blueshift" ? "#3b82f6" : data.shiftType === "redshift" ? "#ef4444" : "#22c55e", decimals: 1 },
          dopplerShiftRatio: { value: data.dopplerShiftRatio, unit: "×", color: "#ec4899", decimals: 2 },
          machNumber: { value: data.machNumber, unit: "", color: "#a855f7", decimals: 2 },
          waveSpeed: { value: data.waveSpeed, unit: "m/s", color: "#22c55e", decimals: 0 },
        }}
        columns={1}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Shift Type:</span>
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
              ? "🔵 Blueshift (Approaching)"
              : data.shiftType === "redshift"
              ? "🔴 Redshift (Receding)"
              : "🟢 None (Stationary)"}
          </span>
        </div>
        {data.machNumber >= 1 && (
          <div className="mt-2 text-xs text-purple-400 font-medium">
            ⚠️ SUPERSONIC! Mach {data.machNumber.toFixed(2)}
          </div>
        )}
        {data.dopplerShiftRatio !== 1 && (
          <div className="mt-2 text-xs text-gray-400">
            {data.dopplerShiftRatio > 1
              ? `Frequency increased by ${((data.dopplerShiftRatio - 1) * 100).toFixed(0)}%`
              : `Frequency decreased by ${((1 - data.dopplerShiftRatio) * 100).toFixed(0)}%`}
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
        cameraPosition={[0, 30, 40]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <DopplerSceneComponent
          onDataChange={setData}
          sourceFrequency={sourceFrequency}
          sourceVelocity={sourceVelocity}
          waveSpeed={waveSpeed}
          autoOscillate={autoOscillate}
          sourceDirection={sourceDirection}
          observerPosition={observerPosition}
          showWavefronts={showWavefronts}
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
