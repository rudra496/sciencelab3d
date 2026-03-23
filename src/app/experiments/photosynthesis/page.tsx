import PhotosynthesisPage from '@/experiments/photosynthesis-page';

export const dynamic = 'force-dynamic';

export default function Route() {
  return <PhotosynthesisPage />;
}

export const metadata = {
  title: "Photosynthesis - Interactive 3D Biology Simulation",
  description: "Enter a chloroplast and follow light reactions and Calvin cycle. Control light intensity and CO2 levels. Free biology virtual lab.",
};
