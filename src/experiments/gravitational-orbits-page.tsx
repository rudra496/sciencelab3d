"use client";

import { useState } from "react";
import { GravitationalOrbitsSceneComponent, OrbitData } from "@/experiments/gravitational-orbits-scene";
import { ExperimentContainer, FloatingControlPanel } from "@/components/experiment-ui";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

export default function GravitationalOrbitsPage() {
  const [data, setData] = useState<OrbitData | null>(null);
  const [config, setConfig] = useState({
    starMass: 1000,
    planetMass: 1,
    initialDistance: 15,
    initialVelocity: 6,
    showTrail: true,
    showVectors: true,
  });
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleReset = () => setResetTrigger((prev) => prev + 1);

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Orbital Parameters">
        <ControlSlider label="Star Mass (M)" value={config.starMass} unit="" min={100} max={2000} step={100} color="#f59e0b" onChange={(v) => updateConfig("starMass", v)} decimals={0} />
        <ControlSlider label="Planet Mass (m)" value={config.planetMass} unit="" min={0.1} max={10} step={0.1} color="#3b82f6" onChange={(v) => updateConfig("planetMass", v)} />
        <ControlSlider label="Initial Distance (r)" value={config.initialDistance} unit="m" min={8} max={40} step={1} color="#22c55e" onChange={(v) => updateConfig("initialDistance", v)} decimals={0} />
        <ControlSlider label="Initial Velocity (v)" value={config.initialVelocity} unit="m/s" min={1} max={15} step={0.5} color="#ec4899" onChange={(v) => updateConfig("initialVelocity", v)} />
      </ControlGroup>
      <ControlGroup title="Display Options">
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
            <span>Show Orbital Trail</span>
            <input type="checkbox" checked={config.showTrail} onChange={(e) => updateConfig("showTrail", e.target.checked)} className="w-5 h-5 rounded accent-purple-500" />
          </label>
          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
            <span>Show Force/Velocity Vectors</span>
            <input type="checkbox" checked={config.showVectors} onChange={(e) => updateConfig("showVectors", e.target.checked)} className="w-5 h-5 rounded accent-purple-500" />
          </label>
        </div>
      </ControlGroup>
      <button onClick={handleReset} className="w-full py-3 bg-linear-to-r from-yellow-600 to-yellow-700 text-white font-semibold rounded-lg">🔄 Reset</button>
    </div>
  );

  const dataPanel = data ? (
    <>
      <DataGrid data={{ distance: { value: data.distance, unit: "m", color: "#3b82f6" }, velocity: { value: data.velocity, unit: "m/s", color: "#22c55e" }, escapeVelocity: { value: data.escapeVelocity, unit: "m/s", color: "#ef4444" }, period: { value: data.period, unit: "s", color: "#8b5cf6" } }} columns={2} />
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-gray-800/50 rounded"><span className="text-gray-500">Eccentricity</span><div className="font-mono text-cyan-400">{data.eccentricity.toFixed(3)}</div></div>
        <div className="p-2 bg-gray-800/50 rounded"><span className="text-gray-500">Semi-Major</span><div className="font-mono text-lime-400">{data.semiMajorAxis.toFixed(2)} m</div></div>
      </div>
    </>
  ) : null;

  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About Gravitational Orbits</h3>
        <p className="text-sm leading-relaxed">
          Orbits are the result of the balance between gravitational attraction and orbital velocity. This simulation demonstrates
          Kepler's laws and Newton's law of universal gravitation.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Formulas</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-2">
          <div className="text-purple-300">F = G(Mm)/r²</div>
          <div className="text-pink-300">v = √(GM/r) (circular)</div>
          <div className="text-green-300">T = 2π√(r³/GM)</div>
          <div className="text-blue-300">v_escape = √(2GM/r)</div>
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Kepler's Laws</h3>
        <ul className="space-y-2 text-sm">
          <li>1. Orbits are ellipses with the star at one focus</li>
          <li>2. Equal areas are swept in equal times</li>
          <li>3. T² ∝ r³</li>
        </ul>
      </section>
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Gravitational Orbits"
        description="Explore orbital mechanics and gravitational interactions"
        cameraPosition={[50, 35, 50]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
        details={details}
      >
        <GravitationalOrbitsSceneComponent onDataChange={setData} {...config} resetTrigger={resetTrigger} />
      </ExperimentContainer>

      <FloatingControlPanel
        title="Orbit Controls"
        onReset={handleReset}
        initialPosition={{ x: 20, y: 80 }}
      >
        {controls}
      </FloatingControlPanel>
    </>
  );
}
