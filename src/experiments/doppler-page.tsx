"use client";

import { useState } from "react";
import { DopplerSceneComponent, DopplerData } from "@/experiments/doppler-scene";
import { ExperimentContainer, FloatingControlPanel } from "@/components/experiment-ui";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

export default function DopplerPage() {
  const [data, setData] = useState<DopplerData | null>(null);
  const [config, setConfig] = useState({
    sourceFrequency: 2,
    sourceVelocity: 5,
    waveSpeed: 10,
    showWavefronts: true,
  });
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleReset = () => setResetTrigger((prev) => prev + 1);

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Wave Parameters">
        <ControlSlider label="Source Frequency (f₀)" value={config.sourceFrequency} unit="Hz" min={0.5} max={5} step={0.1} color="#f59e0b" onChange={(v) => updateConfig("sourceFrequency", v)} />
        <ControlSlider label="Source Velocity (vₛ)" value={config.sourceVelocity} unit="m/s" min={0} max={15} step={0.5} color="#3b82f6" onChange={(v) => updateConfig("sourceVelocity", v)} />
        <ControlSlider label="Wave Speed (v)" value={config.waveSpeed} unit="m/s" min={5} max={20} step={1} color="#22c55e" onChange={(v) => updateConfig("waveSpeed", v)} decimals={0} />
      </ControlGroup>
      <button onClick={handleReset} className="w-full py-3 bg-linear-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-lg">🔄 Reset</button>
    </div>
  );

  const dataPanel = data ? (
    <>
      <DataGrid data={{ sourceFrequency: { value: data.sourceFrequency, unit: "Hz", color: "#f59e0b" }, observedFrequency: { value: data.observedFrequency, unit: "Hz", color: data.shiftType === "blueshift" ? "#3b82f6" : "#ef4444" }, machNumber: { value: data.machNumber, unit: "", color: "#ec4899" } }} columns={1} />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Shift:</span>
          <span className={`font-bold ${data.shiftType === "blueshift" ? "text-blue-400" : data.shiftType === "redshift" ? "text-red-400" : "text-green-400"}`}>
            {data.shiftType === "blueshift" ? "🔵 Blueshift" : data.shiftType === "redshift" ? "🔴 Redshift" : "🟢 None"}
          </span>
        </div>
        {data.machNumber >= 1 && <div className="mt-2 text-xs text-purple-400">⚠️ SUPERSONIC! Mach {data.machNumber.toFixed(2)}</div>}
      </div>
    </>
  ) : null;

  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About Doppler Effect</h3>
        <p className="text-sm leading-relaxed">
          The Doppler effect is the change in frequency of a wave in relation to an observer moving relative to the wave source.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Formula</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-2">
          <div className="text-purple-300">f' = f × (v / (v ± vₛ))</div>
          <div className="text-xs text-gray-400">Moving toward: -, Moving away: +</div>
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• Police radar guns</li>
          <li>• Medical ultrasound</li>
          <li>• Astronomical redshift (expanding universe)</li>
          <li>• Weather radar</li>
        </ul>
      </section>
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Doppler Effect"
        description="Observe frequency shift from moving sound sources"
        cameraPosition={[0, 35, 45]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
        details={details}
      >
        <DopplerSceneComponent onDataChange={setData} {...config} resetTrigger={resetTrigger} />
      </ExperimentContainer>

      <FloatingControlPanel
        title="Doppler Controls"
        onReset={handleReset}
        initialPosition={{ x: 20, y: 80 }}
      >
        {controls}
      </FloatingControlPanel>
    </>
  );
}
