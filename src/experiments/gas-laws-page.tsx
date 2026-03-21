"use client";

import { useState } from "react";
import { GasLawsSceneComponent, GasData } from "@/experiments/gas-laws-scene";
import { ExperimentContainer } from "@/components/experiment-ui/ExperimentContainer";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

interface GasConfig {
  temperature: number;
  volume: number;
  numParticles: number;
}

export default function GasLawsPage() {
  const [data, setData] = useState<GasData | null>(null);
  const [config, setConfig] = useState<GasConfig>({
    temperature: 300,
    volume: 5,
    numParticles: 100,
  });

  const updateConfig = (key: keyof GasConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Gas Law Parameters">
        <ControlSlider label="Temperature (T)" value={config.temperature} unit="K" min={100} max={800} step={10} color="#a855f7" onChange={(v) => updateConfig("temperature", v)} decimals={0} />
        <ControlSlider label="Volume (V)" value={config.volume} unit="L" min={1} max={10} step={0.5} color="#ec4899" onChange={(v) => updateConfig("volume", v)} />
        <ControlSlider label="Particles (n)" value={config.numParticles} unit="" min={20} max={200} step={10} color="#22c55e" onChange={(v) => updateConfig("numParticles", v)} decimals={0} />
      </ControlGroup>
    </div>
  );

  const dataPanel = data ? (
    <DataGrid
      data={{
        temperature: { value: config.temperature, unit: "K", color: "#a855f7" },
        volume: { value: config.volume, unit: "L", color: "#ec4899" },
        pressure: { value: data.pressure / 1000, unit: "kPa", color: "#06d6a0" },
        avgSpeed: { value: data.avgSpeed, unit: "m/s", color: "#f59e0b" },
      }}
      columns={2}
    />
  ) : null;

  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About Ideal Gas Law</h3>
        <p className="text-sm leading-relaxed">
          The Ideal Gas Law describes the relationship between pressure, volume, temperature, and amount of gas: PV = nRT
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Concepts</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong className="text-white">Boyle's Law:</strong> P₁V₁ = P₂V₂ (constant T)</li>
          <li>• <strong className="text-white">Charles's Law:</strong> V₁/T₁ = V₂/T₂ (constant P)</li>
          <li>• <strong className="text-white">Gay-Lussac's Law:</strong> P₁/T₁ = P₂/T₂ (constant V)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• Internal combustion engines</li>
          <li>• Weather systems and atmospheric pressure</li>
          <li>• Scuba diving calculations</li>
          <li>• Industrial gas storage</li>
        </ul>
      </section>
    </div>
  );

  return (
    <ExperimentContainer
      title="Gas Laws (Ideal Gas)"
      description="Explore PV = nRT with interactive particle simulation"
      cameraPosition={[30, 22, 30]}
      backgroundColor="#050510"
      controls={controls}
      dataPanel={dataPanel}
      details={details}
    >
      <GasLawsSceneComponent onDataChange={setData} {...config} />
    </ExperimentContainer>
  );
}
