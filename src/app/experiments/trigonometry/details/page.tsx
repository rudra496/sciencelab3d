"use client";

import Link from "next/link";

export default function TrigonometryDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950/20 to-gray-950 text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-violet-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📐</span>
            <div>
              <h1 className="text-2xl font-bold text-violet-400">Trigonometry</h1>
              <p className="text-sm text-gray-400">Math Experiment Details</p>
            </div>
          </div>
          <Link href="/experiments/trigonometry" className="px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 rounded-lg transition-all border border-violet-500/30 flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-violet-500/20">
          <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Explore the fundamental relationships between angles and ratios in triangles through the unit circle.
            Visualize how sine, cosine, and tangent functions relate to the geometry of circles and periodic waves.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-violet-500/20">
          <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-violet-300">Unit Circle:</strong> Circle with radius 1, center at origin</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-violet-300">Sine:</strong> Vertical coordinate on unit circle</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-violet-300">Cosine:</strong> Horizontal coordinate on unit circle</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-violet-300">Tangent:</strong> Ratio of sine to cosine</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-violet-300">Pythagorean Identity:</strong> sin²(θ) + cos²(θ) = 1</span>
            </li>
          </ul>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-violet-500/20">
          <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-violet-300 mb-2">Basic Definitions</div>
              <div className="text-white">sin(θ) = opposite/hypotenuse</div>
              <div className="text-white">cos(θ) = adjacent/hypotenuse</div>
              <div className="text-white">tan(θ) = opposite/adjacent</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-violet-300 mb-2">Pythagorean Identity</div>
              <div className="text-white text-lg">sin²(θ) + cos²(θ) = 1</div>
            </div>
          </div>
        </section>

        <div className="text-center py-8">
          <Link href="/experiments/trigonometry" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20">
            🚀 Launch Trigonometry
          </Link>
        </div>
      </div>
    </div>
  );
}
