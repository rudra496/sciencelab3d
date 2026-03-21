"use client";

import { useState } from "react";
import { ProjectileMotionSceneComponent, ProjectileData } from "@/experiments/projectile-motion-scene";
import { ExperimentContainer } from "@/components/experiment-ui/ExperimentContainer";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

/** Gravity presets */
const GRAVITY_PRESETS = [
  { label: "Earth", value: 9.81, emoji: "🌍" },
  { label: "Moon", value: 1.62, emoji: "🌙" },
  { label: "Mars", value: 3.72, emoji: "🔴" },
  { label: "Jupiter", value: 24.79, emoji: "🟠" },
];

interface ProjectileConfig {
  velocity: number;
  angle: number;
  gravity: number;
  mass: number;
  airResistance: boolean;
  dragCoefficient: number;
  targetDistance: number;
  showTrail: boolean;
  showPrediction: boolean;
  showVelocityVector: boolean;
  showGhostMarkers: boolean;
  showDistanceMarkers: boolean;
}

export default function ProjectileMotionPage() {
  const [data, setData] = useState<ProjectileData | null>(null);
  const [config, setConfig] = useState<ProjectileConfig>({
    velocity: 30,
    angle: 45,
    gravity: 9.81,
    mass: 1,
    airResistance: false,
    dragCoefficient: 0.02,
    targetDistance: 50,
    showTrail: true,
    showPrediction: true,
    showVelocityVector: true,
    showGhostMarkers: true,
    showDistanceMarkers: true,
  });
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [hasLaunched, setHasLaunched] = useState(false);

  const handleLaunch = () => {
    setHasLaunched(true);
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setHasLaunched(false);
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setData(null);
  };

  const updateConfig = (key: keyof ProjectileConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // === CONTROLS ===
  const controls = (
    <div className="space-y-5">
      {/* Launch Controls */}
      <ControlGroup title="Launch Controls">
        <div className="flex gap-2">
          <button
            onClick={handleLaunch}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition-all shadow-lg text-sm"
          >
            🚀 Launch
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg text-sm"
          >
            🔄 Reset
          </button>
        </div>

        {hasLaunched && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-full mt-2 py-3 rounded-lg font-semibold transition-all shadow-lg text-sm ${
              isPlaying
                ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/30"
                : "bg-green-600 hover:bg-green-500 text-white shadow-green-500/30"
            }`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Resume"}
          </button>
        )}

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Speed</span>
            <span className="font-mono text-purple-400">{simulationSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range" min="0.1" max="3" step="0.1" value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer touch-none"
            style={{ accentColor: "#8b5cf6" }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.1x</span><span>1x</span><span>3x</span>
          </div>
        </div>
      </ControlGroup>

      {/* Physics */}
      <ControlGroup title="Physics Parameters">
        <ControlSlider label="Velocity (v₀)" value={config.velocity} unit="m/s" min={5} max={80} step={1} color="#a855f7" onChange={(v) => updateConfig("velocity", v)} disabled={hasLaunched} />
        <ControlSlider label="Angle (θ)" value={config.angle} unit="°" min={5} max={85} step={1} color="#ec4899" onChange={(v) => updateConfig("angle", v)} decimals={0} disabled={hasLaunched} />
        <ControlSlider label="Mass (m)" value={config.mass} unit="kg" min={0.1} max={10} step={0.1} color="#3b82f6" onChange={(v) => updateConfig("mass", v)} />

        {/* Gravity presets */}
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gravity (g)</span>
            <span className="font-mono text-green-400">{config.gravity.toFixed(2)} m/s²</span>
          </div>
          <input
            type="range" min="0.5" max="26" step="0.01" value={config.gravity}
            onChange={(e) => updateConfig("gravity", parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer touch-none"
            style={{ accentColor: "#22c55e" }}
          />
          <div className="flex flex-wrap gap-1.5 mt-1">
            {GRAVITY_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => updateConfig("gravity", p.value)}
                className={`px-2 py-1 text-xs rounded-md border transition-all ${
                  Math.abs(config.gravity - p.value) < 0.05
                    ? "bg-green-600/30 border-green-500 text-green-300"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>
      </ControlGroup>

      {/* Environment */}
      <ControlGroup title="Environment">
        <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <span>Air Resistance (F ∝ v²)</span>
          <input
            type="checkbox" checked={config.airResistance}
            onChange={(e) => updateConfig("airResistance", e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500"
            disabled={hasLaunched}
          />
        </label>
        {config.airResistance && (
          <ControlSlider label="Drag Coefficient" value={config.dragCoefficient} unit="" min={0.001} max={0.15} step={0.001} color="#f59e0b" onChange={(v) => updateConfig("dragCoefficient", v)} decimals={3} disabled={hasLaunched} />
        )}
        <ControlSlider label="Target Distance" value={config.targetDistance} unit="m" min={10} max={150} step={5} color="#f97316" onChange={(v) => updateConfig("targetDistance", v)} decimals={0} />
      </ControlGroup>

      {/* Display */}
      <ControlGroup title="Display Options">
        {[
          { label: "Trajectory Trail", key: "showTrail" as const },
          { label: "Predicted Path", key: "showPrediction" as const },
          { label: "Velocity Vector", key: "showVelocityVector" as const },
          { label: "Ghost Markers (0.5s)", key: "showGhostMarkers" as const },
          { label: "Distance Markers", key: "showDistanceMarkers" as const },
        ].map((opt) => (
          <label key={opt.key} className="flex items-center justify-between text-sm text-gray-300 cursor-pointer py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <span>{opt.label}</span>
            <input
              type="checkbox" checked={config[opt.key]}
              onChange={(e) => updateConfig(opt.key, e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
          </label>
        ))}
      </ControlGroup>
    </div>
  );

  // === DATA PANEL ===
  const dataPanel = data ? (
    <>
      <DataGrid
        data={{
          posX: { value: data.currentX, unit: "m", color: "#a855f7" },
          posY: { value: data.currentY, unit: "m", color: "#ec4899" },
          speed: { value: data.speed, unit: "m/s", color: "#22c55e" },
          time: { value: data.flightTime, unit: "s", color: "#06d6a0" },
          maxH: { value: data.maxHeight, unit: "m", color: "#f59e0b" },
          range: { value: data.range, unit: "m", color: "#818cf8" },
        }}
        columns={2}
      />
      <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-gray-800/50 rounded">
          <span className="text-gray-500">Kinetic Energy</span>
          <div className="font-mono text-orange-400">{data.kineticEnergy.toFixed(1)} J</div>
        </div>
        <div className="p-2 bg-gray-800/50 rounded">
          <span className="text-gray-500">Potential Energy</span>
          <div className="font-mono text-blue-400">{data.potentialEnergy.toFixed(1)} J</div>
        </div>
      </div>
      {data.hasLanded && (
        <div className="mt-2 p-2 bg-green-900/30 border border-green-500/30 rounded-lg text-xs space-y-1">
          <div className="text-green-400 font-semibold">✅ Landed!</div>
          <div className="flex justify-between text-gray-400">
            <span>Range:</span>
            <span className="font-mono text-purple-300">{data.range.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Predicted:</span>
            <span className="font-mono text-pink-300">{data.predictedRange.toFixed(1)} m</span>
          </div>
          {data.impactVelocity > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Impact speed:</span>
              <span className="font-mono text-red-300">{data.impactVelocity.toFixed(1)} m/s @ {data.impactAngle.toFixed(0)}°</span>
            </div>
          )}
        </div>
      )}
    </>
  ) : null;

  // === DETAILS ===
  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">🎯 About Projectile Motion</h3>
        <p className="text-sm leading-relaxed">
          Projectile motion is the motion of an object thrown or projected into the air, subject only to the acceleration of gravity.
          The horizontal and vertical motions are <strong className="text-white">independent</strong> of each other —
          a revolutionary insight from Galileo. The resulting path is a parabola (without air resistance).
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">💡 Key Physics Concepts</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Independence of Motions:</strong> Horizontal velocity is constant; vertical motion is free fall</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Optimal Angle:</strong> 45° gives maximum range (no air resistance)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Complementary Angles:</strong> Angles θ and (90°-θ) give the same range</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Air Resistance:</strong> Drag force F = -½ρCdA|v|v opposes motion, making trajectory asymmetric</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Maximum Height:</strong> Occurs when vertical velocity = 0</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">📐 Formulas</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-3">
          <div><span className="text-gray-500 text-xs">Horizontal position:</span><br /><span className="text-purple-300">x(t) = v₀·cos(θ)·t</span></div>
          <div><span className="text-gray-500 text-xs">Vertical position:</span><br /><span className="text-pink-300">y(t) = v₀·sin(θ)·t - ½gt²</span></div>
          <div><span className="text-gray-500 text-xs">Horizontal velocity:</span><br /><span className="text-green-300">vₓ = v₀·cos(θ)</span></div>
          <div><span className="text-gray-500 text-xs">Vertical velocity:</span><br /><span className="text-blue-300">vᵧ = v₀·sin(θ) - gt</span></div>
          <div><span className="text-gray-500 text-xs">Range:</span><br /><span className="text-yellow-300">R = v₀²·sin(2θ) / g</span></div>
          <div><span className="text-gray-500 text-xs">Max Height:</span><br /><span className="text-orange-300">H = v₀²·sin²(θ) / (2g)</span></div>
          <div><span className="text-gray-500 text-xs">Time of Flight:</span><br /><span className="text-cyan-300">T = 2v₀·sin(θ) / g</span></div>
          <div><span className="text-gray-500 text-xs">With air resistance (drag):</span><br /><span className="text-red-300">F_drag = -C_d · |v| · v̂</span></div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">💨 Air Resistance</h3>
        <p className="text-sm leading-relaxed">
          In reality, projectiles experience air resistance proportional to the <strong className="text-white">square of their speed</strong> (quadratic drag).
          This simulation uses RK4 numerical integration to solve the equations of motion with drag.
          You&apos;ll notice: shorter range, asymmetric trajectory (steeper descent), and reduced time of flight compared to the ideal case.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">🔬 Real-World Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong className="text-white">Sports:</strong> Basketball, football, golf, javelin — all follow projectile physics</li>
          <li>• <strong className="text-white">Military:</strong> Artillery trajectory calculation and ballistic missile design</li>
          <li>• <strong className="text-white">Space:</strong> Rocket launch trajectories and orbital insertion</li>
          <li>• <strong className="text-white">Engineering:</strong> Water fountains, fireworks, sprinkler systems</li>
          <li>• <strong className="text-white">Entertainment:</strong> Angry Birds physics engine!</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">🎮 How to Use</h3>
        <ul className="space-y-2 text-sm">
          <li>• Set <strong className="text-purple-400">velocity</strong> and <strong className="text-pink-400">angle</strong>, then hit <strong className="text-green-400">🚀 Launch</strong></li>
          <li>• Watch the <strong className="text-yellow-400">ghost markers</strong> appear every 0.5s to see time spacing</li>
          <li>• Enable <strong className="text-orange-400">Air Resistance</strong> to see how drag affects the trajectory</li>
          <li>• Compare <strong className="text-purple-300">predicted</strong> vs <strong className="text-pink-300">actual</strong> range after landing</li>
          <li>• Try different <strong className="text-green-400">gravity presets</strong> — the Moon gives crazy range!</li>
          <li>• Adjust <strong className="text-blue-400">target distance</strong> and try to hit the bullseye</li>
          <li>• Use <strong className="text-purple-400">Speed</strong> slider for slow-motion analysis</li>
        </ul>
      </section>
    </div>
  );

  return (
    <ExperimentContainer
      title="Projectile Motion"
      description="Study parabolic trajectories under gravity with realistic air resistance, muzzle effects, and target practice"
      cameraPosition={[70, 40, 70]}
      backgroundColor="#050510"
      controls={controls}
      dataPanel={dataPanel}
      details={details}
      simulationBar={{
        isPlaying,
        onPlayPause: () => setIsPlaying((p) => !p),
        onReset: handleReset,
        speed: simulationSpeed,
        onSpeedChange: setSimulationSpeed,
      }}
    >
      <ProjectileMotionSceneComponent
        onDataChange={setData}
        velocity={config.velocity}
        angle={config.angle}
        gravity={config.gravity}
        mass={config.mass}
        airResistance={config.airResistance}
        dragCoefficient={config.dragCoefficient}
        targetDistance={config.targetDistance}
        showTrail={config.showTrail}
        showPrediction={config.showPrediction}
        showVelocityVector={config.showVelocityVector}
        showGhostMarkers={config.showGhostMarkers}
        showDistanceMarkers={config.showDistanceMarkers}
        resetTrigger={resetTrigger}
        isPlaying={isPlaying}
        simulationSpeed={simulationSpeed}
      />
    </ExperimentContainer>
  );
}
