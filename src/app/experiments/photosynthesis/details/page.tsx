'use client';

import Link from 'next/link';

export default function PhotosynthesisDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#22c55e]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#22c55e]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌿</span>
            <h1 className="text-2xl font-bold text-[#22c55e]">Photosynthesis</h1>
          </div>
          <Link
            href="/experiments/photosynthesis"
            className="px-4 py-2 bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#22c55e] rounded-lg border border-[#22c55e]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#22c55e]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            Photosynthesis is the process by which plants convert light energy into chemical energy stored in
            glucose. Occurring in chloroplasts, it consists of light-dependent reactions and the Calvin cycle.
            This process produces oxygen as a byproduct and is essential for life on Earth.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#22c55e]">Key Concepts</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#22c55e]/20">
              <h3 className="text-xl font-semibold mb-2 text-amber-400">Light-Dependent Reactions</h3>
              <p className="text-gray-300">
                Occur in thylakoid membranes. Light energy splits water molecules (photolysis), releasing
                oxygen and generating ATP and NADPH for the Calvin cycle.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#22c55e]/20">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Calvin Cycle</h3>
              <p className="text-gray-300">
                Occurs in the stroma. Uses ATP and NADPH from light reactions to fix CO₂ into glucose through
                carbon fixation, reduction, and regeneration phases.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#22c55e]/20">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Chlorophyll</h3>
              <p className="text-gray-300">
                The green pigment in chloroplasts that absorbs light energy, primarily in the blue and red
                wavelengths, reflecting green light.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#22c55e]/20">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">ATP Synthase</h3>
              <p className="text-gray-300">
                Enzyme that uses the proton gradient across thylakoid membranes to generate ATP from ADP and
                phosphate.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#22c55e]">The Equation</h2>
          <div className="bg-gray-900/50 rounded-lg p-8 border border-[#22c55e]/20 text-center">
            <p className="text-2xl font-mono text-[#22c55e] mb-4">
              6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂
            </p>
            <p className="text-gray-400 text-sm">
              Carbon dioxide + Water + Light → Glucose + Oxygen
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#22c55e]">How to Use</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#22c55e] mt-1">•</span>
              <span>Adjust light intensity to see its effect on reaction rates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#22c55e] mt-1">•</span>
              <span>Modify CO₂ and water levels to observe limitations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#22c55e] mt-1">•</span>
              <span>Watch glucose production and oxygen release in real-time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#22c55e] mt-1">•</span>
              <span>Use mouse to rotate and explore the 3D chloroplast</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#22c55e]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#22c55e]/20">
              <h3 className="font-semibold mb-2 text-[#22c55e]">Agriculture</h3>
              <p className="text-gray-300 text-sm">
                Optimizing light, CO₂, and water for crop yield in greenhouses.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#22c55e]/20">
              <h3 className="font-semibold mb-2 text-[#22c55e]">Climate Change</h3>
              <p className="text-gray-300 text-sm">
                Understanding carbon fixation helps model carbon cycles and climate solutions.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#22c55e]/20">
              <h3 className="font-semibold mb-2 text-[#22c55e]">Bioenergy</h3>
              <p className="text-gray-300 text-sm">
                Algae and plant-based biofuel production relies on photosynthetic efficiency.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#22c55e]/20">
              <h3 className="font-semibold mb-2 text-[#22c55e]">Space Exploration</h3>
              <p className="text-gray-300 text-sm">
                Artificial photosynthesis for oxygen and food production in space habitats.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/photosynthesis"
            className="inline-block px-8 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
