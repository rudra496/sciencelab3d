import AcidBaseReactionsPage from "@/experiments/acid-base-reactions-page";
export const dynamic = 'force-dynamic';
export default function AcidBaseReactionsRoute() { return <AcidBaseReactionsPage />; }

export const metadata = {
  title: "Acid-Base Reactions - Interactive Chemistry Lab",
  description: "Mix acids and bases and watch neutralization occur in 3D. See pH changes, salt formation, and energy release. Free virtual chemistry experiment.",
};
