import CalculusVisualizerPage from "@/experiments/calculus-visualizer-page";
export const dynamic = 'force-dynamic';
export default function CalculusVisualizerRoute() { return <CalculusVisualizerPage />; }

export const metadata = {
  title: "Calculus Visualizer - Interactive Math Tool",
  description: "Visualize derivatives, integrals, and Riemann sums in 3D. Watch tangent lines and area under curves animate in real-time. Free calculus learning tool.",
};
