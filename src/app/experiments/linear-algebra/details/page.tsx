"use client";

import Link from "next/link";

export default function LinearAlgebraDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/20 to-gray-950 text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-indigo-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔢</span>
            <div>
              <h1 className="text-2xl font-bold text-indigo-400">Linear Algebra</h1>
              <p className="text-sm text-gray-400">Math Experiment Details</p>
            </div>
          </div>
          <Link href="/experiments/linear-algebra" className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg transition-all border border-indigo-500/30 flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-indigo-500/20">
          <h2 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Explore the foundations of linear algebra: vectors as arrows in space, basis vectors that define coordinate systems,
            and linear transformations that stretch, rotate, and shear space. Visualize how matrices transform vectors.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-indigo-500/20">
          <h2 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span><strong className="text-indigo-300">Vectors:</strong> Quantities with magnitude and direction</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span><strong className="text-indigo-300">Basis:</strong> Set of linearly independent vectors that span a space</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span><strong className="text-indigo-300">Linear Transformation:</strong> Function preserving vector addition and scaling</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span><strong className="text-indigo-300">Matrix:</strong> Rectangular array representing linear transformations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span><strong className="text-indigo-300">Dot Product:</strong> Measures similarity and projection</span>
            </li>
          </ul>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-indigo-500/20">
          <h2 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-indigo-300 mb-2">Vector Magnitude</div>
              <div className="text-white text-lg">||v|| = √(x² + y² + z²)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-indigo-300 mb-2">Dot Product</div>
              <div className="text-white text-lg">v·w = ||v|| ||w|| cos(θ)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-indigo-300 mb-2">Matrix Transformation</div>
              <div className="text-white text-lg">Av = b</div>
            </div>
          </div>
        </section>

        <div className="text-center py-8">
          <Link href="/experiments/linear-algebra" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
            🚀 Launch Linear Algebra
          </Link>
        </div>
      </div>
    </div>
  );
}
