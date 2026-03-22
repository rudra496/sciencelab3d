'use client';

import Link from 'next/link';

export default function NervousSystemDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#ec4899]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#ec4899]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧠</span>
            <h1 className="text-2xl font-bold text-[#ec4899]">Nervous System</h1>
          </div>
          <Link
            href="/experiments/nervous-system"
            className="px-4 py-2 bg-[#ec4899]/20 hover:bg-[#ec4899]/30 text-[#ec4899] rounded-lg border border-[#ec4899]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ec4899]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            The nervous system coordinates actions and transmits signals between different parts of the body.
            Neurons communicate through electrical impulses called action potentials. This simulation shows how
            signals propagate along an axon, the role of myelin in speeding transmission, and how synapses pass
            signals to other cells.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ec4899]">Key Concepts</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Action Potential</h3>
              <p className="text-gray-300">
                A rapid change in membrane potential from -70mV (resting) to +40mV (peak) and back. This
                electrical signal travels along the axon.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="text-xl font-semibold mb-2 text-amber-400">Myelin Sheath</h3>
              <p className="text-gray-300">
                Fatty insulation around axons that dramatically increases signal speed through saltatory
                conduction - signals "jump" between nodes of Ranvier.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">Synapse</h3>
              <p className="text-gray-300">
                Junction between neurons where electrical signals convert to chemical signals (neurotransmitters)
                to communicate with the next cell.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Resting Potential</h3>
              <p className="text-gray-300">
                The baseline electrical state of a neuron at -70mV, maintained by ion pumps and selective
                membrane permeability.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ec4899]">How Neurons Fire</h2>
          <div className="space-y-3">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-[#ec4899]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#ec4899]">1. Depolarization</h3>
              <p className="text-gray-300 text-sm">
                Stimulus opens Na+ channels, sodium rushes in, voltage becomes more positive.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-[#ec4899]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#ec4899]">2. Repolarization</h3>
              <p className="text-gray-300 text-sm">
                K+ channels open, potassium flows out, voltage becomes negative again.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-[#ec4899]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#ec4899]">3. Hyperpolarization</h3>
              <p className="text-gray-300 text-sm">
                Voltage briefly drops below resting potential before recovering.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ec4899]">How to Use</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#ec4899] mt-1">•</span>
              <span>Adjust stimulus intensity to see firing frequency change</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ec4899] mt-1">•</span>
              <span>Toggle myelin to compare signal speeds with and without insulation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ec4899] mt-1">•</span>
              <span>Watch action potentials travel from cell body to synapse</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ec4899]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="font-semibold mb-2 text-[#ec4899]">Neurology</h3>
              <p className="text-gray-300 text-sm">
                Diagnosing and treating conditions like multiple sclerosis (myelin damage).
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="font-semibold mb-2 text-[#ec4899]">Anesthesiology</h3>
              <p className="text-gray-300 text-sm">
                Nerve blocks work by preventing action potential propagation.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="font-semibold mb-2 text-[#ec4899]">Brain-Computer Interfaces</h3>
              <p className="text-gray-300 text-sm">
                Interpreting neural signals to control prosthetic devices.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="font-semibold mb-2 text-[#ec4899]">Mental Health</h3>
              <p className="text-gray-300 text-sm">
                Many medications work by altering neurotransmitter function at synapses.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/nervous-system"
            className="inline-block px-8 py-3 bg-[#ec4899] hover:bg-[#db2777] text-white font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
