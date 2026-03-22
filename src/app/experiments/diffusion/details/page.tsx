'use client';

import Link from 'next/link';

export default function DiffusionDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#6366f1]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#6366f1]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔬</span>
            <h1 className="text-2xl font-bold text-[#6366f1]">Diffusion</h1>
          </div>
          <Link
            href="/experiments/diffusion"
            className="px-4 py-2 bg-[#6366f1]/20 hover:bg-[#6366f1]/30 text-[#6366f1] rounded-lg border border-[#6366f1]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#6366f1]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            Diffusion is the passive movement of particles from an area of high concentration to an area of
            low concentration. This fundamental process drives many biological functions, including oxygen
            exchange in lungs, nutrient absorption in cells, and signal transmission in neurons.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#6366f1]">Key Concepts</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#6366f1]/20">
              <h3 className="text-xl font-semibold mb-2 text-amber-400">Concentration Gradient</h3>
              <p className="text-gray-300">
                The difference in concentration between two areas. Particles move down their gradient - from
                high to low concentration - until equilibrium is reached.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#6366f1]/20">
              <h3 className="text-xl font-semibold mb-2 text-red-400">Temperature Effects</h3>
              <p className="text-gray-300">
                Higher temperatures increase particle kinetic energy, causing faster diffusion. This is why
                diffusion occurs more rapidly in warm environments.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#6366f1]/20">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Permeability</h3>
              <p className="text-gray-300">
                Membranes can be selectively permeable, allowing only certain particles to pass. Lipid-soluble
                molecules pass through easily, while large or charged molecules require transport proteins.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#6366f1]/20">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Equilibrium</h3>
              <p className="text-gray-300">
                When particles are evenly distributed throughout a space, the system reaches equilibrium.
                Particles continue moving but with no net change in concentration.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#6366f1]">Fick's Law of Diffusion</h2>
          <div className="bg-gray-900/50 rounded-lg p-6 border border-[#6366f1]/20">
            <p className="text-xl font-mono text-[#6366f1] mb-4">
              J = -D × (ΔC/Δx)
            </p>
            <p className="text-gray-300">
              Where J is the diffusion rate, D is the diffusion coefficient, and ΔC/Δx is the concentration
              gradient. This equation quantifies how factors affecting diffusion rate.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#6366f1]">How to Use</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#6366f1] mt-1">•</span>
              <span>Adjust temperature to see how kinetic energy affects diffusion speed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6366f1] mt-1">•</span>
              <span>Change membrane permeability to control particle passage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6366f1] mt-1">•</span>
              <span>Modify initial concentration to see how gradient affects rate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6366f1] mt-1">•</span>
              <span>Watch equilibrium develop as particles distribute evenly</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#6366f1]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#6366f1]/20">
              <h3 className="font-semibold mb-2 text-[#6366f1]">Respiratory System</h3>
              <p className="text-gray-300 text-sm">
                Oxygen diffuses from alveoli into blood, while CO₂ diffuses from blood into alveoli.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#6366f1]/20">
              <h3 className="font-semibold mb-2 text-[#6366f1]">Drug Delivery</h3>
              <p className="text-gray-300 text-sm">
                Medications must diffuse through tissues to reach their targets.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#6366f1]/20">
              <h3 className="font-semibold mb-2 text-[#6366f1]">Cellular Transport</h3>
              <p className="text-gray-300 text-sm">
                Nutrients enter cells and waste exits through diffusion and osmosis.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#6366f1]/20">
              <h3 className="font-semibold mb-2 text-[#6366f1]">Kidney Function</h3>
              <p className="text-gray-300 text-sm">
                Diffusion across nephron membranes filters blood and reabsorbs nutrients.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/diffusion"
            className="inline-block px-8 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
