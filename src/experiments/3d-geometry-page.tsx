"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Geometry3DSceneComponent, Geometry3DData } from "@/experiments/3d-geometry-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

const SHAPES = ["tetrahedron", "cube", "octahedron", "dodecahedron", "icosahedron"] as const;

export default function Geometry3DPage() {
  const router = useRouter();
  const [data, setData] = useState<Geometry3DData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [shapeType, setShapeType] = useState<typeof SHAPES[number]>("cube");
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [wireframe, setWireframe] = useState(false);
  const [showVertices, setShowVertices] = useState(true);
  const [showEdges, setShowEdges] = useState(true);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setRotationSpeed(0.5);
    setShapeType("cube");
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Shape Selection">
        <div className="grid grid-cols-2 gap-2">
          {SHAPES.map((shape) => (
            <button
              key={shape}
              onClick={() => setShapeType(shape)}
              className={`py-2 px-3 text-sm rounded-lg transition-all capitalize ${
                shapeType === shape
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup title="Display Settings">
        <ControlSlider
          label="Rotation Speed"
          value={rotationSpeed}
          unit=""
          min={0}
          max={2}
          step={0.1}
          color="#3b82f6"
          onChange={setRotationSpeed}
          decimals={1}
        />
        <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
          <span>Wireframe</span>
          <input
            type="checkbox"
            checked={wireframe}
            onChange={(e) => setWireframe(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-500"
          />
        </label>
        <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
          <span>Show Vertices</span>
          <input
            type="checkbox"
            checked={showVertices}
            onChange={(e) => setShowVertices(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-500"
          />
        </label>
        <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
          <span>Show Edges</span>
          <input
            type="checkbox"
            checked={showEdges}
            onChange={(e) => setShowEdges(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-500"
          />
        </label>
      </ControlGroup>

      <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/50">
        <div className="text-xs text-gray-600 mb-2 font-medium">Euler's Formula</div>
        <div className="text-xs text-gray-500 font-mono">
          V - E + F = 2
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Vertices - Edges + Faces = χ
        </div>
      </div>

      <button
        onClick={() => router.push("/experiments/3d-geometry/details")}
        className="w-full py-2.5 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 font-medium text-sm rounded-lg transition-all border border-blue-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          vertices: { value: data.vertices, unit: "V", color: "#ef4444", decimals: 0 },
          edges: { value: data.edges, unit: "E", color: "#22c55e", decimals: 0 },
          faces: { value: data.faces, unit: "F", color: "#3b82f6", decimals: 0 },
          euler: { value: data.eulerCharacteristic, unit: "χ", color: "#f59e0b", decimals: 0 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-blue-400 text-sm">
          {data.vertices} - {data.edges} + {data.faces} = {data.eulerCharacteristic}
        </div>
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
        title="3D Geometry"
        description="Explore Platonic solids and Euler's formula"
        cameraPosition={[8, 6, 8]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <Geometry3DSceneComponent
          onDataChange={setData}
          shapeType={shapeType}
          rotationSpeed={rotationSpeed}
          wireframe={wireframe}
          showVertices={showVertices}
          showEdges={showEdges}
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
        title="⚙️ Shape Settings"
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
