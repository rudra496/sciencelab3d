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
import ProteinSynthesisSceneComponent, { ProteinSynthesisData } from './protein-synthesis-scene';

export default function ProteinSynthesisPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [speed, setSpeed] = useState(1);
  const [stage, setStage] = useState(0);
  const [showCodons, setShowCodons] = useState(true);

  const [proteinData, setProteinData] = useState<ProteinSynthesisData>({
    stage: 'Transcription',
    codonsProcessed: 0,
    aminoAcidsFormed: 0,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setSpeed(1);
    setStage(0);
    setShowCodons(true);
    setProteinData({ stage: 'Transcription', codonsProcessed: 0, aminoAcidsFormed: 0 });
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: ProteinSynthesisData) => {
    setProteinData(data);
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
            <label className="text-xs text-gray-400 block mb-2">Protein Synthesis Stage</label>
            {['Transcription', 'Translation', 'Complete'].map((s, i) => (
              <button
                key={s}
                onClick={() => setStage(i)}
                className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                  stage === i
                    ? 'bg-[#8b5cf6] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup title="Display Options">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showCodons}
                onChange={(e) => setShowCodons(e.target.checked)}
                className="w-4 h-4 accent-[#8b5cf6]"
              />
              <span className="text-gray-300">Show Codons</span>
            </label>
          </div>
        </ControlGroup>

        <button
          onClick={() => router.push('/experiments/protein-synthesis/details')}
          className="w-full mt-4 px-4 py-2 bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#8b5cf6] rounded-lg border border-[#8b5cf6]/50 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </>
    ),
    [speed, stage, showCodons, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          stage: { value: 0, unit: proteinData.stage, color: '#8b5cf6', decimals: 0 },
          codons: { value: proteinData.codonsProcessed, unit: 'codons', color: '#a78bfa', decimals: 0 },
          aminoAcids: { value: proteinData.aminoAcidsFormed, unit: 'AA', color: '#c4b5fd', decimals: 0 },
          status: { value: isPlaying ? 1 : 0, unit: isPlaying ? 'Active' : 'Paused', color: '#22c55e', decimals: 0 },
        }}
        columns={2}
      />
    ),
    [proteinData, isPlaying]
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
        title="Protein Synthesis"
        description="Visualize transcription and translation in 3D"
        cameraPosition={[0, 0, 14]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <ProteinSynthesisSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          speed={speed}
          stage={stage}
          showCodons={showCodons}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#8b5cf6] rounded-lg border border-[#8b5cf6]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
