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
import CellStructureSceneComponent, { CellStructureData } from './cell-structure-scene';

export default function CellStructurePage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [showLabels, setShowLabels] = useState(true);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [showNucleus, setShowNucleus] = useState(true);
  const [showMitochondria, setShowMitochondria] = useState(true);
  const [showER, setShowER] = useState(true);
  const [showGolgi, setShowGolgi] = useState(true);
  const [showRibosomes, setShowRibosomes] = useState(true);
  const [showLysosomes, setShowLysosomes] = useState(true);
  const [showMembrane, setShowMembrane] = useState(true);

  const [cellData, setCellData] = useState<CellStructureData>({
    selectedOrganelle: 'None',
    organelleCount: 7,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setShowLabels(true);
    setRotationEnabled(true);
    setShowNucleus(true);
    setShowMitochondria(true);
    setShowER(true);
    setShowGolgi(true);
    setShowRibosomes(true);
    setShowLysosomes(true);
    setShowMembrane(true);
    setCellData({ selectedOrganelle: 'None', organelleCount: 7 });
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setSimulationSpeed(speed);
  }, []);

  const handleDataChange = useCallback((data: CellStructureData) => {
    setCellData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Display Options">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-4 h-4 accent-[#06d6a0]"
              />
              <span className="text-gray-300">Show Labels</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rotationEnabled}
                onChange={(e) => setRotationEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#06d6a0]"
              />
              <span className="text-gray-300">Auto Rotation</span>
            </label>
          </div>
        </ControlGroup>

        <ControlGroup title="Organelles">
          <div className="space-y-2">
            {[
              { key: 'nucleus', label: 'Nucleus', state: showNucleus, setter: setShowNucleus },
              { key: 'mitochondria', label: 'Mitochondria', state: showMitochondria, setter: setShowMitochondria },
              { key: 'er', label: 'Endoplasmic Reticulum', state: showER, setter: setShowER },
              { key: 'golgi', label: 'Golgi Apparatus', state: showGolgi, setter: setShowGolgi },
              { key: 'ribosomes', label: 'Ribosomes', state: showRibosomes, setter: setShowRibosomes },
              { key: 'lysosomes', label: 'Lysosomes', state: showLysosomes, setter: setShowLysosomes },
              { key: 'membrane', label: 'Cell Membrane', state: showMembrane, setter: setShowMembrane },
            ].map((org) => (
              <label key={org.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={org.state}
                  onChange={(e) => org.setter(e.target.checked)}
                  className="w-4 h-4 accent-[#06d6a0]"
                />
                <span className="text-gray-300">{org.label}</span>
              </label>
            ))}
          </div>
        </ControlGroup>

        <button
          onClick={() => router.push('/experiments/cell-structure/details')}
          className="w-full mt-4 px-4 py-2 bg-[#06d6a0]/20 hover:bg-[#06d6a0]/30 text-[#06d6a0] rounded-lg border border-[#06d6a0]/50 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </>
    ),
    [
      showLabels,
      rotationEnabled,
      showNucleus,
      showMitochondria,
      showER,
      showGolgi,
      showRibosomes,
      showLysosomes,
      showMembrane,
      router,
    ]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          organelles: { value: cellData.organelleCount, unit: 'total', color: '#06d6a0', decimals: 0 },
          selected: { value: 1, unit: cellData.selectedOrganelle, color: '#3b82f6', decimals: 0 },
          status: { value: isPlaying ? 1 : 0, unit: isPlaying ? 'Active' : 'Paused', color: '#22c55e', decimals: 0 },
        }}
        columns={2}
      />
    ),
    [cellData, isPlaying]
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
        title="Animal Cell Structure"
        description="Explore the organelles of an animal cell in 3D - Click to highlight"
        cameraPosition={[0, 2, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <CellStructureSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          showLabels={showLabels}
          rotationEnabled={rotationEnabled}
          showNucleus={showNucleus}
          showMitochondria={showMitochondria}
          showER={showER}
          showGolgi={showGolgi}
          showRibosomes={showRibosomes}
          showLysosomes={showLysosomes}
          showMembrane={showMembrane}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#06d6a0]/20 hover:bg-[#06d6a0]/30 text-[#06d6a0] rounded-lg border border-[#06d6a0]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
