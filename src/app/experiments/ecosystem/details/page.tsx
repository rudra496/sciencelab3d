'use client';

import Link from 'next/link';

export default function EcosystemDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#14b8a6]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#14b8a6]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌍</span>
            <h1 className="text-2xl font-bold text-[#14b8a6]">Ecosystem</h1>
          </div>
          <Link
            href="/experiments/ecosystem"
            className="px-4 py-2 bg-[#14b8a6]/20 hover:bg-[#14b8a6]/30 text-[#14b8a6] rounded-lg border border-[#14b8a6]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#14b8a6]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            An ecosystem consists of all the organisms and the physical environment with which they interact.
            Energy flows through trophic levels from producers to consumers, with only about 10% of energy
            transferred between levels. This simulation demonstrates population dynamics and energy flow in a
            simplified food web.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#14b8a6]">Trophic Levels</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#14b8a6]/20">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Producers (Level 1)</h3>
              <p className="text-gray-300">
                Autotrophs like plants that convert sunlight into chemical energy through photosynthesis. They
                form the base of the ecosystem.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#14b8a6]/20">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Primary Consumers (Level 2)</h3>
              <p className="text-gray-300">
                Herbivores that feed on producers. Examples include rabbits, deer, and insects. They receive
                energy from plants.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#14b8a6]/20">
              <h3 className="text-xl font-semibold mb-2 text-amber-400">Secondary Consumers (Level 3)</h3>
              <p className="text-gray-300">
                Carnivores that feed on herbivores. Examples include frogs, small birds, and spiders. They
                receive energy from primary consumers.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#14b8a6]/20">
              <h3 className="text-xl font-semibold mb-2 text-red-400">Tertiary Consumers (Level 4)</h3>
              <p className="text-gray-300">
                Top predators that feed on secondary consumers. Examples include eagles, sharks, and lions.
                They sit at the top of the food chain.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#14b8a6]">The 10% Rule</h2>
          <div className="bg-gray-900/50 rounded-lg p-6 border border-[#14b8a6]/20">
            <p className="text-gray-300 mb-4">
              Only about 10% of energy is transferred from one trophic level to the next. The rest is lost as:
            </p>
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#14b8a6] mt-1">•</span>
                <span>Heat (through metabolic processes)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#14b8a6] mt-1">•</span>
                <span>Undigested material</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#14b8a6] mt-1">•</span>
                <span>Waste products</span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#14b8a6]">How to Use</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#14b8a6] mt-1">•</span>
              <span>Adjust population levels to see ecosystem balance changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#14b8a6] mt-1">•</span>
              <span>Observe how changes at one level affect other levels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#14b8a6] mt-1">•</span>
              <span>Note the pyramid structure - fewer organisms at higher levels</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#14b8a6]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#14b8a6]/20">
              <h3 className="font-semibold mb-2 text-[#14b8a6]">Conservation</h3>
              <p className="text-gray-300 text-sm">
                Understanding trophic cascades helps protect endangered species.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#14b8a6]/20">
              <h3 className="font-semibold mb-2 text-[#14b8a6]">Fisheries Management</h3>
              <p className="text-gray-300 text-sm">
                Sustainable harvesting based on food web dynamics.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#14b8a6]/20">
              <h3 className="font-semibold mb-2 text-[#14b8a6]">Climate Change</h3>
              <p className="text-gray-300 text-sm">
                Ecosystem models predict responses to environmental changes.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#14b8a6]/20">
              <h3 className="font-semibold mb-2 text-[#14b8a6]">Agriculture</h3>
              <p className="text-gray-300 text-sm">
                Managing pests through natural predators instead of pesticides.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/ecosystem"
            className="inline-block px-8 py-3 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
