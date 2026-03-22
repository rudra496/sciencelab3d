"use client";

import Link from "next/link";

export default function FibonacciSpiralDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-amber-950/20 to-gray-950 text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐚</span>
            <div>
              <h1 className="text-2xl font-bold text-amber-400">Fibonacci Spiral</h1>
              <p className="text-sm text-gray-400">Math Experiment Details</p>
            </div>
          </div>
          <Link
            href="/experiments/fibonacci-spiral"
            className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg transition-all border border-amber-500/30 flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            The Fibonacci spiral is a logarithmic spiral that grows outward by a factor of the golden ratio
            for every quarter turn it makes. This experiment visualizes how the Fibonacci sequence and the
            golden ratio (φ ≈ 1.618) appear throughout nature, from nautilus shells to sunflower seeds to
            spiral galaxies.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span><strong className="text-amber-300">Fibonacci Sequence:</strong> Each number is the sum of the two preceding ones (0, 1, 1, 2, 3, 5, 8, 13...)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span><strong className="text-amber-300">Golden Ratio (φ):</strong> The ratio of consecutive Fibonacci numbers approaches φ</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span><strong className="text-amber-300">Golden Angle:</strong> ≈ 137.5° - optimizes seed packing in plants</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span><strong className="text-amber-300">Logarithmic Spiral:</strong> Grows by constant factor per rotation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span><strong className="text-amber-300">Phyllotaxis:</strong> Arrangement of leaves on a plant stem</span>
            </li>
          </ul>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-amber-300 mb-2">Fibonacci Sequence</div>
              <div className="text-white text-lg">F(n) = F(n-1) + F(n-2)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-amber-300 mb-2">Golden Ratio</div>
              <div className="text-white text-lg">φ = (1 + √5) / 2 ≈ 1.618034</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-amber-300 mb-2">Binet's Formula</div>
              <div className="text-white text-lg">F(n) = (φⁿ - (-φ)⁻ⁿ) / √5</div>
            </div>
          </div>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-amber-400">1.</span>
              <span><strong className="text-amber-300">Botany:</strong> Seed arrangement in sunflowers, pinecones, and pineapples</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400">2.</span>
              <span><strong className="text-amber-300">Marine Biology:</strong> Nautilus shells and other mollusks</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400">3.</span>
              <span><strong className="text-amber-300">Astronomy:</strong> Spiral galaxy structure</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400">4.</span>
              <span><strong className="text-amber-300">Art & Design:</strong> Composition and proportion in art and architecture</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400">5.</span>
              <span><strong className="text-amber-300">Financial Markets:</strong> Technical analysis and retracement levels</span>
            </li>
          </ul>
        </section>

        <div className="text-center py-8">
          <Link
            href="/experiments/fibonacci-spiral"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            🚀 Launch Fibonacci Spiral Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
