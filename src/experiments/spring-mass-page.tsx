"use client";

import { useState } from "react";
import { SpringMassSceneComponent, SpringData } from "@/experiments/spring-mass-scene";
import { ExperimentContainer, FloatingControlPanel } from "@/components/experiment-ui";
import { ControlGroup, ControlSlider, DataGrid, EnergyBar } from "@/components/experiment-ui/ExperimentControls";

export default function SpringMassPage() {
  const [data, setData] = useState<SpringData | null>(null);
  const [config, setConfig] = useState({
    mass: 2,
    stiffness: 50,
    damping: 0.3,
    initialDisplacement: 2,
  });
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Mass & Spring Parameters">
        <ControlSlider label="Mass (m)" value={config.mass} unit="kg" min={0.5} max={10} step={0.5} color="#3b82f6" onChange={(v) => updateConfig("mass", v)} />
        <ControlSlider label="Spring Constant (k)" value={config.stiffness} unit="N/m" min={10} max={200} step={10} color="#22c55e" onChange={(v) => updateConfig("stiffness", v)} />
        <ControlSlider label="Damping (c)" value={config.damping} unit="" min={0} max={2} step={0.1} color="#f59e0b" onChange={(v) => updateConfig("damping", v)} />
        <ControlSlider label="Initial Displacement" value={config.initialDisplacement} unit="m" min={-3} max={3} step={0.5} color="#ec4899" onChange={(v) => updateConfig("initialDisplacement", v)} />
      </ControlGroup>

      <button onClick={handleReset} className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg">
        🔄 Reset Simulation
      </button>
    </div>
  );

  const dataPanel = data ? (
    <>
      <DataGrid
        data={{
          period: { value: data.period, unit: "s", color: "#3b82f6" },
          frequency: { value: data.frequency, unit: "Hz", color: "#8b5cf6" },
          displacement: { value: data.displacement, unit: "m", color: "#f59e0b" },
          velocity: { value: data.velocity, unit: "m/s", color: "#10b981" },
        }}
        columns={2}
      />
      <div className="mt-4">
        <EnergyBar kinetic={data.kineticEnergy} potential={data.potentialEnergy} total={data.totalEnergy} />
      </div>
    </>
  ) : null;

  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About Spring-Mass System</h3>
        <p className="text-sm leading-relaxed">
          A spring-mass system exhibits simple harmonic motion when displaced from equilibrium. The restoring force is proportional to displacement (Hooke's Law).
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Formulas</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-2">
          <div className="text-purple-300">Period: T = 2π√(m/k)</div>
          <div className="text-pink-300">Frequency: f = 1/T = (1/2π)√(k/m)</div>
          <div className="text-green-300">Force: F = -kx</div>
          <div className="text-blue-300">KE = ½mv²</div>
          <div className="text-yellow-300">PE = ½kx²</div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• Car suspension systems</li>
          <li>• Building earthquake dampers</li>
          <li>• Watch mechanisms</li>
          <li>• Mattress design</li>
        </ul>
      </section>
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Spring-Mass System"
        description="Observe simple harmonic motion and energy conservation"
        cameraPosition={[30, 18, 30]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
        details={details}
      >
        <SpringMassSceneComponent onDataChange={setData} {...config} resetTrigger={resetTrigger} />
      </ExperimentContainer>

      <FloatingControlPanel
        title="Spring-Mass Controls"
        onReset={handleReset}
        initialPosition={{ x: 20, y: 80 }}
      >
        {controls}
      </FloatingControlPanel>
    </>
  );
}
