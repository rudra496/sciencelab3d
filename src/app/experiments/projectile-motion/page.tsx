/**
 * World-Class Projectile Motion Experiment
 * A new high-quality version with:
 * - Realistic 3D launcher and projectile models
 * - Accurate physics with optional air resistance
 * - Trajectory prediction
 * - Interactive target system
 * - Real-time data visualization
 * - Energy calculations
 * - Professional UI with toggleable panels
 */

import ProjectileMotionPage from "@/experiments/projectile-motion-page";

export const dynamic = 'force-dynamic';

export default function ProjectileMotionRoute() {
  return <ProjectileMotionPage />;
}

export const metadata = {
  title: "Projectile Motion - World Class Physics Lab",
  description: "Interactive 3D projectile simulation with air resistance, trajectory prediction, and real-time data visualization.",
};
