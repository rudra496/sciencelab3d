"use client";

import Link from "next/link";

export default function Geometry3DDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-blue-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📐</span>
            <div>
              <h1 className="text-2xl font-bold text-blue-400">3D Geometry</h1>
              <p className="text-sm text-gray-400">Math Experiment Details</p>
            </div>
          </div>
          <Link href="/experiments/3d-geometry" className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all border border-blue-500/30 flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-blue-500/20">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Explore the five Platonic solids - the only regular convex polyhedra in 3D space. Each face
            is the same regular polygon, and the same number of faces meet at each vertex. This experiment
            demonstrates Euler's formula: V - E + F = 2 for all convex polyhedra.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-blue-500/20">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong className="text-blue-300">Platonic Solids:</strong> Five regular convex polyhedra</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong className="text-blue-300">Euler's Formula:</strong> V - E + F = 2 for convex polyhedra</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong className="text-blue-300">Regular Polyhedron:</strong> All faces are congruent regular polygons</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong className="text-blue-300">Dual Solids:</strong> Cube ↔ Octahedron, Dodecahedron ↔ Icosahedron</span>
            </li>
          </ul>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-blue-500/20">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-blue-300 mb-2">Euler's Characteristic</div>
              <div className="text-white text-lg">χ = V - E + F = 2</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-blue-300 mb-2">Dihedral Angle</div>
              <div className="text-white text-lg">cos(θ/2) = sin(π/n) / sin(π/m)</div>
            </div>
          </div>
        </section>

        <div className="text-center py-8">
          <Link href="/experiments/3d-geometry" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
            🚀 Launch 3D Geometry Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
