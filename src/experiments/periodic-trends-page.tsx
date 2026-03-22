"use client";

import { useState } from "react";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  ControlDropdown,
  ControlCheckbox,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";
import { PeriodicTrendsScene, PeriodicTrendsData, TrendType, ElementData } from "@/experiments/periodic-trends-scene";

const TRENDS = [
  { label: "Atomic Radius", value: "atomicRadius" as TrendType, emoji: "📏", color: "#3b82f6" },
  { label: "Electronegativity", value: "electronegativity" as TrendType, emoji: "⚡", color: "#a855f7" },
  { label: "Ionization Energy", value: "ionizationEnergy" as TrendType, emoji: "🔥", color: "#f97316" },
  { label: "Electron Affinity", value: "electronAffinity" as TrendType, emoji: "🧲", color: "#14b8a6" },
];

const PERIOD_OPTIONS = [
  { label: "None", value: "null", emoji: "🔲" },
  { label: "Period 1", value: "1", emoji: "1️⃣" },
  { label: "Period 2", value: "2", emoji: "2️⃣" },
  { label: "Period 3", value: "3", emoji: "3️⃣" },
  { label: "Period 4", value: "4", emoji: "4️⃣" },
  { label: "Period 5", value: "5", emoji: "5️⃣" },
  { label: "Period 6", value: "6", emoji: "6️⃣" },
  { label: "Period 7", value: "7", emoji: "7️⃣" },
];

const GROUP_OPTIONS = [
  { label: "None", value: "null", emoji: "🔲" },
  { label: "Alkali Metals", value: "1", emoji: "🔴" },
  { label: "Alkaline Earth", value: "2", emoji: "🟠" },
  { label: "Group 3", value: "3", emoji: "⚪" },
  { label: "Group 4", value: "4", emoji: "⚪" },
  { label: "Group 5", value: "5", emoji: "⚪" },
  { label: "Group 6", value: "6", emoji: "⚪" },
  { label: "Group 7", value: "7", emoji: "⚪" },
  { label: "Group 8", value: "8", emoji: "⚪" },
  { label: "Group 9", value: "9", emoji: "⚪" },
  { label: "Group 10", value: "10", emoji: "⚪" },
  { label: "Group 11", value: "11", emoji: "⚪" },
  { label: "Group 12", value: "12", emoji: "⚪" },
  { label: "Boron Group", value: "13", emoji: "🟢" },
  { label: "Carbon Group", value: "14", emoji: "🟢" },
  { label: "Pnictogens", value: "15", emoji: "🔵" },
  { label: "Chalcogens", value: "16", emoji: "🔵" },
  { label: "Halogens", value: "17", emoji: "🟣" },
  { label: "Noble Gases", value: "18", emoji: "🩷" },
];

export default function PeriodicTrendsPage() {
  const [data, setData] = useState<PeriodicTrendsData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Trend and display controls
  const [trendType, setTrendType] = useState<TrendType>("atomicRadius");
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showCategories, setShowCategories] = useState(true);
  const [highlightPeriod, setHighlightPeriod] = useState<number | null>(null);
  const [highlightGroup, setHighlightGroup] = useState<number | null>(null);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setIsPlaying(true);
    setSimulationSpeed(1);
    setAnimationSpeed(1);
    setTrendType("atomicRadius");
    setShowCategories(true);
    setHighlightPeriod(null);
    setHighlightGroup(null);
  };

  const handleElementClick = (element: ElementData) => {
    console.log("Selected element:", element);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Trend Selection">
        <ControlDropdown
          label="Select Trend"
          value={trendType}
          options={TRENDS}
          onChange={setTrendType}
          color="#3b82f6"
        />
      </ControlGroup>

      <ControlGroup title="Animation">
        <ControlSlider
          label="Animation Speed"
          value={animationSpeed}
          unit="x"
          min={0.1}
          max={3}
          step={0.1}
          color="#8b5cf6"
          onChange={setAnimationSpeed}
          decimals={1}
        />
        <ControlCheckbox
          label="Show Categories"
          checked={showCategories}
          onChange={setShowCategories}
          color="#10b981"
        />
      </ControlGroup>

      <ControlGroup title="Highlight By">
        <ControlDropdown
          label="Period"
          value={highlightPeriod === null ? "null" : String(highlightPeriod)}
          options={PERIOD_OPTIONS}
          onChange={(val) => setHighlightPeriod(val === "null" ? null : parseInt(val))}
          color="#f59e0b"
        />
        <ControlDropdown
          label="Group"
          value={highlightGroup === null ? "null" : String(highlightGroup)}
          options={GROUP_OPTIONS}
          onChange={(val) => setHighlightGroup(val === "null" ? null : parseInt(val))}
          color="#ef4444"
        />
      </ControlGroup>

      <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="text-xs font-semibold text-gray-700 mb-1">ℹ️ Tip</div>
        <div className="text-xs text-gray-600">
          Click on elements to select them. Use the controls to explore different periodic trends.
        </div>
      </div>
    </div>
  );

  const dataPanelContent = data && data.selectedElement ? (
    <>
      {/* Selected Element Info */}
      <div className="mb-4 p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
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
          trendValue: {
            value: data.trendValue,
            unit: data.trendName === "Atomic Radius" ? "pm" : data.trendName === "Electronegativity" ? "" : data.trendName === "Ionization Energy" || data.trendName === "Electron Affinity" ? "kJ/mol" : "",
            color: "#22d3ee",
            decimals: data.trendName === "Electronegativity" ? 2 : 1
          },
        }}
        columns={2}
      />

      {/* Trend Range */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">{data.trendName} Range</div>
        <div className="flex justify-between text-sm">
          <span className="text-green-400">Min: {data.minValue}</span>
          <span className="text-red-400">Max: {data.maxValue}</span>
        </div>
        <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
            style={{ width: "100%" }}
          />
        </div>
        <div
          className="mt-1 h-2 bg-white rounded-full relative"
          style={{ marginLeft: `${((data.trendValue - data.minValue) / (data.maxValue - data.minValue)) * 100}%`, width: "2px" }}
        />
      </div>

      {/* Electron Configuration */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Electron Config</div>
        <div className="text-xs text-cyan-400 font-mono break-all">{data.selectedElement.electronConfig}</div>
      </div>

      {/* Trend Description */}
      {data.trendDescription && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">About {data.trendName}</div>
          <div className="text-xs text-gray-300 leading-relaxed">{data.trendDescription}</div>
        </div>
      )}
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      <div className="text-4xl mb-2">⏳</div>
      <div>Hover over elements to see data</div>
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Periodic Table Trends"
        description="Interactive 3D periodic table with visualized trends"
        cameraPosition={[20, 18, 25]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <PeriodicTrendsScene
          trendType={trendType}
          animationSpeed={animationSpeed}
          isPlaying={isPlaying}
          showCategories={showCategories}
          highlightPeriod={highlightPeriod}
          highlightGroup={highlightGroup}
          onDataChange={setData}
          onElementClick={handleElementClick}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        initialPosition={{ x: 20, y: window.innerHeight - 80 }}
      />

      <FloatingControlPanel
        title="⚗️ Periodic Table Controls"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
        initialPosition={{ x: window.innerWidth - 340, y: 80 }}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
