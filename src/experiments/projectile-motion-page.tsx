"use client";

import { useState } from "react";
import { ProjectileMotionSceneComponent, ProjectileData } from "@/experiments/projectile-motion-scene";
import { ExperimentContainer } from "@/components/experiment-ui/ExperimentContainer";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

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
  });
  const [resetTrigger, setResetTrigger] = useState(0);
  const [launched, setLaunched] = useState(false);

  const handleLaunch = () => {
    if (!launched) {
      setLaunched(true);
      setResetTrigger((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setLaunched(false);
    setResetTrigger((prev) => prev + 1);
  };

  const updateConfig = (key: keyof ProjectileConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Controls panel
  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Launch Controls">
        <div className="flex gap-2">
          <button
            onClick={handleLaunch}
            disabled={launched}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg"
          >
            🚀 Launch
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all shadow-lg"
          >
            🔄 Reset
          </button>
        </div>
      </ControlGroup>

      <ControlGroup title="Physics Parameters">
        <ControlSlider
          label="Velocity (v₀)"
          value={config.velocity}
          unit="m/s"
          min={5}
          max={60}
          step={1}
          color="#a855f7"
          onChange={(v) => updateConfig("velocity", v)}
          disabled={launched}
        />
        <ControlSlider
          label="Angle (θ)"
          value={config.angle}
          unit="°"
          min={5}
          max={85}
          step={1}
          color="#ec4899"
          onChange={(v) => updateConfig("angle", v)}
          decimals={0}
          disabled={launched}
        />
        <ControlSlider
          label="Gravity (g)"
          value={config.gravity}
          unit="m/s²"
          min={1}
          max={20}
          step={0.1}
          color="#22c55e"
          onChange={(v) => updateConfig("gravity", v)}
        />
        <ControlSlider
          label="Mass (m)"
          value={config.mass}
          unit="kg"
          min={0.1}
          max={10}
          step={0.1}
          color="#3b82f6"
          onChange={(v) => updateConfig("mass", v)}
        />
      </ControlGroup>

      <ControlGroup title="Environment">
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
            <span>Air Resistance</span>
            <input
              type="checkbox"
              checked={config.airResistance}
              onChange={(e) => updateConfig("airResistance", e.target.checked)}
              className="w-5 h-5 rounded accent-purple-500"
              disabled={launched}
            />
          </label>

          {config.airResistance && (
            <ControlSlider
              label="Drag Coeff"
              value={config.dragCoefficient}
              unit=""
              min={0.001}
              max={0.1}
              step={0.001}
              color="#f59e0b"
              onChange={(v) => updateConfig("dragCoefficient", v)}
              decimals={3}
              disabled={launched}
            />
          )}

          <ControlSlider
            label="Target Distance"
            value={config.targetDistance}
            unit="m"
            min={10}
            max={100}
            step={5}
            color="#f97316"
            onChange={(v) => updateConfig("targetDistance", v)}
            decimals={0}
          />
        </div>
      </ControlGroup>

      <ControlGroup title="Display Options">
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
            <span>Show Trail</span>
            <input
              type="checkbox"
              checked={config.showTrail}
              onChange={(e) => updateConfig("showTrail", e.target.checked)}
              className="w-5 h-5 rounded accent-purple-500"
            />
          </label>
          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
            <span>Show Prediction</span>
            <input
              type="checkbox"
              checked={config.showPrediction}
              onChange={(e) => updateConfig("showPrediction", e.target.checked)}
              className="w-5 h-5 rounded accent-purple-500"
            />
          </label>
        </div>
      </ControlGroup>
    </div>
  );

  // Data panel
  const dataPanel = data ? (
    <>
      <DataGrid
        data={{
          posX: { value: data.currentX, unit: "m", color: "#a855f7" },
          posY: { value: data.currentY, unit: "m", color: "#ec4899" },
          speed: { value: data.speed, unit: "m/s", color: "#22c55e" },
          time: { value: data.flightTime, unit: "s", color: "#06d6a0" },
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
    </>
  ) : null;

  // Details panel
  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About Projectile Motion</h3>
        <p className="text-sm leading-relaxed">
          Projectile motion is the motion of an object thrown or projected into the air, subject only to gravitational acceleration.
          In the absence of air resistance, the horizontal and vertical motions are independent.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Physics Concepts</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Range:</strong> Horizontal distance traveled. R = (v₀² × sin(2θ)) / g</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Max Height:</strong> H = (v₀ × sinθ)² / (2g)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Time of Flight:</strong> T = (2 × v₀ × sinθ) / g</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span><strong className="text-white">Optimal Angle:</strong> 45° for maximum range (without air resistance)</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Formulas</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-2">
          <div className="text-purple-300">Horizontal: x(t) = v₀ × cos(θ) × t</div>
          <div className="text-pink-300">Vertical: y(t) = v₀ × sin(θ) × t - ½gt²</div>
          <div className="text-green-300">Velocity X: vₓ = v₀ × cos(θ)</div>
          <div className="text-blue-300">Velocity Y: vᵧ = v₀ × sin(θ) - gt</div>
          <div className="text-yellow-300">Trajectory: y = x × tan(θ) - (gx²)/(2v₀²cos²(θ))</div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Air Resistance</h3>
        <p className="text-sm leading-relaxed">
          When air resistance is enabled, the projectile experiences drag force proportional to velocity squared.
          This reduces both range and flight time, making the trajectory asymmetric.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Real-World Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• Sports (basketball, football, golf)</li>
          <li>• Military ballistics and artillery</li>
          <li>• Space launch trajectories</li>
          <li>• Water fountains and fireworks</li>
        </ul>
      </section>
    </div>
  );

  return (
    <ExperimentContainer
      title="Projectile Motion"
      description="Study parabolic motion under gravity with optional air resistance. Launch projectiles and observe their trajectories."
      cameraPosition={[80, 50, 80]}
      backgroundColor="#050510"
      controls={controls}
      dataPanel={dataPanel}
      details={details}
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
        resetTrigger={resetTrigger}
      />
    </ExperimentContainer>
  );
}
