'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
} from '@/components/experiment-ui';
import { ControlGroup, ControlSlider, DataGrid } from '@/components/experiment-ui/ExperimentControls';
import DNAReplicationSceneComponent, { DNAReplicationData } from './dna-replication-scene';

export default function DNAReplicationPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [speed, setSpeed] = useState(1);
  const [showHelicase, setShowHelicase] = useState(true);
  const [showPolymerase, setShowPolymerase] = useState(true);
  const [showPrimase, setShowPrimase] = useState(true);
  const [stage, setStage] = useState(0);

  const [dnaData, setDnaData] = useState<DNAReplicationData>({
    stage: 'Initiation',
    unwoundPercent: 0,
    nucleotidesAdded: 0,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setSpeed(1);
    setShowHelicase(true);
    setShowPolymerase(true);
    setShowPrimase(true);
    setStage(0);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: DNAReplicationData) => {
    setDnaData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Simulation Control">
          <ControlSlider
            label="Speed"
            value={speed}
            min={0.1}
            max={3}
            step={0.1}
            onChange={setSpeed}
              />
          <div className="mt-3 space-y-2">
            <label className="text-xs text-gray-400 block mb-2">Stage</label>
            {['Initiation', 'Elongation', 'Termination'].map((s, i) => (
              <button
                key={s}
                onClick={() => setStage(i)}
                className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                  stage === i
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup title="Enzymes">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showHelicase}
                onChange={(e) => setShowHelicase(e.target.checked)}
                className="w-4 h-4 accent-[#3b82f6]"
              />
              <span className="text-gray-300">Helicase</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPolymerase}
                onChange={(e) => setShowPolymerase(e.target.checked)}
                className="w-4 h-4 accent-[#3b82f6]"
              />
              <span className="text-gray-300">Polymerase</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPrimase}
                onChange={(e) => setShowPrimase(e.target.checked)}
                className="w-4 h-4 accent-[#3b82f6]"
              />
              <span className="text-gray-300">Primase</span>
            </label>
          </div>
        </ControlGroup>

        <button
          onClick={() => router.push('/experiments/dna-replication/details')}
          className="w-full mt-4 px-4 py-2 bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#3b82f6] rounded-lg border border-[#3b82f6]/50 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </>
    ),
    [speed, stage, showHelicase, showPolymerase, showPrimase, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          stage: { value: 0, unit: dnaData.stage, color: "#3b82f6", decimals: 0 },
          unwound: { value: dnaData.unwoundPercent, unit: "%", color: "#06b6d4", decimals: 0 },
          nucleotides: { value: dnaData.nucleotidesAdded, unit: "added", color: "#8b5cf6", decimals: 0 },
          status: { value: isPlaying ? 1 : 0, unit: isPlaying ? "Active" : "Paused", color: "#22c55e", decimals: 0 },
        }}
        columns={2}
      />
    ),
    [dnaData, isPlaying]
  );

  const dataPanel = useMemo(
    () => (
      <DataPanel isVisible={showData} onToggle={() => setShowData((d) => !d)}>
        {dataContent}
      </DataPanel>
    ),
    [showData, dataContent]
  );

  return (
    <div className="w-full h-screen relative">
      <ExperimentContainer
        title="DNA Replication"
        description="Watch DNA unzip and replicate with enzymes"
        cameraPosition={[0, 0, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <DNAReplicationSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          speed={speed}
          showHelicase={showHelicase}
          showPolymerase={showPolymerase}
          showPrimase={showPrimase}
          stage={stage}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={handleSpeedChange}
        timeElapsed={0}
      />

      {showControls && (
        <FloatingControlPanel
            initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 340 : 1260, y: 80 }}
        >
          {parameterControls}
        </FloatingControlPanel>
      )}

      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#3b82f6] rounded-lg border border-[#3b82f6]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
