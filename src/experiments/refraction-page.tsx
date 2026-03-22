"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  RefractionSceneComponent,
  RefractionData,
} from "@/experiments/refraction-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function RefractionPage() {
  const router = useRouter();
  const [data, setData] = useState<RefractionData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Physics
  const [incidentAngle, setIncidentAngle] = useState(45);
  const [n1, setN1] = useState(1.0);
  const [n2, setN2] = useState(1.5);
  const [showNormal, setShowNormal] = useState(true);
  const [showAngles, setShowAngles] = useState(true);

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
      <ControlGroup title="Refractive Indices">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-700 block mb-2">Medium 1 (n₁)</label>
            <select
              value={n1}
              onChange={(e) => setN1(parseFloat(e.target.value))}
              className="w-full bg-white text-gray-900 rounded-lg px-3 py-2 border border-gray-300"
            >
              <option value={1.0}>Vacuum/Air (1.00)</option>
              <option value={1.33}>Water (1.33)</option>
              <option value={1.5}>Glass (1.50)</option>
              <option value={2.42}>Diamond (2.42)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-700 block mb-2">Medium 2 (n₂)</label>
            <select
              value={n2}
              onChange={(e) => setN2(parseFloat(e.target.value))}
              className="w-full bg-white text-gray-900 rounded-lg px-3 py-2 border border-gray-300"
            >
              <option value={1.0}>Vacuum/Air (1.00)</option>
              <option value={1.33}>Water (1.33)</option>
              <option value={1.5}>Glass (1.50)</option>
              <option value={2.42}>Diamond (2.42)</option>
            </select>
          </div>
        </div>
      </ControlGroup>

      <ControlGroup title="Incident Angle">
        <ControlSlider
          label="Angle (θᵢ)"
          value={incidentAngle}
          unit="°"
          min={0}
          max={89}
          step={1}
          color="#ec4899"
          onChange={setIncidentAngle}
          decimals={0}
        />
      </ControlGroup>

      {/* Display Options */}
      <ControlGroup title="Display Options">
        {[
          { label: "Show Normal Line", checked: showNormal, onChange: setShowNormal },
          { label: "Show Angle Arcs", checked: showAngles, onChange: setShowAngles },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-teal-500"
            />
          </label>
        ))}
      </ControlGroup>

      {/* Details link */}
      <button
        onClick={() => router.push("/experiments/refraction/details")}
        className="w-full py-2.5 bg-gradient-to-r from-teal-100 to-teal-200 hover:from-teal-200 hover:to-teal-300 text-teal-700 font-medium text-sm rounded-lg transition-all border border-teal-300/50 flex items-center justify-center gap-2"
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
          incidentAngle: { value: data.incidentAngle, unit: "°", color: "#ef4444", decimals: 1 },
          refractedAngle: { value: data.refractedAngle, unit: "°", color: "#3b82f6", decimals: 1 },
          criticalAngle: { value: data.criticalAngle, unit: "°", color: "#f59e0b", decimals: 1 },
        }}
        columns={3}
      />
      {data.isTIR && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm font-semibold">
          ⚠️ Total Internal Reflection
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-gray-800/50 rounded">
          <span className="text-gray-500">Reflectance</span>
          <div className="font-mono text-purple-300">{(data.reflectance * 100).toFixed(1)}%</div>
        </div>
        <div className="p-2 bg-gray-800/50 rounded">
          <span className="text-gray-500">Transmittance</span>
          <div className="font-mono text-cyan-300">{(data.transmittance * 100).toFixed(1)}%</div>
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
        title="Refraction & Reflection"
        description="Explore Snell's law and total internal reflection"
        cameraPosition={[30, 18, 35]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <RefractionSceneComponent
          onDataChange={setData}
          incidentAngle={incidentAngle}
          n1={n1}
          n2={n2}
          showNormal={showNormal}
          showAngles={showAngles}
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
        title="⚙️ Refraction Parameters"
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
