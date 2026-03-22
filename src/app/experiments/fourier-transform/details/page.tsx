"use client";

import Link from "next/link";

export default function FourierTransformDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌊</span>
            <div>
              <h1 className="text-2xl font-bold text-purple-400">Fourier Transform</h1>
              <p className="text-sm text-gray-400">Math Experiment Details</p>
            </div>
          </div>
          <Link
            href="/experiments/fourier-transform"
            className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all border border-purple-500/30 flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            The Fourier Transform is a fundamental mathematical tool that decomposes complex waveforms into
            simpler sine waves. This experiment demonstrates how any periodic function can be constructed
            by adding together multiple harmonics (integer multiples of a base frequency).
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Fundamental Frequency:</strong> The base frequency of the waveform</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Harmonics:</strong> Integer multiples of the fundamental frequency</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Amplitude:</strong> Height of each harmonic component</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Wave Synthesis:</strong> Building complex waves from simple sine waves</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Frequency Spectrum:</strong> Representation of frequency components</span>
            </li>
          </ul>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-purple-300 mb-2">Fourier Series</div>
              <div className="text-white text-lg">f(x) = a₀/2 + Σ(aₙcos(nx) + bₙsin(nx))</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-purple-300 mb-2">Square Wave Approximation</div>
              <div className="text-white text-lg">f(x) = (4/π) Σ(sin((2n-1)x)/(2n-1))</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-purple-300 mb-2">Amplitude of nth Harmonic</div>
              <div className="text-white text-lg">Aₙ = 1/n</div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-purple-400">1.</span>
              <span><strong className="text-purple-300">Audio Processing:</strong> MP3 compression, equalizers, noise cancellation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400">2.</span>
              <span><strong className="text-purple-300">Image Compression:</strong> JPEG format uses 2D Fourier Transform</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400">3.</span>
              <span><strong className="text-purple-300">Signal Analysis:</strong> Radar, sonar, telecommunications</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400">4.</span>
              <span><strong className="text-purple-300">Medical Imaging:</strong> MRI and CT scan reconstruction</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400">5.</span>
              <span><strong className="text-purple-300">Quantum Mechanics:</strong> Wave function analysis</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>⚙️</span> How to Use This Experiment
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-sm flex items-center justify-center">1</span>
              <span>Adjust the <strong className="text-purple-300">Base Frequency</strong> to change the fundamental wave</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-sm flex items-center justify-center">2</span>
              <span>Increase <strong className="text-purple-300">Harmonics</strong> to add more sine waves to the composite</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-sm flex items-center justify-center">3</span>
              <span>Control <strong className="text-purple-300">Wave Speed</strong> to animate faster or slower</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-sm flex items-center justify-center">4</span>
              <span>Use <strong className="text-purple-300">Quick Presets</strong> to see classic waveforms</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-sm flex items-center justify-center">5</span>
              <span>Observe how individual harmonics combine to form complex shapes</span>
            </li>
          </ol>
        </section>

        {/* Launch Button */}
        <div className="text-center py-8">
          <Link
            href="/experiments/fourier-transform"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
          >
            🚀 Launch Fourier Transform Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
