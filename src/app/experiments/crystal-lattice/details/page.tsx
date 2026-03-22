"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function CrystalLatticeDetailsPage() {
  const params = useParams();
  const experimentId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💎</span>
            <div>
              <h1 className="text-2xl font-bold text-purple-400">Crystal Lattice</h1>
              <p className="text-sm text-gray-400">Chemistry Experiment Details</p>
            </div>
          </div>
          <Link
            href="/experiments/crystal-lattice"
            className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all border border-purple-500/30 flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Crystal lattices are highly ordered, repeating arrangements of atoms, ions, or molecules in solids.
            This experiment visualizes four fundamental crystal structures: FCC, BCC, HCP, and diamond cubic,
            showing how atoms pack together in three dimensions.
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Unit Cell:</strong> Smallest repeating unit that shows the full crystal symmetry</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Coordination Number:</strong> Number of nearest neighbors for each atom</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Packing Efficiency:</strong> Fraction of volume actually occupied by atoms</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">FCC:</strong> Face-Centered Cubic - atoms at corners and face centers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">BCC:</strong> Body-Centered Cubic - atoms at corners and body center</span>
            </li>
          </ul>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Structure Properties
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-purple-300 mb-2">FCC Properties</div>
              <div className="text-white space-y-1">
                <div>Atoms per cell: 4</div>
                <div>Coordination: 12</div>
                <div>Packing: 74%</div>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-purple-300 mb-2">BCC Properties</div>
              <div className="text-white space-y-1">
                <div>Atoms per cell: 2</div>
                <div>Coordination: 8</div>
                <div>Packing: 68%</div>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-purple-300 mb-2">HCP Properties</div>
              <div className="text-white space-y-1">
                <div>Atoms per cell: 6</div>
                <div>Coordination: 12</div>
                <div>Packing: 74%</div>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-purple-300 mb-2">Diamond Properties</div>
              <div className="text-white space-y-1">
                <div>Atoms per cell: 8</div>
                <div>Coordination: 4</div>
                <div>Packing: 34%</div>
              </div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-purple-400">1.</span>
              <span><strong className="text-purple-300">Metallurgy:</strong> Designing stronger alloys by controlling crystal structure</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400">2.</span>
              <span><strong className="text-purple-300">Semiconductors:</strong> Silicon's diamond structure enables electronics</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400">3.</span>
              <span><strong className="text-purple-300">Materials Science:</strong> Understanding properties like density and melting point</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400">4.</span>
              <span><strong className="text-purple-300">Jewelry:</strong> Diamond's structure gives it exceptional hardness</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400">5.</span>
              <span><strong className="text-purple-300">Nanotechnology:</strong> Engineering materials at the atomic scale</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>⚙️</span> How to Use This Experiment
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-sm flex items-center justify-center">1</span>
              <span>Select a <strong className="text-purple-300">Crystal Structure</strong> (FCC, BCC, HCP, or diamond)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-sm flex items-center justify-center">2</span>
              <span>Toggle <strong className="text-purple-300">Unit Cell Wireframe</strong> to see the repeating unit</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-sm flex items-center justify-center">3</span>
              <span>Toggle <strong className="text-purple-300">Atomic Bonds</strong> to visualize connections</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-sm flex items-center justify-center">4</span>
              <span>Compare <strong className="text-purple-300">packing efficiency</strong> between structures</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-sm flex items-center justify-center">5</span>
              <span>Use <strong className="text-purple-300">Pause/Play</strong> to rotate and examine the structure</span>
            </li>
          </ol>
        </section>

        {/* Launch Button */}
        <div className="text-center py-8">
          <Link
            href="/experiments/crystal-lattice"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
          >
            🚀 Launch Crystal Lattice Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
