'use client';

import Link from 'next/link';

export default function ImmuneResponseDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#f97316]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#f97316]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            <h1 className="text-2xl font-bold text-[#f97316]">Immune Response</h1>
          </div>
          <Link
            href="/experiments/immune-response"
            className="px-4 py-2 bg-[#f97316]/20 hover:bg-[#f97316]/30 text-[#f97316] rounded-lg border border-[#f97316]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#f97316]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            The immune system defends the body against pathogens like viruses. This simulation shows how
            antibodies identify and neutralize viruses, while T cells coordinate the immune response. Understanding
            these processes is crucial for developing vaccines and treatments.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#f97316]">Key Concepts</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f97316]/20">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Antibodies</h3>
              <p className="text-gray-300">
                Y-shaped proteins produced by B cells that bind to specific antigens on pathogens, marking
                them for destruction or neutralizing them directly.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f97316]/20">
              <h3 className="text-xl font-semibold mb-2 text-green-400">T Cells</h3>
              <p className="text-gray-300">
                White blood cells that coordinate immune responses. Helper T cells activate other immune cells,
                while Killer T cells destroy infected cells.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f97316]/20">
              <h3 className="text-xl font-semibold mb-2 text-red-400">Virus</h3>
              <p className="text-gray-300">
                Infectious agents that invade host cells, hijack cellular machinery to replicate, and can cause
                various diseases.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f97316]/20">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">Antigens</h3>
              <p className="text-gray-300">
                Unique molecular markers on pathogens that antibodies recognize and bind to, triggering an immune
                response.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#f97316]">Immune Response Phases</h2>
          <div className="space-y-3">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-[#f97316]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#f97316]">1. Recognition</h3>
              <p className="text-gray-300 text-sm">
                Immune cells identify foreign invaders through antigen recognition.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-[#f97316]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#f97316]">2. Activation</h3>
              <p className="text-gray-300 text-sm">
                T cells activate B cells to produce specific antibodies.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-[#f97316]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#f97316]">3. Response</h3>
              <p className="text-gray-300 text-sm">
                Antibodies neutralize pathogens and mark them for destruction.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-[#f97316]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#f97316]">4. Memory</h3>
              <p className="text-gray-300 text-sm">
                Memory B and T cells remain for faster future responses.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#f97316]">How to Use</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#f97316] mt-1">•</span>
              <span>Adjust virus level to simulate different infection severities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#f97316] mt-1">•</span>
              <span>Control antibody production rate to see immune system efficiency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#f97316] mt-1">•</span>
              <span>Watch antibodies hunt and neutralize viruses in real-time</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#f97316]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f97316]/20">
              <h3 className="font-semibold mb-2 text-[#f97316]">Vaccine Development</h3>
              <p className="text-gray-300 text-sm">
                Vaccines train the immune system by presenting harmless antigens.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f97316]/20">
              <h3 className="font-semibold mb-2 text-[#f97316]">Autoimmune Diseases</h3>
              <p className="text-gray-300 text-sm">
                When the immune system mistakenly attacks self-antigens.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f97316]/20">
              <h3 className="font-semibold mb-2 text-[#f97316]">Immunotherapy</h3>
              <p className="text-gray-300 text-sm">
                Cancer treatments that boost immune system to attack tumors.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f97316]/20">
              <h3 className="font-semibold mb-2 text-[#f97316]">Antiviral Drugs</h3>
              <p className="text-gray-300 text-sm">
                Medications that interfere with viral replication.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/immune-response"
            className="inline-block px-8 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
