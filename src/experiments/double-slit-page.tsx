"use client";

import { useState } from "react";
import { DoubleSlitSceneComponent, DoubleSlitData } from "@/experiments/double-slit-scene";
import { ExperimentContainer } from "@/components/experiment-ui/ExperimentContainer";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

export default function DoubleSlitPage() {
  const [data, setData] = useState<DoubleSlitData | null>(null);
  const [config, setConfig] = useState({ wavelength: 500, slitSeparation: 2, slitWidth: 0.3 });
  const [controlsVisible, setControlsVisible] = useState(false);

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const wavelengthColor = `hsl(${540 - config.wavelength * 0.6}, 100%, 50%)`;

  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Wave Parameters">
        <ControlSlider label="Wavelength" value={config.wavelength} unit="nm" min={380} max={700} step={10} color={wavelengthColor} onChange={(v) => updateConfig("wavelength", v)} decimals={0} />
        <ControlSlider label="Slit Separation" value={config.slitSeparation} unit="m" min={0.5} max={5} step={0.1} color="#ec4899" onChange={(v) => updateConfig("slitSeparation", v)} />
        <ControlSlider label="Slit Width" value={config.slitWidth} unit="m" min={0.1} max={1} step={0.05} color="#22c55e" onChange={(v) => updateConfig("slitWidth", v)} />
      </ControlGroup>
    </div>
  );

  const dataPanel = data ? (
    <DataGrid data={{ fringeSpacing: { value: data.fringeSpacing, unit: "m", color: "#a855f7" }, wavelength: { value: data.currentWavelength, unit: "nm", color: wavelengthColor } }} columns={1} />
  ) : null;

  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About Double Slit Experiment</h3>
        <p className="text-sm leading-relaxed">
          The double slit experiment demonstrates wave-particle duality. Light passing through two slits creates an interference pattern,
          even when photons pass through one at a time.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Formula</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm">
          <div className="text-purple-300">Fringe Spacing: Δy = λL/d</div>
          <div className="text-xs text-gray-400 mt-2">where λ=wavelength, L=distance to screen, d=slit separation</div>
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Historical Significance</h3>
        <p className="text-sm leading-relaxed">
          Originally performed by Thomas Young in 1801, this experiment helped establish the wave theory of light.
          In modern quantum mechanics, it demonstrates the fundamental nature of quantum superposition.
        </p>
      </section>
    </div>
  );

  return (
    <ExperimentContainer
      title="Double Slit Interference"
      description="Observe wave-particle duality and interference patterns"
      cameraPosition={[35, 22, 35]}
      backgroundColor="#050510"
      controls={controls}
      dataPanel={dataPanel}
      details={details}
    >
      <DoubleSlitSceneComponent onDataChange={setData} {...config} />
    </ExperimentContainer>
  );
}
