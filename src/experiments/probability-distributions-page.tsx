"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProbabilitySceneComponent, ProbabilityData } from "@/experiments/probability-distributions-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

const DISTRIBUTIONS = ["normal", "binomial", "poisson"] as const;

export default function ProbabilityDistributionsPage() {
  const router = useRouter();
  const [data, setData] = useState<ProbabilityData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [distributionType, setDistributionType] = useState<typeof DISTRIBUTIONS[number]>("normal");
  const [mean, setMean] = useState(0);
  const [stdDev, setStdDev] = useState(1);
  const [sampleSize, setSampleSize] = useState(100);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setMean(0);
    setStdDev(1);
    setSampleSize(100);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Distribution Type">
        <div className="grid grid-cols-3 gap-2">
          {DISTRIBUTIONS.map((dist) => (
            <button
              key={dist}
              onClick={() => setDistributionType(dist)}
              className={`py-2 px-3 text-sm rounded-lg transition-all capitalize ${
                distributionType === dist
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {dist}
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup title="Parameters">
        <ControlSlider
          label="Mean (μ)"
          value={mean}
          unit=""
          min={-3}
          max={3}
          step={0.1}
          color="#06b6d4"
          onChange={setMean}
          decimals={1}
        />
        <ControlSlider
          label="Std Dev (σ)"
          value={stdDev}
          unit=""
          min={0.5}
          max={3}
          step={0.1}
          color="#0891b2"
          onChange={setStdDev}
          decimals={1}
        />
        <ControlSlider
          label="Sample Size"
          value={sampleSize}
          unit="n"
          min={10}
          max={500}
          step={10}
          color="#0e7490"
          onChange={setSampleSize}
          decimals={0}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/probability-distributions/details")}
        className="w-full py-2.5 bg-gradient-to-r from-cyan-100 to-cyan-200 hover:from-cyan-200 hover:to-cyan-300 text-cyan-700 font-medium text-sm rounded-lg transition-all border border-cyan-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          mean: { value: data.mean, unit: "μ", color: "#06b6d4", decimals: 1 },
          stdDev: { value: data.stdDev, unit: "σ", color: "#0891b2", decimals: 1 },
          sampleSize: { value: data.sampleSize, unit: "n", color: "#0e7490", decimals: 0 },
        }}
        columns={1}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-cyan-400 text-sm">
          {distributionType === "normal" && "f(x) = (1/σ√2π) × e^(-½((x-μ)/σ)²)"}
          {distributionType === "binomial" && "P(X=k) = C(n,k) × p^k × (1-p)^(n-k)"}
          {distributionType === "poisson" && "P(X=k) = (λ^k × e^(-λ)) / k!"}
        </div>
      </div>
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Waiting for simulation data...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Probability Distributions"
        description="Explore Normal, Binomial, and Poisson distributions"
        cameraPosition={[15, 10, 15]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ProbabilitySceneComponent
          onDataChange={setData}
          distributionType={distributionType}
          mean={mean}
          stdDev={stdDev}
          sampleSize={sampleSize}
          isPlaying={isPlaying}
        />
      </ExperimentContainer>

      <SimulationController isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} speed={simulationSpeed} onSpeedChange={setSimulationSpeed} />

      <FloatingControlPanel title="⚙️ Distribution Settings" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
