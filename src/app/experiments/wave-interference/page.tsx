import WaveInterferencePage from "@/experiments/wave-interference-page";

export const dynamic = 'force-dynamic';

export default function WaveInterferenceRoute() {
  return <WaveInterferencePage />;
}

export const metadata = {
  title: "Wave Interference - Interactive Physics Lab",
  description: "Interactive 3D wave interference simulation with realistic water physics and node/antinode visualization.",
};
