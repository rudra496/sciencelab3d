"use client";

import Link from "next/link";

export default function ProjectileMotionDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-green-950/20 to-gray-950 text-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-xl border-b border-green-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Projectile Motion</h1>
          </div>
          <Link
            href="/experiments/projectile-motion"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-green-500/20"
          >
            <span>←</span>
            <span className="hidden sm:inline">Back to Experiment</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* About */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span>🎯</span> About Projectile Motion
          </h2>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
            Projectile motion is the motion of an object thrown or projected into the air, subject only to the acceleration of gravity.
            The horizontal and vertical motions are <strong className="text-white">independent</strong> of each other —
            a revolutionary insight from Galileo. The resulting path is a parabola (without air resistance).
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Physics Concepts
          </h2>
          <ul className="space-y-4 text-sm sm:text-base text-gray-300">
            <li className="flex gap-3">
              <span className="text-green-400 mt-0.5 font-bold">•</span>
              <div>
                <strong className="text-white">Independence of Motions:</strong> Horizontal velocity is constant; vertical motion is free fall
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 mt-0.5 font-bold">•</span>
              <div>
                <strong className="text-white">Optimal Angle:</strong> 45° gives maximum range (no air resistance)
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 mt-0.5 font-bold">•</span>
              <div>
                <strong className="text-white">Complementary Angles:</strong> Angles θ and (90°-θ) give the same range
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 mt-0.5 font-bold">•</span>
              <div>
                <strong className="text-white">Air Resistance:</strong> Drag force F = -½ρCdA|v|v opposes motion, making trajectory asymmetric
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 mt-0.5 font-bold">•</span>
              <div>
                <strong className="text-white">Maximum Height:</strong> Occurs when vertical velocity = 0
              </div>
            </li>
          </ul>
        </section>

        {/* Formulas */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span>📐</span> Formulas
          </h2>
          <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-5 sm:p-6 font-mono text-sm space-y-5">
            <div>
              <span className="text-gray-500 text-xs block mb-1">Horizontal position:</span>
              <span className="text-purple-300 text-base">x(t) = v₀·cos(θ)·t</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Vertical position:</span>
              <span className="text-pink-300 text-base">y(t) = v₀·sin(θ)·t - ½gt²</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Horizontal velocity:</span>
              <span className="text-green-300 text-base">vₓ = v₀·cos(θ)</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Vertical velocity:</span>
              <span className="text-blue-300 text-base">vᵧ = v₀·sin(θ) - gt</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Range:</span>
              <span className="text-yellow-300 text-base">R = v₀²·sin(2θ) / g</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Max Height:</span>
              <span className="text-orange-300 text-base">H = v₀²·sin²(θ) / (2g)</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Time of Flight:</span>
              <span className="text-cyan-300 text-base">T = 2v₀·sin(θ) / g</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">With air resistance (drag):</span>
              <span className="text-red-300 text-base">F_drag = -C_d · |v| · v̂</span>
            </div>
          </div>
        </section>

        {/* Air Resistance */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span>💨</span> Air Resistance
          </h2>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
            In reality, projectiles experience air resistance proportional to the <strong className="text-white">square of their speed</strong> (quadratic drag).
            This simulation uses RK4 numerical integration to solve the equations of motion with drag.
            You&apos;ll notice: shorter range, asymmetric trajectory (steeper descent), and reduced time of flight compared to the ideal case.
          </p>
        </section>

        {/* Real-World Applications */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-sm sm:text-base text-gray-300">
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Sports:</strong> Basketball, football, golf, javelin — all follow projectile physics</div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Military:</strong> Artillery trajectory calculation and ballistic missile design</div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Space:</strong> Rocket launch trajectories and orbital insertion</div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Engineering:</strong> Water fountains, fireworks, sprinkler systems</div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Entertainment:</strong> Angry Birds physics engine!</div>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span>🎮</span> How to Use the Simulation
          </h2>
          <ul className="space-y-3 text-sm sm:text-base text-gray-300">
            <li className="flex gap-3">
              <span className="text-green-400 font-bold">1.</span>
              <div>Set <strong className="text-purple-600">velocity</strong> and <strong className="text-pink-600">angle</strong>, then hit <strong className="text-green-600">🚀 Launch</strong></div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 font-bold">2.</span>
              <div>Watch the <strong className="text-yellow-600">ghost markers</strong> appear every 0.5s to see time spacing</div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 font-bold">3.</span>
              <div>Enable <strong className="text-orange-600">Air Resistance</strong> to see how drag affects the trajectory</div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 font-bold">4.</span>
              <div>Compare <strong className="text-purple-600">predicted</strong> vs <strong className="text-pink-600">actual</strong> range after landing</div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 font-bold">5.</span>
              <div>Try different <strong className="text-green-600">gravity presets</strong> — the Moon gives crazy range!</div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 font-bold">6.</span>
              <div>Adjust <strong className="text-blue-600">target distance</strong> and try to hit the bullseye</div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 font-bold">7.</span>
              <div>Use <strong className="text-purple-600">Speed</strong> slider for slow-motion analysis</div>
            </li>
          </ul>
        </section>

        {/* Back Button */}
        <div className="text-center pb-8">
          <Link
            href="/experiments/projectile-motion"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-xl transition-all shadow-xl shadow-green-500/30 text-sm"
          >
            <span>🎯</span>
            Launch the Projectile Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
