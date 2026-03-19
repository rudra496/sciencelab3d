"use client";

import { experiments } from "@/data/experiments";
import { useParams } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic imports for experiment scenes (code splitting)
const sceneImports: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  pendulum: () => import("@/experiments/pendulum"),
  "projectile-motion": () => import("@/experiments/projectile-motion"),
  "wave-interference": () => import("@/experiments/wave-interference"),
  "gas-laws": () => import("@/experiments/gas-laws"),
};

function ExperimentScene({ id }: { id: string }) {
  const SceneComponent = dynamic(sceneImports[id], {
    ssr: false,
    loading: () => (
      <mesh>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
    ),
  });

  return <SceneComponent />;
}

function PlaceholderScene() {
  return (
    <>
      <mesh>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color="#8b5cf6"
          wireframe
          emissive="#8b5cf6"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[2, 2, 0.1, 32]} />
        <meshStandardMaterial color="#1a1a3e" />
      </mesh>
    </>
  );
}

function CanvasScene({ id }: { id: string }) {
  const hasScene = !!sceneImports[id];
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#4f8fff" />
        {hasScene ? <ExperimentScene id={id} /> : <PlaceholderScene />}
        <OrbitControls enableDamping dampingFactor={0.05} />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}

export default function ExperimentPage() {
  const params = useParams();
  const id = params.id as string;
  const exp = experiments.find((e) => e.id === id);

  if (!exp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Experiment Not Found</h1>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const hasScene = !!sceneImports[id];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{exp.icon}</span>
          <h1 className="text-xl font-bold">{exp.title}</h1>
        </div>
        <div className="flex gap-2">
          {exp.topics.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-1 rounded-full hidden md:block"
              style={{ background: `${exp.color}15`, color: exp.color }}
            >
              {t}
            </span>
          ))}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 3D Canvas */}
        <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
          <CanvasScene id={exp.id} />
          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 glass rounded-xl p-3 text-xs text-gray-400">
            <p>🖱️ Left click + drag to rotate</p>
            <p>🖱️ Right click + drag to pan</p>
            <p>🖱️ Scroll to zoom</p>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-96 glass border-l border-white/5 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">
                About This Experiment
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {exp.description}
            </p>
          </div>

          <div className="mb-6">
            <span
              className="text-xs font-mono px-2 py-1 rounded-full"
              style={{ background: `${exp.color}15`, color: exp.color }}
            >
              {exp.difficulty}
            </span>
            <span className="text-xs text-gray-600 ml-2">
              {exp.category.charAt(0).toUpperCase() + exp.category.slice(1)}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Related Topics</h3>
            <div className="flex flex-wrap gap-1.5">
              {exp.topics.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {!hasScene && (
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
              <p className="text-xs text-yellow-400/80">
                🚧 This experiment&apos;s 3D simulation is being built. Check back
                soon for full interactive controls!
              </p>
            </div>
          )}

          {hasScene && (
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
              <p className="text-xs text-green-400/80">
                ✅ Interactive simulation active! Use the controls on the left
                to adjust parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
