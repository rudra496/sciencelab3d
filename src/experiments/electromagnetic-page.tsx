"use client";

import { useState } from "react";
import { ElectromagneticSceneComponent, EMFieldData } from "@/experiments/electromagnetic-scene";
import { ExperimentContainer } from "@/components/experiment-ui/ExperimentContainer";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

export default function ElectromagneticPage() {
  const [data, setData] = useState<EMFieldData | null>(null);
  const [config, setConfig] = useState({
    charge1: 5,
    charge2: -5,
    testCharge: 1,
    showFieldLines: true,
  });

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Charges">
        <ControlSlider label="Charge 1 (q₁)" value={config.charge1} unit="µC" min={-10} max={10} step={1} color={config.charge1 >= 0 ? "#ef4444" : "#3b82f6"} onChange={(v) => updateConfig("charge1", v)} decimals={0} />
        <ControlSlider label="Charge 2 (q₂)" value={config.charge2} unit="µC" min={-10} max={10} step={1} color={config.charge2 >= 0 ? "#ef4444" : "#3b82f6"} onChange={(v) => updateConfig("charge2", v)} decimals={0} />
        <ControlSlider label="Test Charge (q₀)" value={config.testCharge} unit="µC" min={0.1} max={5} step={0.1} color="#f59e0b" onChange={(v) => updateConfig("testCharge", v)} />
      </ControlGroup>
    </div>
  );

  const dataPanel = data ? (
    <>
      <DataGrid data={{ electricField: { value: data.electricField, unit: "N/C", color: "#f59e0b" }, potential: { value: data.potential, unit: "V", color: "#8b5cf6" }, force: { value: data.force, unit: "N", color: "#ec4899" } }} columns={1} />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Coulomb's Law</div>
        <div className="font-mono text-sm text-cyan-300">F = k(q₁q₂)/r²</div>
      </div>
    </>
  ) : null;

  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About Electric Fields</h3>
        <p className="text-sm leading-relaxed">
          An electric field surrounds electric charges and exerts force on other charges in the field. Field lines show the
          direction a positive test charge would move.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Concepts</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong className="text-white">Electric Field:</strong> E = F/q₀ = kQ/r²</li>
          <li>• <strong className="text-white">Electric Potential:</strong> V = kQ/r</li>
          <li>• <strong className="text-white">Field Lines:</strong> Start on + charges, end on - charges</li>
          <li>• <strong className="text-white">Equipotential Lines:</strong> Perpendicular to field lines</li>
        </ul>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• Capacitors and electronics</li>
          <li>• Particle accelerators</li>
          <li>• Lightning and atmospheric electricity</li>
          <li>• Medical imaging (MRI, EKG)</li>
        </ul>
      </section>
    </div>
  );

  return (
    <ExperimentContainer
      title="Electromagnetic Field"
      description="Visualize electric fields, forces, and equipotential lines"
      cameraPosition={[0, 0, 40]}
      backgroundColor="#050510"
      controls={controls}
      dataPanel={dataPanel}
      details={details}
    >
      <ElectromagneticSceneComponent onDataChange={setData} {...config} />
    </ExperimentContainer>
  );
}
