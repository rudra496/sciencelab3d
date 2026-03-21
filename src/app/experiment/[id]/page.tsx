"use client";

import { experiments } from "@/data/experiments";
import { useParams, useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Star, Maximize2, X, Moon, Sun } from "lucide-react";
import dynamic from "next/dynamic";
import { experimentDetails } from "@/data/experiment-details";

// Lazy load all experiment scenes
const PendulumScene = dynamic(() => import("@/experiments/pendulum"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const ProjectileMotionScene = dynamic(() => import("@/experiments/projectile-motion"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const WaveInterferenceScene = dynamic(() => import("@/experiments/wave-interference"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const GasLawsScene = dynamic(() => import("@/experiments/gas-laws"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const DoubleSlitScene = dynamic(() => import("@/experiments/double-slit"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const ElectromagneticFieldScene = dynamic(() => import("@/experiments/electromagnetic-field"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const SpringMassScene = dynamic(() => import("@/experiments/spring-mass"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const GravitationalOrbitsScene = dynamic(() => import("@/experiments/gravitational-orbits"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const DopplerEffectScene = dynamic(() => import("@/experiments/doppler-effect"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const RefractionReflectionScene = dynamic(() => import("@/experiments/refraction-reflection"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const OhmsLawScene = dynamic(() => import("@/experiments/ohms-law"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const AtomicStructureScene = dynamic(() => import("@/experiments/atomic-structure"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const ChemicalBondingScene = dynamic(() => import("@/experiments/chemical-bonding"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const ElectrolysisScene = dynamic(() => import("@/experiments/electrolysis"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const TitrationScene = dynamic(() => import("@/experiments/titration"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const AcidBaseReactionsScene = dynamic(() => import("@/experiments/acid-base-reactions"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const CrystalLatticeScene = dynamic(() => import("@/experiments/crystal-lattice"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const DiffusionScene = dynamic(() => import("@/experiments/diffusion"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const ThermochemistryScene = dynamic(() => import("@/experiments/thermochemistry"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const PeriodicTrendsScene = dynamic(() => import("@/experiments/periodic-trends"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const CellStructureScene = dynamic(() => import("@/experiments/cell-structure"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const DNAReplicationScene = dynamic(() => import("@/experiments/dna-replication"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const ProteinSynthesisScene = dynamic(() => import("@/experiments/protein-synthesis"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const PhotosynthesisScene = dynamic(() => import("@/experiments/photosynthesis"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const CellularRespirationScene = dynamic(() => import("@/experiments/cellular-respiration"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const MitosisMeiosisScene = dynamic(() => import("@/experiments/mitosis-meiosis"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const NaturalSelectionScene = dynamic(() => import("@/experiments/natural-selection"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const NervousSystemScene = dynamic(() => import("@/experiments/nervous-system"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const EcosystemScene = dynamic(() => import("@/experiments/ecosystem"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const ImmuneResponseScene = dynamic(() => import("@/experiments/immune-response"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const FourierTransformScene = dynamic(() => import("@/experiments/fourier-transform"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const FibonacciSpiralScene = dynamic(() => import("@/experiments/fibonacci-spiral"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const Geometry3DScene = dynamic(() => import("@/experiments/3d-geometry"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const CalculusVisualizerScene = dynamic(() => import("@/experiments/calculus-visualizer"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const MandelbrotScene = dynamic(() => import("@/experiments/mandelbrot"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const ProbabilityDistributionsScene = dynamic(() => import("@/experiments/probability-distributions"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const LinearAlgebraScene = dynamic(() => import("@/experiments/linear-algebra"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const TrigonometryScene = dynamic(() => import("@/experiments/trigonometry"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const ComplexNumbersScene = dynamic(() => import("@/experiments/complex-numbers"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
const TopologySurfacesScene = dynamic(() => import("@/experiments/topology-surfaces"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const sceneMap: Record<string, React.ComponentType> = {
  // Physics
  pendulum: PendulumScene,
  "projectile-motion": ProjectileMotionScene,
  "wave-interference": WaveInterferenceScene,
  "gas-laws": GasLawsScene,
  "double-slit": DoubleSlitScene,
  "electromagnetic-field": ElectromagneticFieldScene,
  "spring-mass": SpringMassScene,
  "gravitational-orbits": GravitationalOrbitsScene,
  "doppler-effect": DopplerEffectScene,
  "refraction-reflection": RefractionReflectionScene,
  "ohms-law": OhmsLawScene,

  // Chemistry
  "atomic-structure": AtomicStructureScene,
  "chemical-bonding": ChemicalBondingScene,
  "electrolysis": ElectrolysisScene,
  "titration": TitrationScene,
  "acid-base-reactions": AcidBaseReactionsScene,
  "crystal-lattice": CrystalLatticeScene,
  "diffusion": DiffusionScene,
  "thermochemistry": ThermochemistryScene,
  "periodic-trends": PeriodicTrendsScene,

  // Biology
  "cell-structure": CellStructureScene,
  "dna-replication": DNAReplicationScene,
  "protein-synthesis": ProteinSynthesisScene,
  "photosynthesis": PhotosynthesisScene,
  "cellular-respiration": CellularRespirationScene,
  "mitosis-meiosis": MitosisMeiosisScene,
  "natural-selection": NaturalSelectionScene,
  "nervous-system": NervousSystemScene,
  "ecosystem": EcosystemScene,
  "immune-response": ImmuneResponseScene,

  // Math
  "fourier-transform": FourierTransformScene,
  "fibonacci-spiral": FibonacciSpiralScene,
  "3d-geometry": Geometry3DScene,
  "calculus-visualizer": CalculusVisualizerScene,
  "mandelbrot": MandelbrotScene,
  "probability-distributions": ProbabilityDistributionsScene,
  "linear-algebra": LinearAlgebraScene,
  "trigonometry": TrigonometryScene,
  "complex-numbers": ComplexNumbersScene,
  "topology-surfaces": TopologySurfacesScene,
};

function LoadingSpinner() {
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

// Favorites utilities
function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  } catch {
    return [];
  }
}

function toggleFavorite(id: string): void {
  const favorites = getFavorites();
  if (favorites.includes(id)) {
    localStorage.setItem("favorites", JSON.stringify(favorites.filter((f) => f !== id)));
  } else {
    localStorage.setItem("favorites", JSON.stringify([...favorites, id]));
  }
}

function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export default function ExperimentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const exp = experiments.find((e) => e.id === id);
  const [isFav, setIsFav] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsFav(isFavorite(id));
      const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("light", savedTheme === "light");
      }
    }
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/");
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleToggleFavorite = () => {
    toggleFavorite(id);
    setIsFav((f) => !f);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

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

  const SceneComponent = sceneMap[id] || PlaceholderScene;
  const hasScene = !!sceneMap[id];
  const details = experimentDetails[id] || null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl">{exp.icon}</span>
          <h1 className="text-base sm:text-xl font-bold">{exp.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg transition-all ${
              isFav ? "text-yellow-400 bg-yellow-400/10" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={18} fill={isFav ? "currentColor" : "none"} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* 3D Canvas */}
        <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
          <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <pointLight position={[-5, 3, -5]} intensity={0.5} color="#4f8fff" />
              <SceneComponent />
              <OrbitControls enableDamping dampingFactor={0.05} />
              <Environment preset="night" />
            </Suspense>
          </Canvas>

          {/* Mobile info toggle */}
          <button
            onClick={() => setIsInfoOpen((io) => !io)}
            className="lg:hidden absolute bottom-20 right-4 p-3 glass rounded-full shadow-lg"
          >
            {isInfoOpen ? <X size={20} /> : <Info size={20} />}
          </button>

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 glass rounded-xl p-3 text-xs text-gray-400 pointer-events-none">
            <p>⌨️ ESC: Back to home</p>
            <p>␣ Space: {isPaused ? "Resume" : "Pause"}</p>
            <p className="hidden sm:block">🖱️ Left click + drag to rotate</p>
            <p className="hidden sm:block">🖱️ Right click + drag to pan</p>
            <p className="hidden sm:block">🖱️ Scroll to zoom</p>
          </div>

          {/* Pause indicator */}
          {isPaused && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 glass rounded-full">
              <span className="text-sm font-medium">⏸️ Paused</span>
            </div>
          )}
        </div>

        {/* Info Panel - Responsive */}
        <div
          className={`w-full lg:w-96 glass border-l border-white/5 overflow-y-auto transition-all duration-300 ${
            isInfoOpen
              ? "max-h-[50vh] lg:max-h-screen"
              : "max-h-0 lg:max-h-screen lg:w-0 lg:border-none"
          }`}
        >
          <div className="p-4 sm:p-6">
            {/* Mobile close button */}
            <button
              onClick={() => setIsInfoOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>

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

            <div className="mb-6 flex gap-2 flex-wrap">
              <span
                className="text-xs font-mono px-2 py-1 rounded-full"
                style={{ background: `${exp.color}15`, color: exp.color }}
              >
                {exp.difficulty}
              </span>
              <span className="text-xs text-gray-600">
                {exp.category.charAt(0).toUpperCase() + exp.category.slice(1)}
              </span>
            </div>

            {/* Educational Content */}
            {details && (
              <>
                {details.formulas && details.formulas.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      📐 Key Formulas
                    </h3>
                    <div className="space-y-2">
                      {details.formulas.map((formula, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-white/5 border border-white/10"
                        >
                          <p className="text-xs font-mono text-blue-300 mb-1">{formula.expression}</p>
                          <p className="text-xs text-gray-500">{formula.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {details.concepts && details.concepts.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3">📚 Key Concepts</h3>
                    <ul className="space-y-2">
                      {details.concepts.map((concept, idx) => (
                        <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          {concept}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {details.applications && details.applications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3">🌍 Real-World Applications</h3>
                    <ul className="space-y-2">
                      {details.applications.map((app, idx) => (
                        <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">✓</span>
                          {app}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

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

            {!hasScene ? (
              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <p className="text-xs text-yellow-400/80">
                  🚧 This experiment&apos;s 3D simulation is being built. Check back soon!
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                <p className="text-xs text-green-400/80">
                  ✅ Interactive simulation active! Use the controls panel to adjust parameters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
