"use client";

import Link from "next/link";

export default function TopologySurfacesDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-pink-950/20 to-gray-950 text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-pink-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🕸️</span>
            <div>
              <h1 className="text-2xl font-bold text-pink-400">Topology Surfaces</h1>
              <p className="text-sm text-gray-400">Math Experiment Details</p>
            </div>
          </div>
          <Link href="/experiments/topology-surfaces" className="px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 rounded-lg transition-all border border-pink-500/30 flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-pink-500/20">
          <h2 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Explore fascinating surfaces in topology: the one-sided Mobius strip, the non-orientable Klein bottle,
            and the classic torus. These surfaces help us understand properties like genus (number of holes),
            orientability, and Euler characteristic.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-pink-500/20">
          <h2 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-1">•</span>
              <span><strong className="text-pink-300">Mobius Strip:</strong> One-sided surface with one edge</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-1">•</span>
              <span><strong className="text-pink-300">Klein Bottle:</strong> Non-orientable surface with no inside/outside</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-1">•</span>
              <span><strong className="text-pink-300">Torus:</strong> Donut-shaped surface with one hole</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-1">•</span>
              <span><strong className="text-pink-300">Genus:</strong> Number of holes in a surface</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-1">•</span>
              <span><strong className="text-pink-300">Euler Characteristic:</strong> Topological invariant χ = 2 - 2g</span>
            </li>
          </ul>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-pink-500/20">
          <h2 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-pink-300 mb-2">Euler Characteristic</div>
              <div className="text-white text-lg">χ = V - E + F = 2 - 2g</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-pink-300 mb-2">Gauss-Bonnet Theorem</div>
              <div className="text-white text-lg">∫K dA = 2πχ</div>
            </div>
          </div>
        </section>

        <div className="text-center py-8">
          <Link href="/experiments/topology-surfaces" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-pink-500/20">
            🚀 Launch Topology Surfaces
          </Link>
        </div>
      </div>
    </div>
  );
}
