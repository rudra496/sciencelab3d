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
import PhotosynthesisSceneComponent, { PhotosynthesisData } from './photosynthesis-scene';

export default function PhotosynthesisPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [lightIntensity, setLightIntensity] = useState(1);
  const [co2Level, setCo2Level] = useState(1);
  const [waterLevel, setWaterLevel] = useState(1);

  const [photosynthesisData, setPhotosynthesisData] = useState<PhotosynthesisData>({
    lightReactionRate: 1,
    calvinCycleRate: 0.8,
    glucoseProduced: 0,
    oxygenReleased: 0,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setLightIntensity(1);
    setCo2Level(1);
    setWaterLevel(1);
    setPhotosynthesisData({
      lightReactionRate: 1,
      calvinCycleRate: 0.8,
      glucoseProduced: 0,
      oxygenReleased: 0,
    });
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setSimulationSpeed(speed);
  }, []);

  const handleDataChange = useCallback((data: PhotosynthesisData) => {
    setPhotosynthesisData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Environmental Factors">
          <ControlSlider
            label="Light Intensity"
            value={lightIntensity}
            min={0}
            max={2}
            step={0.1}
            onChange={setLightIntensity}
              />
          <ControlSlider
            label="CO₂ Level"
            value={co2Level}
            min={0}
            max={2}
            step={0.1}
            onChange={setCo2Level}
              />
          <ControlSlider
            label="Water Level"
            value={waterLevel}
            min={0}
            max={2}
            step={0.1}
            onChange={setWaterLevel}
              />
        </ControlGroup>

        <button
          onClick={() => router.push('/experiments/photosynthesis/details')}
          className="w-full mt-4 px-4 py-2 bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#22c55e] rounded-lg border border-[#22c55e]/50 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </>
    ),
    [lightIntensity, co2Level, waterLevel, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          lightReaction: { value: photosynthesisData.lightReactionRate * 100, unit: '%', color: '#fbbf24', decimals: 0 },
          calvinCycle: { value: photosynthesisData.calvinCycleRate * 100, unit: '%', color: '#22c55e', decimals: 0 },
          glucose: { value: photosynthesisData.glucoseProduced, unit: 'units', color: '#a855f7', decimals: 0 },
          oxygen: { value: photosynthesisData.oxygenReleased, unit: 'units', color: '#ef4444', decimals: 0 },
        }}
        columns={2}
      />
    ),
    [photosynthesisData]
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
        title="Photosynthesis"
        description="Explore light reactions and Calvin cycle in chloroplasts"
        cameraPosition={[0, 2, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <PhotosynthesisSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          lightIntensity={lightIntensity}
          co2Level={co2Level}
          waterLevel={waterLevel}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#22c55e] rounded-lg border border-[#22c55e]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
