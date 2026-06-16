import FourierTransformPage from "@/experiments/fourier-transform-page";
export const dynamic = 'force-dynamic';
export default function FourierTransformRoute() { return <FourierTransformPage />; }

export const metadata = {
  title: "Fourier Transform Visualizer - Interactive Signal Processing",
  description: "Build any waveform by adding sine waves. Watch the frequency spectrum update in real-time as you add harmonics. Free online math tool.",
};
