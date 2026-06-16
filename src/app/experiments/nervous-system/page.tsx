import NervousSystemPage from '@/experiments/nervous-system-page';

export const dynamic = 'force-dynamic';

export default function Route() {
  return <NervousSystemPage />;
}

export const metadata = {
  title: "Neuron & Synapse - Interactive Neuroscience Lab",
  description: "Trace an action potential along a neuron in 3D. Watch neurotransmitters cross the synaptic cleft. Free virtual neuroscience lab.",
};
