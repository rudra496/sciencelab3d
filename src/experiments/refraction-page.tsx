"use client";

import { useState } from "react";
import { RefractionSceneComponent, RefractionData } from "@/experiments/refraction-scene";
import { ExperimentContainer } from "@/components/experiment-ui/ExperimentContainer";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

export default function RefractionPage() {
  const [data, setData] = useState<RefractionData | null>(null);
  const [config, setConfig] = useState({
    incidentAngle: 45,
    n1: 1.0,
    n2: 1.5,
    showNormal: true,
  });

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Refractive Indices">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Medium 1 (n₁)</label>
            <select value={config.n1} onChange={(e) => updateConfig("n1", parseFloat(e.target.value))} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2">
              <option value={1.0}>Vacuum/Air (1.00)</option>
              <option value={1.33}>Water (1.33)</option>
              <option value={1.5}>Glass (1.50)</option>
              <option value={2.42}>Diamond (2.42)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Medium 2 (n₂)</label>
            <select value={config.n2} onChange={(e) => updateConfig("n2", parseFloat(e.target.value))} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2">
              <option value={1.0}>Vacuum/Air (1.00)</option>
              <option value={1.33}>Water (1.33)</option>
              <option value={1.5}>Glass (1.50)</option>
              <option value={2.42}>Diamond (2.42)</option>
            </select>
          </div>
        </div>
      </ControlGroup>
      <ControlGroup title="Incident Angle">
        <ControlSlider label="Angle (θᵢ)" value={config.incidentAngle} unit="°" min={0} max={89} step={1} color="#ec4899" onChange={(v) => updateConfig("incidentAngle", v)} decimals={0} />
      </ControlGroup>
    </div>
  );

  const dataPanel = data ? (
    <>
      <DataGrid data={{ incidentAngle: { value: data.incidentAngle, unit: "°", color: "#ef4444" }, refractedAngle: { value: data.refractedAngle, unit: "°", color: "#3b82f6" }, criticalAngle: { value: data.criticalAngle, unit: "°", color: "#f59e0b" } }} columns={3} />
      {data.isTIR && <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm font-semibold">⚠️ Total Internal Reflection</div>}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-gray-800/50 rounded"><span className="text-gray-500">Reflectance</span><div className="font-mono text-purple-300">{(data.reflectance * 100).toFixed(1)}%</div></div>
        <div className="p-2 bg-gray-800/50 rounded"><span className="text-gray-500">Transmittance</span><div className="font-mono text-cyan-300">{(data.transmittance * 100).toFixed(1)}%</div></div>
      </div>
    </>
  ) : null;

  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About Refraction & Reflection</h3>
        <p className="text-sm leading-relaxed">
          When light passes from one medium to another, it bends according to Snell's Law. Total internal reflection occurs
          when light travels from a denser to a rarer medium beyond the critical angle.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Formulas</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-2">
          <div className="text-purple-300">Snell's Law: n₁sin(θ₁) = n₂sin(θ₂)</div>
          <div className="text-pink-300">Critical Angle: θc = asin(n₂/n₁)</div>
          <div className="text-green-300">Reflectance (Fresnel): R = ((n₁-n₂)/(n₁+n₂))²</div>
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• Fiber optics communications</li>
          <li>• Camera lenses and glasses</li>
          <li>• Prisms and binoculars</li>
          <li>• Mirages in hot air</li>
        </ul>
      </section>
    </div>
  );

  return (
    <ExperimentContainer
      title="Refraction & Reflection"
      description="Explore Snell's law and total internal reflection"
      cameraPosition={[30, 18, 35]}
      backgroundColor="#050510"
      controls={controls}
      dataPanel={dataPanel}
      details={details}
    >
      <RefractionSceneComponent onDataChange={setData} {...config} />
    </ExperimentContainer>
  );
}
