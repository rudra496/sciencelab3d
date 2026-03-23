import CellStructurePage from '@/experiments/cell-structure-page';

export const dynamic = 'force-dynamic';

export default function Route() {
  return <CellStructurePage />;
}

export const metadata = {
  title: "Animal Cell Structure - Interactive 3D Biology Lab",
  description: "Explore a detailed 3D animal cell. Click on organelles to learn about nucleus, mitochondria, ER, Golgi, and more. Free virtual biology lab.",
};
