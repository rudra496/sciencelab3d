'use client';

import { useState, useEffect } from 'react';
import {
  ExperimentContainer,
  DataGrid,
  DataPanel,
} from '@/components/experiment-ui';
import { PeriodicTrendsScene, ElementData } from '@/experiments/periodic-trends-scene';

const CATEGORY_COLORS: Record<string, string> = {
  "alkali-metal": "#ff6b6b",
  "alkaline-earth": "#ffa94d",
  "transition-metal": "#ffd43b",
  "post-transition": "#69db7c",
  "metalloid": "#4ecdc4",
  "nonmetal": "#4dabf7",
  "halogen": "#b197fc",
  "noble-gas": "#f783ac",
  "lanthanide": "#a5d8ff",
  "actinide": "#fcc2d7",
};

interface SceneData {
  selectedElement: ElementData | null;
  hoveredElement: ElementData | null;
}

export default function PeriodicTrendsPage() {
  const [data, setData] = useState<SceneData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fix hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleElementClick = (element: ElementData) => {
    console.log("Selected element:", element);
  };

  const dataPanelContent = data && data.selectedElement ? (
    <>
      {/* Selected Element Info */}
      <div className="mb-4 p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-lg"
            style={{
              backgroundColor: CATEGORY_COLORS[data.selectedElement.category] || "#06b6d4",
            }}
          >
            {data.selectedElement.symbol}
          </div>
          <div>
            <div className="text-sm font-bold text-cyan-300">{data.selectedElement.name}</div>
            <div className="text-xs text-cyan-400/70 capitalize">{data.selectedElement.category.replace(/-/g, " ")}</div>
          </div>
        </div>
      </div>

      {/* Element Properties */}
      <DataGrid
        data={{
          atomicNumber: { value: data.selectedElement.number, unit: "Z", color: "#06b6d4", decimals: 0 },
          atomicMass: { value: data.selectedElement.mass, unit: "amu", color: "#0891b2", decimals: 2 },
          group: { value: data.selectedElement.group, unit: "Group", color: "#0e7490", decimals: 0 },
          period: { value: data.selectedElement.period, unit: "Period", color: "#164e63", decimals: 0 },
          atomicRadius: { value: data.selectedElement.atomicRadius, unit: "pm", color: "#22d3ee", decimals: 0 },
          electronegativity: {
            value: data.selectedElement.electronegativity ?? 0,
            unit: "",
            color: "#a855f7",
            decimals: data.selectedElement.electronegativity ? 2 : 0,
          },
          ionizationEnergy: { value: data.selectedElement.ionizationEnergy, unit: "kJ/mol", color: "#f97316", decimals: 0 },
        }}
        columns={2}
      />

      {/* Electron Configuration */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Electron Config</div>
        <div className="text-xs text-cyan-400 font-mono break-all">{data.selectedElement.electronConfig}</div>
      </div>
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      <div className="text-4xl mb-2">⏳</div>
      <div>Click on elements to see data</div>
    </div>
  );

  if (!mounted) return null;

  return (
    <>
      <ExperimentContainer
        title="Periodic Table"
        description="Interactive 3D periodic table with all 118 elements"
        cameraPosition={[0, 0, 25]}
        backgroundColor="#050510"
        enableFog={false}
        controls={null}
        dataPanel={null}
      >
        <PeriodicTrendsScene
          onDataChange={setData}
          onElementClick={handleElementClick}
        />
      </ExperimentContainer>

      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
