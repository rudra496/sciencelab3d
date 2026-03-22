'use client';

import Link from 'next/link';

export default function CellularRespirationDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#ef4444]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#ef4444]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <h1 className="text-2xl font-bold text-[#ef4444]">Cellular Respiration</h1>
          </div>
          <Link
            href="/experiments/cellular-respiration"
            className="px-4 py-2 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] rounded-lg border border-[#ef4444]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ef4444]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            Cellular respiration is the process by which cells convert glucose and oxygen into ATP, carbon
            dioxide, and water. Occurring in mitochondria, it's the primary way cells harvest energy from organic
            molecules. This process is essential for powering cellular activities.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ef4444]">Key Concepts</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ef4444]/20">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Glycolysis</h3>
              <p className="text-gray-300">
                Occurs in cytoplasm. Breaks down glucose into pyruvate, producing 2 ATP and 2 NADH. Anaerobic
                process - doesn't require oxygen.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ef4444]/20">
              <h3 className="text-xl font-semibold mb-2 text-amber-400">Krebs Cycle</h3>
              <p className="text-gray-300">
                Occurs in mitochondrial matrix. Completes glucose breakdown, producing 2 ATP, 6 NADH, and 2
                FADH₂ per glucose.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ef4444]/20">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Electron Transport Chain</h3>
              <p className="text-gray-300">
                Occurs in inner mitochondrial membrane. Uses NADH and FADH₂ to generate ~32-34 ATP through
                oxidative phosphorylation.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ef4444]">The Equation</h2>
          <div className="bg-gray-900/50 rounded-lg p-8 border border-[#ef4444]/20 text-center">
            <p className="text-2xl font-mono text-[#ef4444] mb-4">
              C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~38 ATP
            </p>
            <p className="text-gray-400 text-sm">
              Glucose + Oxygen → Carbon Dioxide + Water + ATP
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ef4444]">How to Use</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#ef4444] mt-1">•</span>
              <span>Select stages to see each phase of respiration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ef4444] mt-1">•</span>
              <span>Adjust glucose and oxygen levels to see rate changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ef4444] mt-1">•</span>
              <span>Watch ATP production increase through the stages</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ef4444]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ef4444]/20">
              <h3 className="font-semibold mb-2 text-[#ef4444]">Metabolism</h3>
              <p className="text-gray-300 text-sm">
                Understanding metabolic rates and energy balance for health and fitness.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ef4444]/20">
              <h3 className="font-semibold mb-2 text-[#ef4444]">Disease Research</h3>
              <p className="text-gray-300 text-sm">
                Mitochondrial diseases and metabolic disorders studied through respiration defects.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/cellular-respiration"
            className="inline-block px-8 py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
