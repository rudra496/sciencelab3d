"use client";

import Link from "next/link";

export default function PeriodicTrendsDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-cyan-950/20 to-gray-950 text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-cyan-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚛️</span>
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">Periodic Trends</h1>
              <p className="text-sm text-gray-400">Chemistry Experiment Details</p>
            </div>
          </div>
          <Link href="/experiments/periodic-trends" className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg transition-all border border-cyan-500/30 flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Explore the periodic table of elements in 3D and visualize how atomic properties change across
            periods and down groups. Understand trends in atomic radius, electronegativity, and ionization energy
            that help predict chemical behavior.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Atomic Radius:</strong> Decreases across period, increases down group</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Electronegativity:</strong> Increases across period, decreases down group</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Ionization Energy:</strong> Increases across period, decreases down group</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Effective Nuclear Charge:</strong> Attractive force from nucleus on electrons</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Shielding Effect:</strong> Inner electrons block outer electrons from nucleus</span>
            </li>
          </ul>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">1.</span>
              <span><strong className="text-cyan-300">Chemical Bonding:</strong> Predicting bond types and molecular properties</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">2.</span>
              <span><strong className="text-cyan-300">Reactivity:</strong> Understanding which elements react readily</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">3.</span>
              <span><strong className="text-cyan-300">Materials Science:</strong> Designing alloys and compounds</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">4.</span>
              <span><strong className="text-cyan-300">Drug Design:</strong> Understanding molecular interactions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">5.</span>
              <span><strong className="text-cyan-300">Semiconductor Industry:</strong> Selecting elements for electronic properties</span>
            </li>
          </ul>
        </section>

        <div className="text-center py-8">
          <Link href="/experiments/periodic-trends" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20">
            🚀 Launch Periodic Trends
          </Link>
        </div>
      </div>
    </div>
  );
}
