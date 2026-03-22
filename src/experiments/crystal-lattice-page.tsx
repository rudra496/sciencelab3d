"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CrystalLatticeSceneComponent, CrystalLatticeData } from "@/experiments/crystal-lattice-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function CrystalLatticePage() {
  const router = useRouter();
  const [data, setData] = useState<CrystalLatticeData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [latticeType, setLatticeType] = useState<"FCC" | "BCC" | "HCP" | "diamond">("FCC");
  const [showUnitCell, setShowUnitCell] = useState(true);
  const [showBonds, setShowBonds] = useState(true);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };

  const latticeInfo: Record<"FCC" | "BCC" | "HCP" | "diamond", { name: string; examples: string }> = {
    FCC: { name: "Face-Centered Cubic", examples: "Al, Cu, Au, Ag" },
    BCC: { name: "Body-Centered Cubic", examples: "Fe, Cr, W, Na" },
    HCP: { name: "Hexagonal Close-Packed", examples: "Mg, Zn, Ti, Co" },
    diamond: { name: "Diamond Cubic", examples: "C (diamond), Si, Ge" },
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Crystal Structure">
        <div className="grid grid-cols-2 gap-2">
          {(["FCC", "BCC", "HCP", "diamond"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setLatticeType(type)}
              className={`py-2 px-2 text-xs rounded-lg font-medium transition-all ${
                latticeType === type
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="mt-2 p-2 bg-purple-50/50 rounded-lg border border-purple-200/50">
          <div className="text-xs font-medium text-purple-700">{latticeInfo[latticeType].name}</div>
          <div className="text-xs text-purple-600 mt-1">{latticeInfo[latticeType].examples}</div>
        </div>
      </ControlGroup>

      <ControlGroup title="Display Options">
        {[
          { label: "Unit Cell Wireframe", checked: showUnitCell, onChange: setShowUnitCell },
          { label: "Atomic Bonds", checked: showBonds, onChange: setShowBonds },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input
              type="checkbox" checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
          </label>
        ))}
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/crystal-lattice/details")}
        className="w-full py-2.5 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 font-medium text-sm rounded-lg transition-all border border-purple-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          totalAtoms: { value: data.totalAtoms, unit: "atoms", color: "#a855f7", decimals: 0 },
          atomsPerCell: { value: data.atomsPerCell, unit: "atoms/cell", color: "#ec4899", decimals: 0 },
          coordinationNumber: { value: data.coordinationNumber, unit: "", color: "#8b5cf6", decimals: 0 },
          packingEfficiency: { value: data.packingEfficiency * 100, unit: "%", color: "#22c55e", decimals: 0 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Structure Type</div>
        <div className="text-purple-400 text-sm font-medium">{latticeInfo[data.latticeType].name}</div>
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
        title="Crystal Lattice"
        description="Explore the atomic arrangement in crystalline solids"
        cameraPosition={[10, 8, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <CrystalLatticeSceneComponent
          onDataChange={setData}
          latticeType={latticeType}
          showUnitCell={showUnitCell}
          showBonds={showBonds}
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
        title="⚙️ Lattice Parameters"
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
