"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ChemicalBondingDetailsPage() {
  const params = useParams();
  const experimentId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-emerald-950/20 to-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔗</span>
            <div>
              <h1 className="text-2xl font-bold text-emerald-400">Chemical Bonding</h1>
              <p className="text-sm text-gray-400">Chemistry Experiment Details</p>
            </div>
          </div>
          <Link
            href="/experiments/chemical-bonding"
            className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-all border border-emerald-500/30 flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-emerald-500/20">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Chemical bonds are the forces that hold atoms together to form compounds. This experiment
            visualizes the three main types of chemical bonds: ionic (electron transfer), covalent
            (electron sharing), and metallic (delocalized electrons).
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-emerald-500/20">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">•</span>
              <span><strong className="text-emerald-300">Ionic Bonds:</strong> Electron transfer between metals and nonmetals (ΔEN &gt; 1.7)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">•</span>
              <span><strong className="text-emerald-300">Covalent Bonds:</strong> Electron sharing between nonmetals (ΔEN &lt; 1.7)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">•</span>
              <span><strong className="text-emerald-300">Metallic Bonds:</strong> Delocalized electrons in metal lattice</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">•</span>
              <span><strong className="text-emerald-300">Electronegativity:</strong> Atom's ability to attract electrons</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">•</span>
              <span><strong className="text-emerald-300">Bond Length:</strong> Distance between atomic nuclei</span>
            </li>
          </ul>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-emerald-500/20">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Bond Classification
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-emerald-300 mb-2">Electronegativity Difference</div>
              <div className="text-white text-lg">ΔEN = |EN₁ - EN₂|</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-emerald-300 mb-2">Bond Type Rules</div>
              <div className="text-white space-y-1">
                <div>ΔEN &gt; 1.7 → Ionic</div>
                <div>0.5 &lt; ΔEN &lt; 1.7 → Polar Covalent</div>
                <div>ΔEN &lt; 0.5 → Nonpolar Covalent</div>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-emerald-300 mb-2">Bond Energy</div>
              <div className="text-white text-lg">E ∝ 1/bond length</div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-emerald-500/20">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">1.</span>
              <span><strong className="text-emerald-300">Table Salt (NaCl):</strong> Classic ionic compound from ionic bonding</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">2.</span>
              <span><strong className="text-emerald-300">Water (H₂O):</strong> Polar covalent bonds enable life</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">3.</span>
              <span><strong className="text-emerald-300">Metals:</strong> Metallic bonding gives conductivity and malleability</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">4.</span>
              <span><strong className="text-emerald-300">DNA:</strong> Covalent bonds store genetic information</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">5.</span>
              <span><strong className="text-emerald-300">Materials Science:</strong> Designing new materials with specific properties</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-emerald-500/20">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <span>⚙️</span> How to Use This Experiment
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 text-sm flex items-center justify-center">1</span>
              <span>Select the <strong className="text-emerald-300">Bond Type</strong> you want to explore</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 text-sm flex items-center justify-center">2</span>
              <span>Choose two <strong className="text-emerald-300">atoms</strong> from the periodic table</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 text-sm flex items-center justify-center">3</span>
              <span>Use <strong className="text-emerald-300">Common Compounds</strong> for quick examples</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 text-sm flex items-center justify-center">4</span>
              <span>Observe the <strong className="text-emerald-300">bond visualization</strong> to see how atoms connect</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 text-sm flex items-center justify-center">5</span>
              <span>Check the <strong className="text-emerald-300">electronegativity difference</strong> to predict bond type</span>
            </li>
          </ol>
        </section>

        {/* Launch Button */}
        <div className="text-center py-8">
          <Link
            href="/experiments/chemical-bonding"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            🚀 Launch Chemical Bonding Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
