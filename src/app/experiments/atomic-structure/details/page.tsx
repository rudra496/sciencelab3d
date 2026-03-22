"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function AtomicStructureDetailsPage() {
  const params = useParams();
  const experimentId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-cyan-950/20 to-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-cyan-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚛️</span>
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">Atomic Structure</h1>
              <p className="text-sm text-gray-400">Chemistry Experiment Details</p>
            </div>
          </div>
          <Link
            href="/experiments/atomic-structure"
            className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg transition-all border border-cyan-500/30 flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Atoms are the fundamental building blocks of matter, consisting of a dense nucleus containing
            protons and neutrons, surrounded by electrons in orbitals. This experiment visualizes atomic
            structure for elements 1-20, showing how electrons are arranged in shells around the nucleus.
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Protons:</strong> Positively charged particles in the nucleus (determine atomic number)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Neutrons:</strong> Neutral particles in the nucleus (add mass without charge)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Electrons:</strong> Negatively charged particles in orbitals (determine chemical properties)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Electron Shells:</strong> Energy levels where electrons orbit (2, 8, 18... electrons)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Atomic Number:</strong> Number of protons (defines the element)</span>
            </li>
          </ul>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-cyan-300 mb-2">Mass Number</div>
              <div className="text-white text-lg">A = Z + N</div>
              <div className="text-gray-400 text-xs mt-2">Where Z = protons, N = neutrons</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-cyan-300 mb-2">Shell Capacity (Bohr Model)</div>
              <div className="text-white text-lg">2n²</div>
              <div className="text-gray-400 text-xs mt-2">Where n = shell number (1, 2, 3...)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-cyan-300 mb-2">Charge Balance</div>
              <div className="text-white text-lg">Protons = Electrons (neutral atom)</div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">1.</span>
              <span><strong className="text-cyan-300">Chemistry:</strong> Understanding chemical bonding and reactions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">2.</span>
              <span><strong className="text-cyan-300">Materials Science:</strong> Designing new materials with specific properties</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">3.</span>
              <span><strong className="text-cyan-300">Nuclear Energy:</strong> Understanding fission and fusion</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">4.</span>
              <span><strong className="text-cyan-300">Medicine:</strong> Medical imaging (MRI, PET scans) and radiation therapy</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">5.</span>
              <span><strong className="text-cyan-300">Electronics:</strong> Semiconductor design and quantum computing</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>⚙️</span> How to Use This Experiment
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-400 text-sm flex items-center justify-center">1</span>
              <span>Adjust the <strong className="text-cyan-300">Atomic Number</strong> to select different elements</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-400 text-sm flex items-center justify-center">2</span>
              <span>Use the <strong className="text-cyan-300">Quick Select</strong> buttons for common elements</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-400 text-sm flex items-center justify-center">3</span>
              <span>Toggle <strong className="text-cyan-300">Electron Clouds</strong> to see probability regions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-400 text-sm flex items-center justify-center">4</span>
              <span>Toggle <strong className="text-cyan-300">Orbital Paths</strong> to see electron orbits</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-400 text-sm flex items-center justify-center">5</span>
              <span>Observe how <strong className="text-cyan-300">electron shells fill</strong> as atomic number increases</span>
            </li>
          </ol>
        </section>

        {/* Launch Button */}
        <div className="text-center py-8">
          <Link
            href="/experiments/atomic-structure"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            🚀 Launch Atomic Structure Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
