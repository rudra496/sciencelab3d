export interface Experiment {
  id: string;
  title: string;
  category: "physics" | "chemistry" | "biology" | "math";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  icon: string;
  color: string;
  topics: string[];
}

export const experiments: Experiment[] = [
  // ========== PHYSICS (10) ==========
  {
    id: "pendulum",
    title: "Simple Pendulum",
    category: "physics",
    difficulty: "Beginner",
    description:
      "Explore simple harmonic motion by controlling pendulum length, mass, and initial angle. Observe how gravity and tension create periodic oscillation.",
    icon: "🔄",
    color: "#4f8fff",
    topics: ["SHM", "Gravity", "Period", "Amplitude"],
  },
  {
    id: "projectile-motion",
    title: "Projectile Motion",
    category: "physics",
    difficulty: "Beginner",
    description:
      "Launch projectiles at different angles and velocities. Visualize parabolic trajectories and understand range, height, and time of flight.",
    icon: "🎯",
    color: "#4f8fff",
    topics: ["Kinematics", "Trajectory", "Range", "Velocity"],
  },
  {
    id: "double-slit",
    title: "Double-Slit Experiment",
    category: "physics",
    difficulty: "Advanced",
    description:
      "Witness wave-particle duality. Fire photons through two slits and observe the interference pattern that proves quantum mechanics.",
    icon: "🌊",
    color: "#4f8fff",
    topics: ["Quantum", "Wave-Particle Duality", "Interference", "Photons"],
  },
  {
    id: "wave-interference",
    title: "Wave Interference",
    category: "physics",
    difficulty: "Intermediate",
    description:
      "Create two wave sources and watch constructive and destructive interference patterns form in real-time 3D space.",
    icon: "〰️",
    color: "#4f8fff",
    topics: ["Waves", "Superposition", "Interference", "Frequency"],
  },
  {
    id: "electromagnetic-field",
    title: "Electromagnetic Field",
    category: "physics",
    difficulty: "Intermediate",
    description:
      "Place charges in 3D space and visualize electric field lines, potential surfaces, and force vectors interactively.",
    icon: "⚡",
    color: "#4f8fff",
    topics: ["Electric Field", "Coulomb's Law", "Potential", "Vectors"],
  },
  {
    id: "spring-mass",
    title: "Spring-Mass System",
    category: "physics",
    difficulty: "Beginner",
    description:
      "Attach masses to springs with adjustable stiffness and damping. Explore Hooke's law, resonance, and energy conservation.",
    icon: "🔔",
    color: "#4f8fff",
    topics: ["Hooke's Law", "Resonance", "Energy", "Damping"],
  },
  {
    id: "gravitational-orbits",
    title: "Gravitational Orbits",
    category: "physics",
    difficulty: "Intermediate",
    description:
      "Simulate planetary orbits by adjusting mass, velocity, and distance. Observe elliptical, circular, and escape trajectories.",
    icon: "🪐",
    color: "#4f8fff",
    topics: ["Gravity", "Orbits", "Kepler's Laws", "Escape Velocity"],
  },
  {
    id: "doppler-effect",
    title: "Doppler Effect",
    category: "physics",
    difficulty: "Intermediate",
    description:
      "Move a sound source and observer in 3D. Watch wavefronts compress and expand as frequency shifts in real-time.",
    icon: "🔊",
    color: "#4f8fff",
    topics: ["Sound", "Frequency Shift", "Wavefronts", "Relativity"],
  },
  {
    id: "refraction-reflection",
    title: "Refraction & Reflection",
    category: "physics",
    difficulty: "Beginner",
    description:
      "Shoot light rays through different media. Control angle of incidence, refractive index, and see Snell's law in action.",
    icon: "💡",
    color: "#4f8fff",
    topics: ["Optics", "Snell's Law", "Total Internal Reflection", "Prism"],
  },
  {
    id: "ohms-law",
    title: "Ohm's Law Circuit",
    category: "physics",
    difficulty: "Beginner",
    description:
      "Build circuits with resistors, batteries, and LEDs. Adjust voltage and resistance to see current flow with animated electrons.",
    icon: "🔋",
    color: "#4f8fff",
    topics: ["Electricity", "Ohm's Law", "Resistance", "Current"],
  },

  // ========== CHEMISTRY (10) ==========
  {
    id: "atomic-structure",
    title: "Atomic Structure",
    category: "chemistry",
    difficulty: "Beginner",
    description:
      "Explore atoms in 3D — add/remove protons, neutrons, and electrons. See how elements change and electron shells fill up.",
    icon: "⚛️",
    color: "#8b5cf6",
    topics: ["Atoms", "Electron Shells", "Protons", "Periodic Table"],
  },
  {
    id: "chemical-bonding",
    title: "Chemical Bonding",
    category: "chemistry",
    difficulty: "Intermediate",
    description:
      "Visualize ionic, covalent, and metallic bonds in 3D. Watch atoms share or transfer electrons to form molecules.",
    icon: "🔗",
    color: "#8b5cf6",
    topics: ["Ionic", "Covalent", "Metallic", "Electron Sharing"],
  },
  {
    id: "electrolysis",
    title: "Electrolysis",
    category: "chemistry",
    difficulty: "Intermediate",
    description:
      "Run electrolysis experiments on water and other solutions. See bubbles form at electrodes and understand redox reactions.",
    icon: "🧪",
    color: "#8b5cf6",
    topics: ["Redox", "Electrodes", "Anode", "Cathode"],
  },
  {
    id: "titration",
    title: "Acid-Base Titration",
    category: "chemistry",
    difficulty: "Intermediate",
    description:
      "Perform virtual titration. Control the burette drop-by-drop and watch the pH indicator change color at the equivalence point.",
    icon: "💧",
    color: "#8b5cf6",
    topics: ["pH", "Acid", "Base", "Equivalence Point"],
  },
  {
    id: "gas-laws",
    title: "Gas Laws (PV=nRT)",
    category: "chemistry",
    difficulty: "Beginner",
    description:
      "Compress and heat gas molecules in a 3D container. See Boyle's, Charles's, and Gay-Lussac's laws come alive with bouncing particles.",
    icon: "🌡️",
    color: "#8b5cf6",
    topics: ["Boyle's Law", "Charles's Law", "Ideal Gas", "Pressure"],
  },
  {
    id: "acid-base-reactions",
    title: "Acid-Base Reactions",
    category: "chemistry",
    difficulty: "Beginner",
    description:
      "Mix acids and bases and watch neutralization occur. See pH changes, salt formation, and energy release in 3D.",
    icon: "⚗️",
    color: "#8b5cf6",
    topics: ["Neutralization", "pH Scale", "Salts", "Exothermic"],
  },
  {
    id: "crystal-lattice",
    title: "Crystal Lattice Structures",
    category: "chemistry",
    difficulty: "Intermediate",
    description:
      "Explore 3D crystal structures — FCC, BCC, HCP, diamond cubic. Rotate, zoom, and understand unit cells and packing efficiency.",
    icon: "💎",
    color: "#8b5cf6",
    topics: ["Crystals", "FCC", "BCC", "Unit Cell"],
  },
  {
    id: "diffusion",
    title: "Molecular Diffusion",
    category: "chemistry",
    difficulty: "Beginner",
    description:
      "Watch particles diffuse through a membrane or between two gases. Control temperature and concentration gradients.",
    icon: "🌫️",
    color: "#8b5cf6",
    topics: ["Diffusion", "Osmosis", "Concentration", "Brownian Motion"],
  },
  {
    id: "thermochemistry",
    title: "Exothermic & Endothermic",
    category: "chemistry",
    difficulty: "Intermediate",
    description:
      "Visualize energy changes during chemical reactions. See bonds break and form with energy diagrams and temperature effects.",
    icon: "🔥",
    color: "#8b5cf6",
    topics: ["Enthalpy", "Activation Energy", "Bonds", "Energy Diagrams"],
  },
  {
    id: "periodic-trends",
    title: "Periodic Table Trends",
    category: "chemistry",
    difficulty: "Beginner",
    description:
      "Interactive 3D periodic table. Explore atomic radius, electronegativity, ionization energy trends with animated visualizations.",
    icon: "📋",
    color: "#8b5cf6",
    topics: ["Atomic Radius", "Electronegativity", "Ionization", "Trends"],
  },

  // ========== BIOLOGY (10) ==========
  {
    id: "cell-structure",
    title: "Animal Cell Structure",
    category: "biology",
    difficulty: "Beginner",
    description:
      "Explore a detailed 3D animal cell. Click on organelles to learn about nucleus, mitochondria, ER, Golgi, and more.",
    icon: "🔬",
    color: "#06d6a0",
    topics: ["Organelles", "Nucleus", "Mitochondria", "Membrane"],
  },
  {
    id: "dna-replication",
    title: "DNA Replication",
    category: "biology",
    difficulty: "Advanced",
    description:
      "Watch the double helix unzip and replicate step-by-step. See helicase, polymerase, and primase in action.",
    icon: "🧬",
    color: "#06d6a0",
    topics: ["DNA", "Helicase", "Polymerase", "Replication Fork"],
  },
  {
    id: "protein-synthesis",
    title: "Protein Synthesis",
    category: "biology",
    difficulty: "Advanced",
    description:
      "Follow transcription and translation in 3D. Watch mRNA leave the nucleus and ribosomes build proteins codon by codon.",
    icon: "⚙️",
    color: "#06d6a0",
    topics: ["Transcription", "Translation", "mRNA", "Ribosomes"],
  },
  {
    id: "photosynthesis",
    title: "Photosynthesis",
    category: "biology",
    difficulty: "Intermediate",
    description:
      "Enter a chloroplast and follow light reactions and Calvin cycle. Control light intensity and CO2 levels.",
    icon: "🌿",
    color: "#06d6a0",
    topics: ["Chloroplast", "Light Reactions", "Calvin Cycle", "Glucose"],
  },
  {
    id: "cellular-respiration",
    title: "Cellular Respiration",
    category: "biology",
    difficulty: "Intermediate",
    description:
      "Trace glucose through glycolysis, Krebs cycle, and electron transport chain. See ATP production in 3D mitochondria.",
    icon: "⚡",
    color: "#06d6a0",
    topics: ["Glycolysis", "Krebs Cycle", "ATP", "Mitochondria"],
  },
  {
    id: "mitosis-meiosis",
    title: "Mitosis & Meiosis",
    category: "biology",
    difficulty: "Intermediate",
    description:
      "Watch cell division in 3D. Step through prophase, metaphase, anaphase, telophase. Compare mitosis vs meiosis side-by-side.",
    icon: "🫧",
    color: "#06d6a0",
    topics: ["Mitosis", "Meiosis", "Chromosomes", "Cell Division"],
  },
  {
    id: "natural-selection",
    title: "Natural Selection Simulator",
    category: "biology",
    difficulty: "Intermediate",
    description:
      "Simulate evolution! Control environment factors and watch populations adapt over generations with trait variations.",
    icon: "🦎",
    color: "#06d6a0",
    topics: ["Evolution", "Adaptation", "Genetics", "Fitness"],
  },
  {
    id: "nervous-system",
    title: "Neuron & Synapse",
    category: "biology",
    difficulty: "Intermediate",
    description:
      "Trace an action potential along a neuron in 3D. Watch neurotransmitters cross the synaptic cleft.",
    icon: "🧠",
    color: "#06d6a0",
    topics: ["Neurons", "Action Potential", "Synapse", "Neurotransmitters"],
  },
  {
    id: "ecosystem",
    title: "Ecosystem Food Web",
    category: "biology",
    difficulty: "Beginner",
    description:
      "Build and explore food webs in 3D. Add/remove species and watch population dynamics change in real-time.",
    icon: "🌿",
    color: "#06d6a0",
    topics: ["Food Web", "Trophic Levels", "Population", "Biodiversity"],
  },
  {
    id: "immune-response",
    title: "Immune System Response",
    category: "biology",
    difficulty: "Advanced",
    description:
      "Watch the immune system fight a virus! See macrophages, T-cells, and antibodies in a 3D blood vessel environment.",
    icon: "🛡️",
    color: "#06d6a0",
    topics: ["Antibodies", "T-Cells", "Macrophages", "Antigens"],
  },

  // ========== MATHEMATICS (10) ==========
  {
    id: "fourier-transform",
    title: "Fourier Transform Visualizer",
    category: "math",
    difficulty: "Advanced",
    description:
      "Build any waveform by adding sine waves. Watch the frequency spectrum update in real-time as you add or remove harmonics.",
    icon: "📊",
    color: "#ff6b35",
    topics: ["Frequency", "Waveform", "Harmonics", "Signal Processing"],
  },
  {
    id: "fibonacci-spiral",
    title: "Fibonacci & Golden Spiral",
    category: "math",
    difficulty: "Beginner",
    description:
      "Watch the Fibonacci sequence build the golden spiral in 3D. Explore its appearance in nature, art, and architecture.",
    icon: "🐌",
    color: "#ff6b35",
    topics: ["Fibonacci", "Golden Ratio", "Spiral", "Phi"],
  },
  {
    id: "3d-geometry",
    title: "3D Geometry Explorer",
    category: "math",
    difficulty: "Beginner",
    description:
      "Interact with Platonic solids and Archimedean solids in 3D. Explore faces, edges, vertices, and Euler's formula.",
    icon: "📐",
    color: "#ff6b35",
    topics: ["Platonic Solids", "Euler's Formula", "Symmetry", "Polyhedra"],
  },
  {
    id: "calculus-visualizer",
    title: "Calculus Visualizer",
    category: "math",
    difficulty: "Intermediate",
    description:
      "Visualize derivatives and integrals in 3D. Watch tangent lines, area under curves, and Riemann sums animate.",
    icon: "📈",
    color: "#ff6b35",
    topics: ["Derivatives", "Integrals", "Limits", "Riemann Sums"],
  },
  {
    id: "mandelbrot",
    title: "Mandelbrot Fractal",
    category: "math",
    difficulty: "Intermediate",
    description:
      "Dive into the infinite Mandelbrot set in 3D. Zoom into regions and watch fractal detail emerge at every scale.",
    icon: "🌀",
    color: "#ff6b35",
    topics: ["Fractals", "Complex Numbers", "Iteration", "Infinity"],
  },
  {
    id: "probability-distributions",
    title: "Probability Distributions",
    category: "math",
    difficulty: "Intermediate",
    description:
      "Generate random data and watch distributions form. Compare Normal, Binomial, Poisson, and Uniform distributions.",
    icon: "🎰",
    color: "#ff6b35",
    topics: ["Normal", "Binomial", "Mean", "Standard Deviation"],
  },
  {
    id: "linear-algebra",
    title: "Linear Algebra Viz",
    category: "math",
    difficulty: "Intermediate",
    description:
      "Visualize vectors, matrices, and transformations in 3D. Apply rotations, scaling, and shearing to see linear maps in action.",
    icon: "🔢",
    color: "#ff6b35",
    topics: ["Vectors", "Matrices", "Eigenvalues", "Transformations"],
  },
  {
    id: "trigonometry",
    title: "Trigonometry Explorer",
    category: "math",
    difficulty: "Beginner",
    description:
      "Explore sine, cosine, and tangent on a 3D unit circle. Adjust angles and see how all trig functions relate.",
    icon: "📏",
    color: "#ff6b35",
    topics: ["Sin", "Cos", "Tan", "Unit Circle"],
  },
  {
    id: "complex-numbers",
    title: "Complex Number Plane",
    category: "math",
    difficulty: "Intermediate",
    description:
      "Visualize complex numbers on the Argand plane. Perform arithmetic operations and see geometric interpretations.",
    icon: "♾️",
    color: "#ff6b35",
    topics: ["Complex Numbers", "Argand Plane", "Modulus", "Argument"],
  },
  {
    id: "topology-surfaces",
    title: "Topology & Surfaces",
    category: "math",
    difficulty: "Advanced",
    description:
      "Explore mathematical surfaces — Möbius strip, Klein bottle, torus, and more in interactive 3D.",
    icon: "🍩",
    color: "#ff6b35",
    topics: ["Topology", "Möbius Strip", "Klein Bottle", "Manifolds"],
  },
];

export const categories = [
  {
    id: "physics" as const,
    name: "Physics",
    icon: "⚛️",
    color: "#4f8fff",
    description: "Forces, motion, waves, and energy",
  },
  {
    id: "chemistry" as const,
    name: "Chemistry",
    icon: "🧪",
    color: "#8b5cf6",
    description: "Atoms, molecules, and reactions",
  },
  {
    id: "biology" as const,
    name: "Biology",
    icon: "🧬",
    color: "#06d6a0",
    description: "Life, cells, and ecosystems",
  },
  {
    id: "math" as const,
    name: "Mathematics",
    icon: "📐",
    color: "#ff6b35",
    description: "Numbers, shapes, and patterns",
  },
];
