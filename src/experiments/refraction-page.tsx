"use client";

import { useState } from "react";
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

  // Physics parameters
  const [incidentAngle, setIncidentAngle] = useState(45);
  const [n2, setN2] = useState(1.5); // Medium 2 refractive index (medium 1 is always air = 1.0)
  const [showNormal, setShowNormal] = useState(true);
  const [showAngles, setShowAngles] = useState(true);

  // Medium presets
  const mediumPresets: Record<string, number> = {
    air: 1.0,
    water: 1.33,
    glass: 1.5,
    diamond: 2.42,
  };

  const handleMediumPreset = (medium: string) => {
    setN2(mediumPresets[medium] || 1.5);
  };

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
      {/* Incident Angle */}
      <ControlGroup title="Light Source">
        <ControlSlider
          label="Angle of Incidence (θᵢ)"
          value={incidentAngle}
          unit="°"
          min={0}
          max={89}
          step={1}
          color="#ffffff"
          onChange={setIncidentAngle}
          decimals={0}
        />
      </ControlGroup>

      {/* Medium 2 Properties */}
      <ControlGroup title="Medium 2 (Bottom)">
        <div className="space-y-3">
          {/* Refractive Index Slider */}
          <ControlSlider
            label="Refractive Index (n₂)"
            value={n2}
            unit=""
            min={1.0}
            max={2.5}
            step={0.01}
            color="#06b6d4"
            onChange={setN2}
            decimals={2}
          />

          {/* Medium Presets */}
          <div className="pt-2">
            <label className="text-xs text-gray-600 block mb-2">Quick Presets:</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(mediumPresets).map(([name, value]) => (
                <button
                  key={name}
                  onClick={() => handleMediumPreset(name)}
                  className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-all ${
                    Math.abs(n2 - value) < 0.01
                      ? "bg-cyan-500 text-white ring-2 ring-cyan-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)} ({value})
                </button>
              ))}
            </div>
          </div>
        </div>
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
              className="w-4 h-4 rounded accent-cyan-500"
            />
          </label>
        ))}
      </ControlGroup>

      {/* Medium 1 Info */}
      <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
        <div className="text-sm font-medium text-sky-800">Medium 1 (Top)</div>
        <div className="text-xs text-sky-600">Always Air (n₁ = 1.00)</div>
      </div>

      {/* Details link */}
      <button
        onClick={() => router.push("/experiments/refraction/details")}
        className="w-full py-2.5 bg-gradient-to-r from-cyan-100 to-cyan-200 hover:from-cyan-200 hover:to-cyan-300 text-cyan-700 font-medium text-sm rounded-lg transition-all border border-cyan-300/50 flex items-center justify-center gap-2"
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
          incidentAngle: { value: data.incidentAngle, unit: "°", color: "#ffffff", decimals: 1 },
          reflectedAngle: { value: data.reflectedAngle, unit: "°", color: "#fbbf24", decimals: 1 },
          refractedAngle: { value: data.refractedAngle, unit: "°", color: "#06b6d4", decimals: 1 },
          n1: { value: data.n1, unit: "", color: "#94a3b8", decimals: 2 },
          n2: { value: data.n2, unit: "", color: "#06b6d4", decimals: 2 },
          criticalAngle: { value: data.criticalAngle, unit: "°", color: "#f59e0b", decimals: 1 },
        }}
        columns={2}
      />

      {/* TIR Warning */}
      {data.isTIR && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
          <div className="text-red-400 text-sm font-semibold flex items-center gap-2">
            ⚠️ Total Internal Reflection
          </div>
          <div className="text-red-300 text-xs mt-1">
            Incident angle exceeds critical angle
          </div>
        </div>
      )}

      {/* Physics Formula */}
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="text-gray-400 text-xs mb-1">Snell's Law:</div>
        <div className="font-mono text-cyan-300 text-sm">
          n₁ × sin(θᵢ) = n₂ × sin(θₜ)
        </div>
        <div className="text-gray-500 text-xs mt-2">
          {data.n1.toFixed(2)} × sin({data.incidentAngle.toFixed(1)}°) ={" "}
          {data.n2.toFixed(2)} × sin({data.refractedAngle.toFixed(1)}°)
        </div>
      </div>

      {/* Critical Angle Info */}
      {data.criticalAngle < 90 && (
        <div className="mt-3 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
          <div className="text-amber-400 text-xs font-medium">Critical Angle:</div>
          <div className="text-amber-300 text-sm font-mono">
            θc = {data.criticalAngle.toFixed(1)}°
          </div>
          <div className="text-amber-200/70 text-xs mt-1">
            TIR occurs when θᵢ &gt; θc
          </div>
        </div>
      )}
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
        description="Explore Snell's law and total internal reflection at an optical interface"
        cameraPosition={[25, 15, 35]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <RefractionSceneComponent
          onDataChange={setData}
          incidentAngle={incidentAngle}
          n2={n2}
          showNormal={showNormal}
          showAngles={showAngles}
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
