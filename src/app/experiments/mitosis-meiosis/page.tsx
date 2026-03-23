import MitosisMeiosisPage from '@/experiments/mitosis-meiosis-page';

export const dynamic = 'force-dynamic';

export default function Route() {
  return <MitosisMeiosisPage />;
}

export const metadata = {
  title: "Mitosis & Meiosis - Interactive 3D Biology Lab",
  description: "Watch cell division in 3D. Step through prophase, metaphase, anaphase, telophase. Compare mitosis vs meiosis side-by-side. Free biology simulation.",
};
