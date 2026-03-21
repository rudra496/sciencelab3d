"use client";

import { useState } from "react";
import { WaveInterferenceSceneComponent, WaveData } from "@/experiments/wave-interference-scene";
import { ExperimentContainer } from "@/components/experiment-ui/ExperimentContainer";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

interface WaveConfig {
  frequency: number;
  amplitude: number;
  sourceSeparation: number;
  waveSpeed: number;
  showNodes: boolean;
}

export default function WaveInterferencePage() {
  const [data, setData] = useState<WaveData | null>(null);
  const [config, setConfig] = useState<WaveConfig>({
    frequency: 2,
    amplitude: 0.8,
    sourceSeparation: 6,
    waveSpeed: 3,
    showNodes: true,
  });

  const updateConfig = (key: keyof WaveConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Wave Parameters">
        <ControlSlider label="Frequency" value={config.frequency} unit="Hz" min={0.5} max={5} step={0.1} color="#a855f7" onChange={(v) => updateConfig("frequency", v)} />
        <ControlSlider label="Amplitude" value={config.amplitude} unit="m" min={0.2} max={2} step={0.1} color="#ec4899" onChange={(v) => updateConfig("amplitude", v)} />
        <ControlSlider label="Source Separation" value={config.sourceSeparation} unit="m" min={2} max={12} step={0.5} color="#22c55e" onChange={(v) => updateConfig("sourceSeparation", v)} />
        <ControlSlider label="Wave Speed" value={config.waveSpeed} unit="m/s" min={1} max={5} step={0.1} color="#3b82f6" onChange={(v) => updateConfig("waveSpeed", v)} />
      </ControlGroup>

      <ControlGroup title="Display Options">
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
            <span>Show Nodes/Antinodes</span>
            <input type="checkbox" checked={config.showNodes} onChange={(e) => updateConfig("showNodes", e.target.checked)} className="w-5 h-5 rounded accent-purple-500" />
          </label>
        </div>
      </ControlGroup>
    </div>
  );

  const dataPanel = data ? (
    <DataGrid
      data={{
        wavelength: { value: data.wavelength, unit: "m", color: "#a855f7" },
        frequency: { value: config.frequency, unit: "Hz", color: "#ec4899" },
        waveSpeed: { value: config.waveSpeed, unit: "m/s", color: "#06d6a0" },
        maxIntensity: { value: data.maxIntensity, unit: "", color: "#f59e0b", decimals: 2 },
      }}
      columns={2}
    />
  ) : null;

  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About Wave Interference</h3>
        <p className="text-sm leading-relaxed">
          When two or more waves overlap, their amplitudes add together. This creates interference patterns with regions of
          constructive interference (antinodes) and destructive interference (nodes).
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Concepts</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong className="text-white">Constructive Interference:</strong> Waves in phase → amplitude adds</li>
          <li>• <strong className="text-white">Destructive Interference:</strong> Waves out of phase → amplitude cancels</li>
          <li>• <strong className="text-white">Path Difference:</strong> Δr = nλ (constructive), Δr = (n+½)λ (destructive)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Real-World Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• Noise-canceling headphones</li>
          <li>• Optical coatings on lenses</li>
          <li>• Radio antenna arrays</li>
          <li>• Acoustic design in concert halls</li>
        </ul>
      </section>
    </div>
  );

  return (
    <ExperimentContainer
      title="Wave Interference"
      description="Observe constructive and destructive interference patterns from two wave sources"
      cameraPosition={[35, 28, 35]}
      backgroundColor="#050510"
      controls={controls}
      dataPanel={dataPanel}
      details={details}
    >
      <WaveInterferenceSceneComponent onDataChange={setData} {...config} />
    </ExperimentContainer>
  );
}
