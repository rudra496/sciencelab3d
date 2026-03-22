"use client";

import Link from "next/link";

export default function SpringMassDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-amber-400">
              🎚️ Spring-Mass System
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Experiment Details
            </p>
          </div>
          <Link
            href="/experiments/spring-mass"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* About Section */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
            📖 About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            A spring-mass system exhibits simple harmonic motion (SHM) when displaced from equilibrium.
            The restoring force is proportional to displacement (Hooke&apos;s Law: F = -kx), resulting in
            oscillatory motion. This simulation demonstrates how mass, spring stiffness, and damping
            affect the system&apos;s behavior.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            The energy continuously transforms between potential energy (stored in the spring) and
            kinetic energy (motion of the mass), while the total energy remains constant in the
            absence of damping.
          </p>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
            📐 Key Formulas
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-300 font-semibold">Period:</span>
                <code className="text-cyan-300 font-mono">T = 2π√(m/k)</code>
              </div>
              <p className="text-xs text-gray-400">Time for one complete oscillation</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-300 font-semibold">Frequency:</span>
                <code className="text-cyan-300 font-mono">f = 1/T = (1/2π)√(k/m)</code>
              </div>
              <p className="text-xs text-gray-400">Oscillations per second (Hertz)</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-300 font-semibold">Hooke&apos;s Law:</span>
                <code className="text-cyan-300 font-mono">F = -kx</code>
              </div>
              <p className="text-xs text-gray-400">Restoring force proportional to displacement</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-300 font-semibold">Angular Frequency:</span>
                <code className="text-cyan-300 font-mono">ω = √(k/m)</code>
              </div>
              <p className="text-xs text-gray-400">Rate of change of the phase of the oscillation</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-300 font-semibold">Kinetic Energy:</span>
                <code className="text-cyan-300 font-mono">KE = ½mv²</code>
              </div>
              <p className="text-xs text-gray-400">Energy due to motion</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-300 font-semibold">Potential Energy:</span>
                <code className="text-cyan-300 font-mono">PE = ½kx²</code>
              </div>
              <p className="text-xs text-gray-400">Energy stored in the spring</p>
            </div>
          </div>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
            💡 Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-amber-400 text-xl">•</span>
              <div>
                <strong className="text-white">Simple Harmonic Motion (SHM):</strong> Periodic motion
                where the restoring force is proportional to displacement and acts in the opposite direction.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 text-xl">•</span>
              <div>
                <strong className="text-white">Equilibrium Position:</strong> The point where the net
                force on the mass is zero (spring is neither stretched nor compressed).
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 text-xl">•</span>
              <div>
                <strong className="text-white">Amplitude:</strong> Maximum displacement from equilibrium.
                The period is independent of amplitude for small oscillations.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 text-xl">•</span>
              <div>
                <strong className="text-white">Damping:</strong> Any resistance that dissipates energy
                from the system, causing the amplitude to decrease over time.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 text-xl">•</span>
              <div>
                <strong className="text-white">Energy Conservation:</strong> In an undamped system,
                total mechanical energy (KE + PE) remains constant throughout the motion.
              </div>
            </li>
          </ul>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
            🔬 Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Automotive Suspension:</strong> Car shock absorbers use spring-mass-damper systems to smooth rides.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Earthquake Protection:</strong> Tuned mass dampers in buildings reduce sway during seismic activity.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Timekeeping:</strong> Mechanical watches use balance springs and oscillators for precision.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Mattress Design:</strong> Pocket spring mattresses use individual spring units for comfort.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Musical Instruments:</strong> Piano and guitar strings vibrate as spring-mass systems to produce sound.</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
            🎮 How to Use This Experiment
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-cyan-400">1.</span>
              <span>Adjust the <strong className="text-amber-400">Mass</strong> to see how heavier objects oscillate more slowly.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">2.</span>
              <span>Change the <strong className="text-green-400">Spring Constant</strong> to make the spring stiffer or more flexible.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">3.</span>
              <span>Modify <strong className="text-blue-400">Damping</strong> to simulate friction and air resistance.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">4.</span>
              <span>Set the <strong className="text-pink-400">Initial Displacement</strong> to determine starting position.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">5.</span>
              <span>Use <strong className="text-purple-400">Play/Pause</strong> to control the simulation and <strong className="text-yellow-400">Reset</strong> to restart.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">6.</span>
              <span>Watch the <strong className="text-orange-400">Energy Bar</strong> to see KE and PE exchange in real-time.</span>
            </li>
          </ul>
        </section>

        {/* Launch Button */}
        <div className="flex justify-center pt-4 pb-8">
          <Link
            href="/experiments/spring-mass"
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 text-lg"
          >
            🚀 Launch Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
