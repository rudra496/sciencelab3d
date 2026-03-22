"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtomicStructureSceneComponent, AtomicStructureData } from "@/experiments/atomic-structure-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function AtomicStructurePage() {
  const router = useRouter();
  const [data, setData] = useState<AtomicStructureData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics parameters
  const [atomicNumber, setAtomicNumber] = useState(6); // Start with Carbon
  const [showElectronShells, setShowElectronShells] = useState(true);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setAtomicNumber(6);
  };

  const getElementName = (z: number): string => {
    const elements: Record<number, string> = {
      1: "H", 2: "He", 3: "Li", 4: "Be", 5: "B", 6: "C", 7: "N", 8: "O",
      9: "F", 10: "Ne", 11: "Na", 12: "Mg", 13: "Al", 14: "Si", 15: "P",
      16: "S", 17: "Cl", 18: "Ar", 19: "K", 20: "Ca",
    };
    return elements[z] || `Z${z}`;
  };

  // Quick select elements
  const quickSelectElements = [
    { z: 1, label: "H", name: "Hydrogen" },
    { z: 2, label: "He", name: "Helium" },
    { z: 6, label: "C", name: "Carbon" },
    { z: 8, label: "O", name: "Oxygen" },
    { z: 10, label: "Ne", name: "Neon" },
    { z: 11, label: "Na", name: "Sodium" },
    { z: 18, label: "Ar", name: "Argon" },
    { z: 20, label: "Ca", name: "Calcium" },
  ];

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Atomic Parameters">
        <ControlSlider
          label="Atomic Number (Z)"
          value={atomicNumber}
          unit=""
          min={1}
          max={20}
          step={1}
          color="#ef4444"
          onChange={setAtomicNumber}
          decimals={0}
        />
        <div className="text-center py-2 px-3 bg-gradient-to-r from-red-50 to-purple-50 rounded-lg border border-red-200">
          <div className="text-lg font-bold text-gray-800">{getElementName(atomicNumber)}</div>
          <div className="text-xs text-gray-600">{data?.elementName || "Element"}</div>
        </div>
      </ControlGroup>

      <ControlGroup title="Display Options">
        {[
          { label: "Electron Shells", checked: showElectronShells, onChange: setShowElectronShells },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input
              type="checkbox" checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-red-500"
            />
          </label>
        ))}
      </ControlGroup>

      <ControlGroup title="Quick Select">
        <div className="grid grid-cols-4 gap-2">
          {quickSelectElements.map((el) => (
            <button
              key={el.z}
              onClick={() => setAtomicNumber(el.z)}
              title={el.name}
              className={`py-2 px-1 text-sm rounded transition-all ${
                atomicNumber === el.z
                  ? "bg-gradient-to-br from-red-500 to-purple-500 text-white font-bold shadow-lg"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
              }`}
            >
              {el.label}
            </button>
          ))}
        </div>
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/atomic-structure/details")}
        className="w-full py-2.5 bg-gradient-to-r from-red-100 to-purple-100 hover:from-red-200 hover:to-purple-200 text-red-700 font-medium text-sm rounded-lg transition-all border border-red-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  // === DATA PANEL CONTENT ===
  const dataPanelContent = data ? (
    <>
      <div className="p-3 bg-gradient-to-r from-red-900/30 to-purple-900/30 rounded-lg border border-red-700/30">
        <div className="text-xs text-gray-400 mb-1">Element</div>
        <div className="text-2xl font-bold text-white">{data.elementName}</div>
        <div className="text-lg text-gray-300">{data.symbol} (Z={data.atomicNumber})</div>
      </div>

      <DataGrid
        data={{
          atomicNumber: { value: data.atomicNumber, unit: "Z", color: "#ef4444", decimals: 0 },
          massNumber: { value: data.massNumber, unit: "A", color: "#9ca3af", decimals: 0 },
          electrons: { value: data.atomicNumber, unit: "e⁻", color: "#22d3ee", decimals: 0 },
        }}
        columns={2}
      />

      <div className="mt-3 space-y-2">

        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Electron Configuration</div>
          <div className="font-mono text-cyan-400 text-sm">{data.electronConfig}</div>
        </div>

        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Shell Electrons</div>
          <div className="space-y-1">
            {data.shellElectrons.map((shell) => (
              <div key={shell.shell} className="flex justify-between items-center text-sm">
                <span className="text-gray-400">n={shell.shell}</span>
                <span className="font-mono text-cyan-400">{shell.count} e⁻</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Loading atom data...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Atomic Structure"
        description="Explore the Bohr model of the atom with interactive 3D visualization"
        cameraPosition={[12, 8, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <AtomicStructureSceneComponent
          key={`${atomicNumber}-${resetTrigger}`}
          onDataChange={setData}
          atomicNumber={atomicNumber}
          showElectronShells={showElectronShells}
          animationSpeed={simulationSpeed}
          isPlaying={isPlaying}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
      />

      <FloatingControlPanel
        title="⚛️ Atomic Controls"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
