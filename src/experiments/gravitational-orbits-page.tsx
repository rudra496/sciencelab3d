"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  GravitationalOrbitsSceneComponent,
  OrbitData,
} from "@/experiments/gravitational-orbits-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

// Orbit type color mapping
const ORBIT_TYPE_COLORS: Record<string, string> = {
  Circular: "#22c55e",    // green
  Elliptical: "#3b82f6",  // blue
  Parabolic: "#f59e0b",   // amber
  Hyperbolic: "#ef4444",  // red
};

export default function GravitationalOrbitsPage() {
  const router = useRouter();
  const [data, setData] = useState<OrbitData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation state
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics parameters
  const [starMass, setStarMass] = useState(1000);
  const [planetMass, setPlanetMass] = useState(1);
  const [secondPlanetMass, setSecondPlanetMass] = useState(0.5);
  const [initialDistance, setInitialDistance] = useState(15);
  const [initialVelocity, setInitialVelocity] = useState(6);
  const [showTrail, setShowTrail] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showSecondPlanet, setShowSecondPlanet] = useState(false);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };

  // Calculate circular orbit velocity for current distance
  const circularVelocity = useMemo(() => {
    return Math.sqrt((1 * starMass) / initialDistance);
  }, [starMass, initialDistance]);

  // Calculate escape velocity for current distance
  const escapeVelocity = useMemo(() => {
    return Math.sqrt((2 * starMass) / initialDistance);
  }, [starMass, initialDistance]);

  // Preset configurations
  const presets = [
    {
      label: "Circular Orbit",
      distance: 15,
      velocity: 6, // Will be overridden to circular
      action: () => {
        setInitialDistance(15);
        setInitialVelocity(circularVelocity);
      },
    },
    {
      label: "Elliptical",
      distance: 15,
      velocity: 4,
      action: () => {
        setInitialDistance(15);
        setInitialVelocity(4);
      },
    },
    {
      label: "Comet-like",
      distance: 25,
      velocity: 3,
      action: () => {
        setInitialDistance(25);
        setInitialVelocity(3);
      },
    },
    {
      label: "Escape",
      distance: 15,
      velocity: 10,
      action: () => {
        setInitialDistance(15);
        setInitialVelocity(escapeVelocity);
      },
    },
  ];

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      {/* Orbit Presets */}
      <ControlGroup title="Orbit Presets">
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={preset.action}
              className="py-2 px-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-xs rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </ControlGroup>

      {/* Physics Parameters */}
      <ControlGroup title="Physics Parameters">
        <ControlSlider
          label="Star Mass (M)"
          value={starMass}
          unit="M☉"
          min={100}
          max={2000}
          step={100}
          color="#f59e0b"
          onChange={setStarMass}
          decimals={0}
        />
        <ControlSlider
          label="Planet Mass (m)"
          value={planetMass}
          unit="M⊕"
          min={0.1}
          max={10}
          step={0.1}
          color="#3b82f6"
          onChange={setPlanetMass}
          decimals={1}
        />
        <ControlSlider
          label="Initial Distance (r₀)"
          value={initialDistance}
          unit="AU"
          min={8}
          max={40}
          step={1}
          color="#22c55e"
          onChange={setInitialDistance}
          decimals={0}
        />
        <ControlSlider
          label="Initial Velocity (v₀)"
          value={initialVelocity}
          unit="km/s"
          min={1}
          max={15}
          step={0.5}
          color="#ec4899"
          onChange={setInitialVelocity}
          decimals={1}
        />
      </ControlGroup>

      {/* Second Planet */}
      <ControlGroup title="Second Planet (Optional)">
        <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
          <span className="font-medium">Enable Second Planet</span>
          <input
            type="checkbox"
            checked={showSecondPlanet}
            onChange={(e) => setShowSecondPlanet(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-500"
          />
        </label>
        {showSecondPlanet && (
          <ControlSlider
            label="Second Planet Mass"
            value={secondPlanetMass}
            unit="M⊕"
            min={0.1}
            max={5}
            step={0.1}
            color="#ff6b9d"
            onChange={setSecondPlanetMass}
            decimals={1}
          />
        )}
      </ControlGroup>

      {/* Display Options */}
      <ControlGroup title="Display Options">
        {[
          { label: "Show Orbital Trails", checked: showTrail, onChange: setShowTrail },
          { label: "Show Force/Velocity Vectors", checked: showVectors, onChange: setShowVectors },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-500"
            />
          </label>
        ))}
      </ControlGroup>

      {/* Reference velocities */}
      <div className="p-3 bg-gray-800/80 rounded-lg border border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Reference Velocities at r = {initialDistance} AU:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Circular:</span>
            <span className="font-mono text-green-400">{circularVelocity.toFixed(2)} km/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Escape:</span>
            <span className="font-mono text-red-400">{escapeVelocity.toFixed(2)} km/s</span>
          </div>
        </div>
      </div>

      {/* Details link */}
      <button
        onClick={() => router.push("/experiments/gravitational-orbits/details")}
        className="w-full py-2.5 bg-gradient-to-r from-indigo-100 to-indigo-200 hover:from-indigo-200 hover:to-indigo-300 text-indigo-700 font-medium text-sm rounded-lg transition-all border border-indigo-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  // === DATA PANEL CONTENT ===
  const getOrbitTypeBadge = (orbitType: string) => {
    const color = ORBIT_TYPE_COLORS[orbitType] || "#888";
    return (
      <span
        className="px-2 py-0.5 rounded text-xs font-semibold"
        style={{
          backgroundColor: `${color}20`,
          color,
          border: `1px solid ${color}50`,
        }}
      >
        {orbitType}
      </span>
    );
  };

  const dataPanelContent = data ? (
    <>
      {/* Orbit Type Badge */}
      <div className="mb-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700">
        <div className="text-xs text-gray-400 mb-1">Current Orbit Type</div>
        <div className="flex items-center gap-2">
          {getOrbitTypeBadge(data.orbitType)}
          {data.orbitType === "Elliptical" && (
            <span className="text-xs text-gray-500">
              e = {data.eccentricity.toFixed(3)}
            </span>
          )}
        </div>
      </div>

      <DataGrid
        data={{
          distance: { value: data.distance, unit: "AU", color: "#3b82f6", decimals: 2 },
          velocity: { value: data.velocity, unit: "km/s", color: "#22c55e", decimals: 2 },
          escapeVelocity: { value: data.escapeVelocity, unit: "km/s", color: "#ef4444", decimals: 2 },
          period: { value: data.period === Infinity ? 0 : data.period, unit: "yr", color: "#8b5cf6", decimals: data.period === Infinity ? 0 : 2 },
        }}
        columns={2}
      />
      {data.period === Infinity && (
        <div className="text-xs text-gray-500 italic text-center mt-1">
          Period: ∞ (unbound orbit)
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-gray-800/50 rounded border border-gray-700/50">
          <span className="text-gray-500 block text-xs">Eccentricity</span>
          <div className="font-mono text-cyan-400">{data.eccentricity.toFixed(3)}</div>
        </div>
        <div className="p-2 bg-gray-800/50 rounded border border-gray-700/50">
          <span className="text-gray-500 block text-xs">Semi-Major Axis</span>
          <div className="font-mono text-lime-400">{data.semiMajorAxis.toFixed(2)} AU</div>
        </div>
        <div className="p-2 bg-gray-800/50 rounded border border-gray-700/50">
          <span className="text-gray-500 block text-xs">Total Energy</span>
          <div className="font-mono text-amber-400">{data.totalEnergy.toFixed(2)} J</div>
        </div>
        <div className="p-2 bg-gray-800/50 rounded border border-gray-700/50">
          <span className="text-gray-500 block text-xs">Angular Momentum</span>
          <div className="font-mono text-purple-400">{data.angularMomentum.toFixed(2)} kg·m²/s</div>
        </div>
      </div>

      {/* Second Planet Data */}
      {showSecondPlanet && data.secondPlanetData && (
        <div className="mt-3 p-3 bg-pink-900/20 rounded-lg border border-pink-700/30">
          <div className="text-xs text-pink-400 mb-2 font-medium">Second Planet</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-gray-800/50 rounded">
              <span className="text-gray-500 block">Distance</span>
              <div className="font-mono text-pink-400">{data.secondPlanetData.distance.toFixed(2)} AU</div>
            </div>
            <div className="p-2 bg-gray-800/50 rounded">
              <span className="text-gray-500 block">Velocity</span>
              <div className="font-mono text-pink-400">{data.secondPlanetData.velocity.toFixed(2)} km/s</div>
            </div>
            <div className="p-2 bg-gray-800/50 rounded">
              <span className="text-gray-500 block">Orbit</span>
              {getOrbitTypeBadge(data.secondPlanetData.orbitType)}
            </div>
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
        title="Gravitational Orbits"
        description="Explore orbital mechanics and gravitational interactions"
        cameraPosition={[50, 30, 50]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <GravitationalOrbitsSceneComponent
          onDataChange={setData}
          starMass={starMass}
          planetMass={planetMass}
          secondPlanetMass={secondPlanetMass}
          initialDistance={initialDistance}
          initialVelocity={initialVelocity}
          showTrail={showTrail}
          showVectors={showVectors}
          showSecondPlanet={showSecondPlanet}
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
        timeElapsed={0}
      />

      {/* Parameter Controls - Toggleable */}
      <FloatingControlPanel
        title="⚙️ Orbital Parameters"
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
