import NaturalSelectionPage from '@/experiments/natural-selection-page';

export const dynamic = 'force-static';

export default function Route() {
  return <NaturalSelectionPage />;
}

export const metadata = {
  title: "Natural Selection Simulator - Interactive Evolution Lab",
  description: "Simulate evolution! Control environment factors and watch populations adapt over generations. Free interactive biology experiment.",
};
