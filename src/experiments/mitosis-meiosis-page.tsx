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
import MitosisMeiosisSceneComponent, { MitosisMeiosisData } from './mitosis-meiosis-scene';

export default function MitosisMeiosisPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [speed, setSpeed] = useState(1);
  const [stage, setStage] = useState(0);
  const [mode, setMode] = useState<'mitosis' | 'meiosis'>('mitosis');

  const [divisionData, setDivisionData] = useState<MitosisMeiosisData>({
    phase: 'Prophase',
    chromosomesCount: 46,
    daughterCells: 1,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setSpeed(1);
    setStage(0);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: MitosisMeiosisData) => {
    setDivisionData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Mode">
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('mitosis'); setStage(0); }}
              className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                mode === 'mitosis'
                  ? 'bg-[#f59e0b] text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Mitosis
            </button>
            <button
              onClick={() => { setMode('meiosis'); setStage(0); }}
              className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                mode === 'meiosis'
                  ? 'bg-[#ec4899] text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Meiosis
            </button>
          </div>
        </ControlGroup>

        <ControlGroup title="Speed">
          <ControlSlider
            label="Animation Speed"
            value={speed}
            min={0.1}
            max={3}
            step={0.1}
            onChange={setSpeed}
            color={mode === 'mitosis' ? '#f59e0b' : '#ec4899'}
          />
        </ControlGroup>

        <ControlGroup title="Stage">
          {(mode === 'mitosis'
            ? ['Prophase', 'Metaphase', 'Anaphase', 'Telophase']
            : ['Meiosis I', 'Meiosis II']
          ).map((s, i) => (
            <button
              key={s}
              onClick={() => setStage(i)}
              className={`w-full px-3 py-2 rounded text-sm transition-colors mb-2 ${
                stage === i
                  ? mode === 'mitosis' ? 'bg-[#f59e0b] text-white' : 'bg-[#ec4899] text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </ControlGroup>

        <button
          onClick={() => router.push('/experiments/mitosis-meiosis/details')}
          className={`w-full mt-4 px-4 py-2 ${mode === 'mitosis' ? 'bg-[#f59e0b]/20 hover:bg-[#f59e0b]/30 text-[#f59e0b]' : 'bg-[#ec4899]/20 hover:bg-[#ec4899]/30 text-[#ec4899]'} rounded-lg border transition-colors text-sm font-medium`}
          style={{ borderColor: mode === 'mitosis' ? '#f59e0b' : '#ec4899' }}
        >
          View Details
        </button>
      </>
    ),
    [mode, speed, stage, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          phase: { value: 0, unit: divisionData.phase, color: mode === 'mitosis' ? "#f59e0b" : "#ec4899", decimals: 0 },
          chromosomes: { value: divisionData.chromosomesCount, unit: "chromosomes", color: mode === 'mitosis' ? "#fbbf24" : "#f472b6", decimals: 0 },
          daughterCells: { value: divisionData.daughterCells, unit: "cells", color: mode === 'mitosis' ? "#fcd34d" : "#fb7185", decimals: 0 },
          mode: { value: 0, unit: mode === 'mitosis' ? 'Mitosis' : 'Meiosis', color: mode === 'mitosis' ? "#f59e0b" : "#ec4899", decimals: 0 },
        }}
        columns={2}
      />
    ),
    [divisionData, mode]
  );

  const dataPanel = useMemo(
    () => (
      <DataPanel isVisible={showData} onToggle={() => setShowData((d) => !d)}>
        {dataContent}
      </DataPanel>
    ),
    [showData, dataContent]
  );

  const color = mode === 'mitosis' ? '#f59e0b' : '#ec4899';

  return (
    <div className="w-full h-screen relative">
      <ExperimentContainer
        title="Mitosis & Meiosis"
        description={mode === 'mitosis' ? 'Explore mitosis - somatic cell division' : 'Explore meiosis - gamete formation'}
        cameraPosition={[0, 0, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <MitosisMeiosisSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          speed={speed}
          stage={stage}
          mode={mode}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 rounded-lg border transition-colors text-sm font-medium"
          style={{
            backgroundColor: `${color}20`,
            color: color,
            borderColor: `${color}50`
          }}
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
