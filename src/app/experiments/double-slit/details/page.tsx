"use client";

import Link from "next/link";

export default function DoubleSlitDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-purple-400">
              🔬 Double Slit Experiment
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Experiment Details
            </p>
          </div>
          <Link
            href="/experiments/double-slit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* About Section */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            📖 About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            The double slit experiment demonstrates wave-particle duality—one of the most fundamental
            and counterintuitive aspects of quantum mechanics. When light (or particles) passes through
            two closely spaced slits, it creates an interference pattern, even when particles pass
            through one at a time.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Originally performed by Thomas Young in 1801, this experiment helped establish the wave
            theory of light. In modern quantum mechanics, it demonstrates the principle of
            superposition and the measurement problem.
          </p>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            📐 Key Formulas
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 font-semibold">Fringe Spacing:</span>
                <code className="text-cyan-300 font-mono">Δy = λL/d</code>
              </div>
              <p className="text-xs text-gray-400">Distance between bright fringes on screen</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 font-semibold">Path Difference:</span>
                <code className="text-cyan-300 font-mono">Δr = dsin(θ)</code>
              </div>
              <p className="text-xs text-gray-400">Difference in path length from two slits</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 font-semibold">Constructive:</span>
                <code className="text-cyan-300 font-mono">Δr = mλ (m = 0, 1, 2, ...)</code>
              </div>
              <p className="text-xs text-gray-400">Condition for bright fringes (maxima)</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 font-semibold">Destructive:</span>
                <code className="text-cyan-300 font-mono">Δr = (m + ½)λ</code>
              </div>
              <p className="text-xs text-gray-400">Condition for dark fringes (minima)</p>
            </div>
          </div>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            💡 Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-purple-400 text-xl">•</span>
              <div>
                <strong className="text-white">Wave-Particle Duality:</strong> Light and matter exhibit
                both wave-like and particle-like properties depending on how they&apos;re observed.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 text-xl">•</span>
              <div>
                <strong className="text-white">Interference:</strong> When two waves overlap, they
                add constructively (bright) or destructively (dark) creating fringes.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 text-xl">•</span>
              <div>
                <strong className="text-white">Superposition:</strong> A quantum system exists in all
                possible states simultaneously until measured.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 text-xl">•</span>
              <div>
                <strong className="text-white">Diffraction:</strong> Light spreads out when passing
                through an opening comparable to its wavelength.
              </div>
            </li>
          </ul>
        </section>

        {/* Historical Significance */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            🏛️ Historical Significance
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-yellow-400">1801</span>
              <span><strong className="text-white">Thomas Young:</strong> Performed the original double-slit experiment, proving light behaves as a wave.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">1909</span>
              <span><strong className="text-white">G.I. Taylor:</strong> Demonstrated interference with single photons.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">1961</span>
              <span><strong className="text-white">Claus Jönsson:</strong> First double-slit experiment with electrons.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">2012</span>
              <span><strong className="text-white">Single Molecules:</strong> Interference observed with individual molecules.</span>
            </li>
          </ul>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            🔬 Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Holography:</strong> Uses interference patterns to create 3D images.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Spectroscopy:</strong> Analyzing light spectra to determine chemical composition.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Optical Coatings:</strong> Anti-reflective coatings use destructive interference.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Radio Antennas:</strong> Phased arrays use interference for directional transmission.</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            🎮 How to Use This Experiment
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-cyan-400">1.</span>
              <span>Adjust <strong className="text-purple-400">Wavelength</strong> to change the color of light and fringe spacing.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">2.</span>
              <span>Modify <strong className="text-pink-400">Slit Separation</strong> to see how it affects the interference pattern.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">3.</span>
              <span>Change <strong className="text-green-400">Slit Width</strong> to observe diffraction effects.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">4.</span>
              <span>Observe the <strong className="text-blue-400">Intensity Graph</strong> showing the interference pattern.</span>
            </li>
          </ul>
        </section>

        {/* Launch Button */}
        <div className="flex justify-center pt-4 pb-8">
          <Link
            href="/experiments/double-slit"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-500/25 text-lg"
          >
            🚀 Launch Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
