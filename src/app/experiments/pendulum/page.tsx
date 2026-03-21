/**
 * World-Class Pendulum Experiment
 * A new high-quality version with:
 * - Larger, immersive experiment space
 * - Realistic 3D models and materials
 * - Accurate physics (Runge-Kutta integration)
 * - Professional UI with toggleable panels
 * - Real-time data visualization
 * - Energy conservation display
 * - Phase space diagram
 * - Mobile and desktop responsive
 */

import PendulumExperimentPage from "@/experiments/pendulum-page";

export const dynamic = 'force-dynamic';

export default function PendulumRoute() {
  return <PendulumExperimentPage />;
}

export const metadata = {
  title: "Simple Pendulum - World Class Physics Lab",
  description: "Interactive 3D pendulum simulation with accurate physics, real-time data visualization, and energy conservation display.",
};
