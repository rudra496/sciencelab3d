import ImmuneResponsePage from '@/experiments/immune-response-page';

export const dynamic = 'force-dynamic';

export default function Route() {
  return <ImmuneResponsePage />;
}

export const metadata = {
  title: "Immune System Response - Interactive Biology Lab",
  description: "Watch the immune system fight a virus! See macrophages, T-cells, and antibodies in a 3D blood vessel. Free biology simulation.",
};
