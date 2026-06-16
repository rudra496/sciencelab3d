import AtomicStructurePage from "@/experiments/atomic-structure-page";
export const dynamic = 'force-dynamic';
export default function AtomicStructureRoute() { return <AtomicStructurePage />; }

export const metadata = {
  title: "Atomic Structure - Interactive 3D Chemistry Lab",
  description: "Explore atoms in 3D — add/remove protons, neutrons, and electrons. See how elements change and electron shells fill up. Free online atomic model simulation.",
};
