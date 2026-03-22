"use client";

import Link from "next/link";

export default function CalculusVisualizerDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-green-950/20 to-gray-950 text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-green-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">∫</span>
            <div>
              <h1 className="text-2xl font-bold text-green-400">Calculus Visualizer</h1>
              <p className="text-sm text-gray-400">Math Experiment Details</p>
            </div>
          </div>
          <Link href="/experiments/calculus-visualizer" className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all border border-green-500/30 flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-green-500/20">
          <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Explore the fundamental concepts of calculus: derivatives (rates of change), integrals (areas under curves),
            and tangent lines. Visualize how the derivative represents the slope of a function at any point and how
            the integral accumulates area.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-green-500/20">
          <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span><strong className="text-green-300">Derivative:</strong> Instantaneous rate of change, slope of tangent line</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span><strong className="text-green-300">Integral:</strong> Area under curve, accumulation of quantities</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span><strong className="text-green-300">Fundamental Theorem:</strong> Derivative and integral are inverse operations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span><strong className="text-green-300">Riemann Sum:</strong> Approximating area with rectangles</span>
            </li>
          </ul>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-green-500/20">
          <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-green-300 mb-2">Derivative Definition</div>
              <div className="text-white text-lg">f'(x) = lim[h→0] (f(x+h) - f(x))/h</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-green-300 mb-2">Fundamental Theorem</div>
              <div className="text-white text-lg">d/dx ∫[a,x] f(t)dt = f(x)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-green-300 mb-2">Power Rule</div>
              <div className="text-white text-lg">d/dx(xⁿ) = nxⁿ⁻¹</div>
            </div>
          </div>
        </section>

        <div className="text-center py-8">
          <Link href="/experiments/calculus-visualizer" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/20">
            🚀 Launch Calculus Visualizer
          </Link>
        </div>
      </div>
    </div>
  );
}
