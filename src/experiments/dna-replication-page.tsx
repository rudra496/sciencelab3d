'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  const [autoPlay, setAutoPlay] = useState(false);

  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [step, setStep] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const [dnaData, setDnaData] = useState<DNAReplicationData>({
    step: 'Intact DNA',
    enzymes: [],
    nucleotidesAdded: 0,
    description: 'Double-stranded DNA molecule rotating intact',
  });

  // Auto-play through steps
  useEffect(() => {
    if (autoPlay && isPlaying) {
      autoPlayRef.current = setTimeout(() => {
        if (step < 4) {
          setStep(step + 1);
        } else {
          setAutoPlay(false);
        }
      }, 5000 / simulationSpeed);
    }
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };
  }, [autoPlay, step, isPlaying, simulationSpeed]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setSpeed(1);
    setShowLabels(true);
    setStep(0);
    setAutoPlay(false);
    setDnaData({
      step: 'Intact DNA',
      enzymes: [],
      nucleotidesAdded: 0,
      description: 'Double-stranded DNA molecule rotating intact',
    });
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
            <label className="text-xs text-gray-400 block mb-2">Replication Step</label>
            {['Intact DNA', 'Helicase Unzips', 'Primase', 'DNA Polymerase', 'Two Daughter DNA'].map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                  step === i
                    ? 'bg-[#3b82f6] text-white font-medium'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`w-full mt-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
              autoPlay
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {autoPlay ? '⏸ Auto Playing' : '▶ Auto Play Steps'}
          </button>
        </ControlGroup>

        <ControlGroup title="Display Options">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-4 h-4 accent-[#3b82f6]"
              />
              <span className="text-gray-300">Show Labels</span>
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
    [speed, step, showLabels, autoPlay, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          step: { value: 0, unit: dnaData.step, color: '#3b82f6', decimals: 0 },
          enzymes: { value: dnaData.enzymes.length, unit: dnaData.enzymes.join(', ') || 'None', color: '#f59e0b', decimals: 0 },
          nucleotides: { value: dnaData.nucleotidesAdded, unit: 'bases', color: '#22c55e', decimals: 0 },
          description: { value: 0, unit: dnaData.description, color: '#8b5cf6', decimals: 0 },
          status: { value: isPlaying ? 1 : 0, unit: isPlaying ? 'Active' : 'Paused', color: '#22c55e', decimals: 0 },
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
        description="Step-by-step visualization of DNA replication with enzymes"
        cameraPosition={[0, 0, 14]}
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
          showLabels={showLabels}
          step={step}
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
