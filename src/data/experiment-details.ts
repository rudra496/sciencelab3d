export interface ExperimentDetail {
  formulas?: Array<{ expression: string; description: string }>;
  concepts?: string[];
  applications?: string[];
}

export const experimentDetails: Record<string, ExperimentDetail> = {
  // PHYSICS
  pendulum: {
    formulas: [
      { expression: "T = 2π√(L/g)", description: "Period of a simple pendulum" },
      { expression: "f = 1/T = 1/(2π)√(g/L)", description: "Frequency of oscillation" },
      { expression: "θ(t) = θ₀cos(ωt)", description: "Angular displacement over time" },
    ],
    concepts: [
      "Simple Harmonic Motion (SHM) occurs when restoring force is proportional to displacement",
      "The period depends only on length and gravity, not mass or amplitude (for small angles)",
      "At maximum displacement, potential energy is maximum and kinetic energy is zero",
      "At equilibrium position, kinetic energy is maximum and potential energy is minimum",
      "Damping causes amplitude to decrease over time due to friction and air resistance",
    ],
    applications: [
      "Grandfather clocks use pendulums to keep accurate time",
      "Pendulums in skyscrapers reduce sway during wind and earthquakes",
      "Metronomes help musicians maintain consistent tempo",
      "Geologists use pendulums to measure variations in Earth's gravitational field",
      "Pendulum rides at amusement parks demonstrate conservation of energy",
    ],
  },

  "projectile-motion": {
    formulas: [
      { expression: "R = v₀²sin(2θ)/g", description: "Horizontal range (maximum at 45°)" },
      { expression: "H = v₀²sin²θ/(2g)", description: "Maximum height reached" },
      { expression: "T = 2v₀sinθ/g", description: "Total time of flight" },
      { expression: "y = xtanθ - gx²/(2v₀²cos²θ)", description: "Trajectory equation (parabola)" },
    ],
    concepts: [
      "Horizontal and vertical motions are independent of each other",
      "Horizontal velocity remains constant (ignoring air resistance)",
      "Vertical motion is affected by gravity, creating the parabolic path",
      "Maximum range occurs at 45° launch angle in vacuum",
      "Complementary angles (like 30° and 60°) give the same range",
      "Air resistance significantly affects real projectiles, reducing range and distorting the parabola",
    ],
    applications: [
      "Sports: Basketball shots, javelin throws, golf drives",
      "Military: Artillery and missile trajectory calculations",
      "Space: Satellite launch trajectories and orbital insertions",
      "Engineering: Water fountain designs and fountain shows",
      "Entertainment: Firework displays and stunt choreography",
    ],
  },

  "double-slit": {
    formulas: [
      { expression: "λ = dx/L", description: "Wavelength from interference pattern" },
      { expression: "Δx = λL/d", description: "Fringe spacing" },
      { expression: "I = I₀cos²(πd sinθ/λ)", description: "Intensity distribution" },
      { expression: "p = h/λ", description: "De Broglie wavelength (momentum-wavelength relation)" },
    ],
    concepts: [
      "Wave-particle duality: Light and matter exhibit both wave and particle properties",
      "Interference pattern proves wave nature, even for single particles at a time",
      "Each particle goes through both slits simultaneously as a probability wave",
      "Observing which slit the particle goes through destroys the interference pattern",
      "This experiment demonstrates quantum superposition and measurement problem",
      "The pattern builds up gradually even when particles are sent one at a time",
    ],
    applications: [
      "Electron microscopy uses wave nature of electrons for high-resolution imaging",
      "X-ray crystallography reveals atomic structures using diffraction patterns",
      "Quantum computing principles rely on superposition demonstrated by this experiment",
      "Holography creates 3D images using interference patterns",
      "Optical coatings use interference to reduce reflections or enhance transmission",
    ],
  },

  "wave-interference": {
    formulas: [
      { expression: "y = y₁ + y₂", description: "Principle of superposition" },
      { expression: "f_beat = |f₁ - f₂|", description: "Beat frequency for slightly different frequencies" },
      { expression: "A_constructive = A₁ + A₂", description: "Constructive interference amplitude" },
      { expression: "A_destructive = |A₁ - A₂|", description: "Destructive interference amplitude" },
    ],
    concepts: [
      "Constructive interference occurs when waves are in phase (crests align with crests)",
      "Destructive interference occurs when waves are out of phase (crest meets trough)",
      "Standing waves form from interference of waves traveling in opposite directions",
      "Nodes are points of zero amplitude, antinodes are points of maximum amplitude",
      "Phase difference determines whether interference is constructive or destructive",
      "Interference is a fundamental property of all waves, not just light and sound",
    ],
    applications: [
      "Noise-canceling headphones use destructive interference to reduce unwanted sounds",
      "Musical instruments use standing waves to produce specific pitches",
      "Radio telescopes use interference to improve resolution through aperture synthesis",
      "Optical interferometers measure tiny distances and detect gravitational waves",
      "Acoustic design in concert halls uses interference principles for optimal sound",
    ],
  },

  "electromagnetic-field": {
    formulas: [
      { expression: "F = kq₁q₂/r²", description: "Coulomb's Law (electric force)" },
      { expression: "E = F/q = kQ/r²", description: "Electric field from point charge" },
      { expression: "V = kQ/r", description: "Electric potential (voltage)" },
      { expression: "F = q(v × B)", description: "Lorentz force law" },
    ],
    concepts: [
      "Electric fields exist around all charged particles and exert forces on other charges",
      "Field lines point away from positive charges and toward negative charges",
      "Field strength decreases with the square of distance from the source charge",
      "Electric potential is the potential energy per unit charge at a point in the field",
      "Equipotential lines are perpendicular to electric field lines",
      "Multiple charges create complex field patterns through vector superposition",
    ],
    applications: [
      "Capacitors store energy in electric fields for electronic circuits",
      "Van de Graaff generators use electric fields for particle acceleration",
      "Electrostatic precipitators remove particles from industrial exhaust",
      "Inkjet printers use electric fields to control droplet formation",
      "Photocopiers and laser printers use electrostatic charges for image transfer",
    ],
  },

  "spring-mass": {
    formulas: [
      { expression: "F = -kx", description: "Hooke's Law (restoring force)" },
      { expression: "T = 2π√(m/k)", description: "Period of oscillation" },
      { expression: "E_total = ½kA²", description: "Total mechanical energy" },
      { expression: "x(t) = Acos(ωt + φ)", description: "Position as function of time" },
    ],
    concepts: [
      "Hooke's Law states that restoring force is proportional to displacement",
      "Spring constant k measures stiffness - higher k means stiffer spring",
      "The system exhibits simple harmonic motion when displaced from equilibrium",
      "Energy continuously converts between kinetic and potential forms",
      "At maximum displacement, all energy is potential; at equilibrium, all is kinetic",
      "Resonance occurs when driving frequency matches natural frequency",
      "Damping gradually reduces amplitude due to energy loss to friction",
    ],
    applications: [
      "Vehicle suspension systems use springs to absorb road vibrations",
      "Mattress springs provide support and comfort through spring mechanics",
      "Watch balance springs regulate timekeeping through precise oscillation",
      "Buildings use spring-based dampers to protect against earthquakes",
      "Trampolines and pogo sticks demonstrate elastic potential energy conversion",
    ],
  },

  "gravitational-orbits": {
    formulas: [
      { expression: "F = GMm/r²", description: "Newton's Law of Universal Gravitation" },
      { expression: "v = √(GM/r)", description: "Orbital velocity (circular)" },
      { expression: "T² = (4π²/GM)r³", description: "Kepler's Third Law" },
      { expression: "v_escape = √(2GM/r)", description: "Escape velocity" },
    ],
    concepts: [
      "Gravity provides the centripetal force keeping objects in orbit",
      "Circular orbits have constant speed; elliptical orbits vary in speed",
      "Objects move faster at perihelion (closest) and slower at aphelion (farthest)",
      "Kepler's laws describe planetary motion: elliptical orbits, equal areas in equal times",
      "Escape velocity is the minimum speed needed to break free from gravitational pull",
      "Orbital mechanics are crucial for space missions and satellite placement",
    ],
    applications: [
      "Satellite communications require precise orbital calculations",
      "GPS satellites use specific orbits for global positioning accuracy",
      "Space missions use gravitational assists (slingshot maneuvers) to gain speed",
      "International Space Station maintains low Earth orbit for continuous human presence",
      "Weather satellites use geostationary orbits to monitor the same region",
    ],
  },

  "doppler-effect": {
    formulas: [
      { expression: "f' = f(v ± v_o)/(v ∓ v_s)", description: "Observed frequency with moving source/observer" },
      { expression: "Δf/f ≈ v/c", description: "Doppler shift for low speeds" },
      { expression: "λ' = λ(v ∓ v_s)/v", description: "Observed wavelength change" },
    ],
    concepts: [
      "Wave frequency increases when source approaches observer (blue shift)",
      "Wave frequency decreases when source recedes from observer (red shift)",
      "The effect occurs for all wave types: sound, light, water waves",
      "For sound, we hear pitch changes; for light, we see color shifts",
      "Doppler effect is used to measure velocity in many applications",
      "The formula has different forms for source moving vs observer moving",
    ],
    applications: [
      "Police radar guns measure vehicle speed using Doppler effect",
      "Weather radar detects rain intensity and wind velocity",
      "Medical ultrasound uses Doppler to measure blood flow velocity",
      "Astronomers measure redshift to determine galaxy distances and expansion of universe",
      "BAT sensors use Doppler to detect motion in security systems",
    ],
  },

  "refraction-reflection": {
    formulas: [
      { expression: "n₁sinθ₁ = n₂sinθ₂", description: "Snell's Law" },
      { expression: "n = c/v", description: "Refractive index definition" },
      { expression: "θ_c = sin⁻¹(n₂/n₁)", description: "Critical angle for total internal reflection" },
      { expression: "R = (n₁-n₂)²/(n₁+n₂)²", description: "Reflectance (Fresnel equation at normal incidence)" },
    ],
    concepts: [
      "Refraction is bending of light when passing between media of different densities",
      "Light bends toward the normal when entering a denser medium (higher n)",
      "Total internal reflection occurs when light travels from dense to less dense at steep angles",
      "Reflection angle equals incidence angle (Law of Reflection)",
      "The index of refraction measures how much light slows down in a material",
      "Dispersion occurs because refractive index varies with wavelength (rainbows)",
    ],
    applications: [
      "Fiber optic cables use total internal reflection for high-speed data transmission",
      "Lenses focus light in cameras, glasses, microscopes, and telescopes",
      "Prisms separate white light into rainbow colors through dispersion",
      "Mirrors use reflection for imaging and optical instruments",
      "Diamond brilliance comes from careful cutting to maximize total internal reflection",
    ],
  },

  "ohms-law": {
    formulas: [
      { expression: "V = IR", description: "Ohm's Law (voltage = current × resistance)" },
      { expression: "P = VI = I²R = V²/R", description: "Electrical power" },
      { expression: "R = ρL/A", description: "Resistance from resistivity, length, and area" },
      { expression: "E = Pt = VIt", description: "Electrical energy consumed" },
    ],
    concepts: [
      "Current is the flow of electric charge, measured in Amperes",
      "Voltage is electrical potential difference, the 'push' that drives current",
      "Resistance opposes current flow, measured in Ohms",
      "Ohm's Law states that current is directly proportional to voltage",
      "In series circuits, current is constant, voltages add",
      "In parallel circuits, voltage is constant, currents add",
      "Power is the rate of energy transfer or consumption",
    ],
    applications: [
      "All electronic devices rely on Ohm's Law for proper operation",
      "Electric heaters use resistance to convert electrical energy to heat",
      "LEDs need appropriate current-limiting resistors to prevent damage",
      "Voltage dividers create reference voltages in circuits",
      "Multimeters measure voltage, current, and resistance for troubleshooting",
    ],
  },

  // CHEMISTRY
  "atomic-structure": {
    formulas: [
      { expression: "E = -13.6eV/n²", description: "Hydrogen energy levels" },
      { expression: "A = Z + N", description: "Mass number (protons + neutrons)" },
      { expression: "E = hf", description: "Energy of emitted/absorbed photon" },
      { expression: "2n²", description: "Maximum electrons in shell n" },
    ],
    concepts: [
      "Atoms consist of protons, neutrons in the nucleus, and electrons in shells",
      "Proton number defines the element; neutrons affect isotopes and stability",
      "Electron configuration determines chemical properties and bonding behavior",
      "Electrons occupy discrete energy levels (shells) with specific capacities",
      "Electrons transition between levels by absorbing or emitting photons",
      "Valence electrons (outermost shell) participate in chemical bonding",
      "Ionization occurs when atoms gain or lose electrons to achieve stable configuration",
    ],
    applications: [
      "Periodic table organizes elements by atomic number and properties",
      "Nuclear power uses energy from splitting large atoms (fission)",
      "Carbon dating uses radioactive decay of C-14 to determine age of organic materials",
      "Medical imaging uses radioactive isotopes to diagnose and treat diseases",
      "Atomic clocks use electron transitions for ultra-precise timekeeping",
    ],
  },

  "chemical-bonding": {
    formulas: [
      { expression: "E = kQ₁Q₂/r", description: "Ionic bond energy" },
      { expression: "EN_diff", description: "Electronegativity difference predicts bond type" },
    ],
    concepts: [
      "Ionic bonds form when electrons transfer from metal to nonmetal atoms",
      "Covalent bonds form when atoms share electron pairs",
      "Metallic bonds involve delocalized electrons in a metal lattice",
      "Bond length affects bond strength: shorter bonds are generally stronger",
      "Bond polarity occurs when electrons are shared unequally due to electronegativity differences",
      "Multiple bonds (double, triple) are stronger and shorter than single bonds",
      "Hybridization explains molecular geometries (sp³, sp², sp)",
    ],
    applications: [
      "Table salt (NaCl) is held together by ionic bonds",
      "Diamond and graphite are both carbon but have different bonding arrangements",
      "Protein structure is determined by peptide bonds and intermolecular forces",
      "DNA's double helix is held by hydrogen bonds between complementary bases",
      "Metal alloys combine different metals to create stronger materials",
    ],
  },

  "electrolysis": {
    formulas: [
      { expression: "Q = It", description: "Charge from current and time" },
      { expression: "m = ZQ = ZIt", description: "Mass deposited (Faraday's First Law)" },
      { expression: "1 F = 96,485 C/mol", description: "Faraday constant" },
      { expression: "E° = E°(cathode) - E°(anode)", description: "Cell potential" },
    ],
    concepts: [
      "Electrolysis uses electrical energy to drive non-spontaneous chemical reactions",
      "Oxidation occurs at anode (loss of electrons), reduction at cathode (gain)",
      "Cations are attracted to cathode, anions to anode",
      "Faraday's laws relate mass of substance deposited to charge passed",
      "Electrolytes conduct electricity through movement of ions",
      "Water electrolysis produces hydrogen and oxygen gases",
      "Electroplating deposits a thin metal coating using electrolysis",
    ],
    applications: [
      "Electroplating coats objects with protective or decorative metal layers",
      "Water treatment removes heavy metals through electrolysis",
      "Hydrogen production for fuel cells and clean energy",
      "Aluminum extraction from bauxite ore uses electrolysis (Hall-Héroult process)",
      "Refining of metals like copper and gold removes impurities",
    ],
  },

  "titration": {
    formulas: [
      { expression: "M₁V₁ = M₂V₂", description: "For 1:1 stoichiometry reactions" },
      { expression: "pH = -log[H⁺]", description: "pH calculation" },
      { expression: "n = M × V", description: "Moles from molarity and volume" },
    ],
    concepts: [
      "Titration determines concentration of unknown solution using known solution",
      "Indicator changes color at endpoint, marking when reaction is complete",
      "Equivalence point is when moles of titrant equal moles of analyte",
      "Acid-base titrations neutralize acid with base (or vice versa)",
      "Common indicators: phenolphthalein (colorless to pink), bromothymol blue",
      "Titration curve plots pH vs volume, revealing buffer regions and pKa",
      "Strong acid-strong base titration has equivalence at pH 7",
    ],
    applications: [
      "Clinical labs use titration to measure blood composition",
      "Food industry tests acidity of products like wine, juice, dairy",
      "Water treatment monitors and adjusts pH levels",
      "Pharmaceutical quality control verifies drug concentrations",
      "Agricultural testing determines soil nutrient content",
    ],
  },

  "gas-laws": {
    formulas: [
      { expression: "PV = nRT", description: "Ideal Gas Law" },
      { expression: "P₁V₁ = P₂V₂", description: "Boyle's Law (constant T)" },
      { expression: "V₁/T₁ = V₂/T₂", description: "Charles's Law (constant P)" },
      { expression: "P₁/T₁ = P₂/T₂", description: "Gay-Lussac's Law (constant V)" },
    ],
    concepts: [
      "Boyle's Law: Pressure and volume are inversely related at constant temperature",
      "Charles's Law: Volume is directly proportional to temperature at constant pressure",
      "Gay-Lussac's Law: Pressure is directly proportional to temperature at constant volume",
      "Ideal gas law combines all relationships: PV = nRT",
      "Real gases deviate from ideal behavior at high pressure and low temperature",
      "Kinetic molecular theory explains gas behavior through particle motion",
      "Average kinetic energy is proportional to absolute temperature",
    ],
    applications: [
      "Car engines use gas compression and expansion for power",
      "Hot air balloons rise because heated air is less dense (Charles's Law)",
      "Pressure cookers cook food faster by increasing boiling point",
      "Scuba divers must consider gas pressure changes with depth (Boyle's Law)",
      "Weather balloons expand as atmospheric pressure decreases with altitude",
    ],
  },

  "acid-base-reactions": {
    formulas: [
      { expression: "pH = -log[H⁺]", description: "pH calculation" },
      { expression: "pOH = -log[OH⁻]", description: "pOH calculation" },
      { expression: "pH + pOH = 14", description: "At 25°C (aqueous)" },
      { expression: "Ka = [H⁺][A⁻]/[HA]", description: "Acid dissociation constant" },
    ],
    concepts: [
      "Acids donate H⁺ ions (Brønsted-Lowry) or accept electron pairs (Lewis)",
      "Bases accept H⁺ ions (Brønsted-Lowry) or donate electron pairs (Lewis)",
      "Strong acids/bases completely dissociate; weak ones only partially",
      "Neutralization reaction: acid + base → salt + water",
      "pH scale: 0-7 acidic, 7 neutral, 7-14 basic (logarithmic scale)",
      "Buffers resist pH changes by combining weak acid with its conjugate base",
      "Conjugate acid-base pairs differ by one proton (H⁺)",
    ],
    applications: [
      "Stomach acid (HCl) digests food; antacids neutralize excess acid",
      "Baking soda neutralizes acidic odors and acts as a cleaning agent",
      "Soil pH affects plant growth; farmers add lime to reduce acidity",
      "Blood is buffered to maintain pH around 7.4 for proper body function",
      "Pool maintenance requires pH control for safety and comfort",
    ],
  },

  "crystal-lattice": {
    formulas: [
      { expression: "a = 2√2r", description: "FCC edge length in terms of atomic radius" },
      { expression: "a = 4r/√3", description: "BCC edge length in terms of atomic radius" },
      { expression: "APF = (atoms × volume of atom)/(volume of unit cell)", description: "Atomic packing factor" },
    ],
    concepts: [
      "Crystals have highly ordered, repeating 3D structures of atoms/ions/molecules",
      "Unit cell is the smallest repeating unit showing full symmetry",
      "FCC (face-centered cubic) has atoms at corners and faces (high packing)",
      "BCC (body-centered cubic) has atoms at corners and body center",
      "HCP (hexagonal close-packed) is another efficient packing arrangement",
      "Coordination number is the number of nearest neighbors",
      "Packing efficiency: FCC/HCP ≈ 74%, BCC ≈ 68%, simple cubic ≈ 52%",
    ],
    applications: [
      "Metals like aluminum, copper, gold have FCC structure (ductile)",
      "Iron at room temperature has BCC structure; at high temp, FCC",
      "Diamond cubic structure gives diamond its exceptional hardness",
      "Silicon's diamond-like structure enables semiconductor properties",
      "Salt (NaCl) forms cubic crystals through ionic bonding",
      "Snow crystals form hexagonal patterns due to water's molecular structure",
    ],
  },

  "diffusion": {
    formulas: [
      { expression: "J = -D(dC/dx)", description: "Fick's First Law" },
      { expression: "∂C/∂t = D(∂²C/∂x²)", description: "Fick's Second Law" },
      { expression: "r = √(6Dt)", description: "Mean displacement in 3D" },
    ],
    concepts: [
      "Diffusion is net movement of particles from high to low concentration",
      "Caused by random thermal motion (Brownian motion) of particles",
      "Rate of diffusion increases with temperature and decreases with particle size",
      "Graham's Law: lighter gases diffuse faster than heavier gases",
      "Osmosis is diffusion of solvent across a semipermeable membrane",
      "Concentration gradient is the driving force for diffusion",
      "Equilibrium is reached when concentration is uniform throughout",
    ],
    applications: [
      "Oxygen and carbon dioxide exchange in lungs and tissues",
      "Perfume fragrance spreads through a room by diffusion",
      "Cells use osmosis to regulate water balance",
      "Drug delivery systems rely on diffusion through membranes",
      "Food preservation uses salt or sugar to create hypertonic environment",
      "Gas masks use diffusion to filter contaminants from air",
    ],
  },

  "thermochemistry": {
    formulas: [
      { expression: "q = mcΔT", description: "Heat transfer with temperature change" },
      { expression: "ΔH = H(products) - H(reactants)", description: "Enthalpy change" },
      { expression: "ΔH_rxn = ΣΔH_f(products) - ΣΔH_f(reactants)", description: "Hess's Law" },
      { expression: "E_a", description: "Activation energy (energy barrier)" },
    ],
    concepts: [
      "Thermochemistry studies energy changes during chemical reactions",
      "Exothermic reactions release heat (negative ΔH), feel hot",
      "Endothermic reactions absorb heat (positive ΔH), feel cold",
      "Enthalpy (H) is total heat content of a system at constant pressure",
      "Activation energy is minimum energy needed to start a reaction",
      "Catalysts lower activation energy without being consumed",
      "Energy diagrams show reaction progress vs potential energy",
      "Bond breaking requires energy; bond formation releases energy",
    ],
    applications: [
      "Hand warmers use exothermic oxidation of iron",
      "Cold packs use endothermic dissolution of ammonium nitrate",
      "Combustion engines burn fuel to do mechanical work",
      "Metabolism in living organisms is a series of exothermic reactions",
      "Cooking food involves endothermic reactions to break down molecules",
    ],
  },

  "periodic-trends": {
    formulas: [
      { expression: "Z_eff = Z - S", description: "Effective nuclear charge" },
      { expression: "IE ∝ Z_eff²/n²", description: "Ionization energy trend" },
    ],
    concepts: [
      "Atomic radius increases down a group (more shells) and decreases across period (more protons)",
      "Ionization energy decreases down group, increases across period",
      "Electronegativity decreases down group, increases across period",
      "Metallic character increases down group, decreases across period",
      "Effective nuclear charge explains many trends (shielding effect)",
      "Elements in same group have similar properties (same valence configuration)",
      "Trends help predict chemical behavior and reactivity",
    ],
    applications: [
      "Predicting reactivity of elements based on position",
      "Choosing appropriate materials for specific applications",
      "Understanding semiconductor properties (metalloids)",
      "Explaining why fluorine is most reactive nonmetal, francium most reactive metal",
      "Designing new materials with desired properties",
    ],
  },

  // BIOLOGY
  "cell-structure": {
    formulas: [],
    concepts: [
      "Cell membrane regulates what enters and exits (phospholipid bilayer)",
      "Nucleus contains DNA and controls cell activities",
      "Mitochondria produce ATP through cellular respiration (powerhouse)",
      "Rough ER has ribosomes and makes proteins; smooth ER makes lipids",
      "Golgi apparatus modifies, sorts, and packages proteins for transport",
      "Lysosomes digest waste and cellular debris with enzymes",
      "Ribosomes synthesize proteins using mRNA instructions",
      "Cytoskeleton provides structure and enables movement",
      "Vacuoles store water, nutrients, and waste (large in plant cells)",
    ],
    applications: [
      "Understanding diseases caused by organelle dysfunction (e.g., mitochondrial diseases)",
      "Drug targeting to specific organelles for therapeutic effect",
      "Stem cell research and regenerative medicine",
      "Cancer research focuses on uncontrolled cell division",
      "Antibiotics target bacterial cell structures different from human cells",
    ],
  },

  "dna-replication": {
    formulas: [],
    concepts: [
      "DNA is double helix: two strands of nucleotides with complementary base pairing",
      "Base pairing rules: A-T (2 H-bonds), G-C (3 H-bonds)",
      "Replication is semi-conservative: each new DNA has one old, one new strand",
      "Helicase unwinds and separates DNA strands at replication fork",
      "DNA polymerase adds new nucleotides in 5'→3' direction only",
      "Leading strand synthesized continuously; lagging strand in Okazaki fragments",
      "Primase creates RNA primer to start replication",
      "Ligase joins Okazaki fragments into continuous strand",
      "Proofreading by DNA polymerase ensures accuracy",
    ],
    applications: [
      "PCR (Polymerase Chain Reaction) amplifies DNA for forensics and diagnostics",
      "DNA sequencing reveals genetic information for research and medicine",
      "Genetic testing identifies inherited diseases and predispositions",
      "Gene therapy aims to correct defective genes",
      "Understanding mutations leads to treatments for genetic disorders",
    ],
  },

  "protein-synthesis": {
    formulas: [],
    concepts: [
      "Two stages: Transcription (DNA→mRNA in nucleus) and Translation (mRNA→protein at ribosome)",
      "Transcription: RNA polymerase builds mRNA complementary to DNA template strand",
      "mRNA processing: 5' cap, poly-A tail, intron removal (splicing)",
      "Translation: Ribosomes read mRNA codons to assemble amino acids into polypeptide",
      "Genetic code: 64 codons specify 20 amino acids (redundant, nearly universal)",
      "tRNA molecules carry specific amino acids and match mRNA codons via anticodon",
      "Start codon (AUG) begins translation; stop codons (UAA, UAG, UGA) end it",
      "Post-translational modifications: folding, cleavage, chemical groups added",
    ],
    applications: [
      "Antibiotics inhibit bacterial protein synthesis without affecting human cells",
      "Insulin production by genetically modified bacteria",
      "Enzyme replacement therapy for genetic disorders",
      "Vaccines using mRNA technology (COVID-19 vaccines)",
      "Understanding genetic basis of diseases for drug development",
    ],
  },

  "photosynthesis": {
    formulas: [
      { expression: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂", description: "Overall photosynthesis equation" },
    ],
    concepts: [
      "Occurs in chloroplasts, specifically chlorophyll-containing thylakoid membranes",
      "Light reactions: Split water, produce ATP and NADPH, release O₂ as byproduct",
      "Calvin cycle (dark reactions): Use ATP and NADPH to fix CO₂ into glucose",
      "Light absorbed by chlorophyll drives electron transport chain",
      "Photolysis: Water molecules split to replace electrons in chlorophyll",
      "Carbon fixation: CO₂ incorporated into organic molecules by Rubisco enzyme",
      "Photosystems I and II work together to create proton gradient for ATP synthesis",
      "Plants are autotrophs: produce their own food using sunlight",
    ],
    applications: [
      "Agriculture: Maximizing crop yields through understanding photosynthesis",
      "Biofuel production from plant biomass",
      "Green design: Artificial photosynthesis for clean energy",
      "Climate change: Understanding carbon cycle and CO₂ removal",
      "Indoor farming and hydroponics optimize growing conditions",
    ],
  },

  "cellular-respiration": {
    formulas: [
      { expression: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 36-38 ATP", description: "Aerobic respiration" },
    ],
    concepts: [
      "Three stages: Glycolysis (cytoplasm), Krebs cycle, ETC (mitochondria)",
      "Glycolysis: Glucose split into pyruvate, net 2 ATP produced",
      "Krebs cycle: Pyruvate completely oxidized to CO₂, 2 ATP per glucose",
      "Electron transport chain: Electrons move through proteins, create proton gradient",
      "Chemiosmosis: ATP synthase uses proton gradient to make ~32-34 ATP",
      "Final electron acceptor is oxygen (forms water)",
      "Anaerobic respiration/fermentation when oxygen absent (less efficient)",
      "ATP is energy currency used for cellular work",
    ],
    applications: [
      "Exercise physiology: Understanding aerobic vs anaerobic metabolism",
      "Metabolic disorders: Mitochondrial diseases and enzyme deficiencies",
      "Weight management: Balancing caloric intake and energy expenditure",
      "Biotechnology: Fermentation for food and beverage production",
      "Cancer research: Warburg effect (cancer cells favor glycolysis even with oxygen)",
    ],
  },

  "mitosis-meiosis": {
    formulas: [],
    concepts: [
      "Mitosis: Cell division producing identical diploid cells (growth, repair)",
      "Meiosis: Cell division producing haploid gametes (sexual reproduction)",
      "Mitosis stages: Prophase, Metaphase, Anaphase, Telophase (PMAT)",
      "Meiosis has two divisions (Meiosis I and II) with four haploid daughter cells",
      "Crossing over in Prophase I shuffles genetic material between homologous chromosomes",
      "Independent assortment creates genetic diversity in gametes",
      "Cytokinesis divides cytoplasm after nuclear division",
      "Checkpoints ensure proper division; failures can lead to cancer",
    ],
    applications: [
      "Cancer is uncontrolled mitosis (tumor growth and metastasis)",
      "Fertility treatments and in vitro fertilization (IVF)",
      "Genetic testing for chromosomal abnormalities (Down syndrome, etc.)",
      "Stem cell research and tissue regeneration",
      "Understanding inheritance patterns and genetic diversity",
    ],
  },

  "natural-selection": {
    formulas: [],
    concepts: [
      "Variation exists in populations due to mutations and genetic recombination",
      "Organisms produce more offspring than can survive (competition for resources)",
      "Individuals with advantageous traits more likely to survive and reproduce",
      "Beneficial traits become more common over generations (adaptation)",
      "Fitness is reproductive success, not necessarily strength or size",
      "Environmental changes shift selection pressures",
      "Speciation occurs when populations become reproductively isolated",
      "Evolution is change in allele frequencies over time",
    ],
    applications: [
      "Antibiotic resistance: Bacteria evolve resistance to drugs",
      "Pesticide resistance in insects and weeds",
      "Conservation biology: Preserving genetic diversity in endangered species",
      "Selective breeding in agriculture and animal husbandry",
      "Understanding human evolution and adaptations",
    ],
  },

  "nervous-system": {
    formulas: [],
    concepts: [
      "Neurons are specialized cells transmitting electrical signals",
      "Resting potential: -70mV (inside negative relative to outside)",
      "Action potential: Rapid depolarization when voltage reaches threshold",
      "Voltage-gated Na⁺ channels open (depolarization), then K⁺ channels open (repolarization)",
      "Myelin sheath insulates axons, speeds up signal transmission (saltatory conduction)",
      "Synapse: Junction between neurons; signals transmitted chemically by neurotransmitters",
      "Neurotransmitters cross synaptic cleft, bind to receptors on next neuron",
      "Neuroplasticity: Brain can reorganize by forming new neural connections",
    ],
    applications: [
      "Anesthetics block nerve signals during surgery",
      "Treating neurological disorders: Parkinson's, epilepsy, depression",
      "Local anesthetics (Novocaine) block sodium channels",
      "Psychoactive drugs affect neurotransmitter systems",
      "Brain-computer interfaces for prosthetics control",
    ],
  },

  "ecosystem": {
    formulas: [],
    concepts: [
      "Food webs show complex feeding relationships (not simple chains)",
      "Producers (autotrophs) make their own food; consumers eat other organisms",
      "Energy decreases at each trophic level (10% rule for energy transfer)",
      "Decomposers break down dead matter, recycling nutrients",
      "Trophic levels: Producers → Primary consumers → Secondary → Tertiary",
      "Keystone species have disproportionate impact on ecosystem structure",
      "Biodiversity increases ecosystem stability and resilience",
      "Carrying capacity: Maximum population environment can support",
    ],
    applications: [
      "Conservation efforts to protect endangered species and habitats",
      "Sustainable fisheries management to prevent overfishing",
      "Invasive species control to protect native ecosystems",
      "Restoration ecology: Rehabilitating damaged ecosystems",
      "Understanding climate change impacts on ecosystems",
    ],
  },

  "immune-response": {
    formulas: [],
    concepts: [
      "Innate immunity: Nonspecific defenses (skin, macrophages, inflammation)",
      "Adaptive immunity: Specific responses with memory (B cells, T cells)",
      "Macrophages engulf pathogens and present antigens",
      "Helper T cells coordinate immune response",
      "Cytotoxic T cells kill infected cells directly",
      "B cells produce antibodies that neutralize pathogens",
      "Memory cells provide long-term immunity (faster response next time)",
      "Inflammation brings immune cells to site of infection",
    ],
    applications: [
      "Vaccines stimulate adaptive immunity without causing disease",
      "Antibiotics target bacteria but don't work on viruses",
      "Allergies are overactive immune responses to harmless substances",
      "Autoimmune diseases: Immune system attacks body's own tissues",
      "Immunosuppressive drugs for organ transplants prevent rejection",
    ],
  },

  // MATH
  "fourier-transform": {
    formulas: [
      { expression: "F(ω) = ∫f(t)e^(-iωt)dt", description: "Fourier Transform" },
      { expression: "f(t) = (1/2π)∫F(ω)e^(iωt)dω", description: "Inverse Fourier Transform" },
      { expression: "f(t) = a₀/2 + Σ(aₙcos(nωt) + bₙsin(nωt))", description: "Fourier Series" },
    ],
    concepts: [
      "Any complex waveform can be decomposed into simple sine waves",
      "Fourier transform converts time-domain signal to frequency-domain representation",
      "Frequency spectrum shows which frequencies are present and their amplitudes",
      "Fundamental frequency is lowest frequency; harmonics are integer multiples",
      "Square waves contain odd harmonics; sawtooth contains all harmonics",
      "Fast Fourier Transform (FFT) is efficient algorithm for computation",
      "Spectral analysis reveals periodicities and patterns in data",
    ],
    applications: [
      "Audio compression (MP3) removes frequencies humans can't hear",
      "Image compression (JPEG) uses frequency domain analysis",
      "Speech recognition analyzes frequency patterns of speech",
      "Medical imaging: CT and MRI scanners use Fourier transform",
      "Vibration analysis detects mechanical problems in machinery",
    ],
  },

  "fibonacci-spiral": {
    formulas: [
      { expression: "Fₙ = Fₙ₋₁ + Fₙ₋₂", description: "Fibonacci recurrence relation" },
      { expression: "φ = (1+√5)/2 ≈ 1.618", description: "Golden ratio" },
      { expression: "lim(n→∞) Fₙ₊₁/Fₙ = φ", description: "Ratio approaches golden ratio" },
    ],
    concepts: [
      "Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...",
      "Each number is sum of previous two",
      "Golden ratio φ appears in ratio of successive Fibonacci numbers",
      "Golden spiral grows by factor φ each quarter turn",
      "Fibonacci numbers appear surprisingly often in nature",
      "Golden ratio has unique mathematical properties (φ² = φ + 1, 1/φ = φ - 1)",
      "Phi is considered aesthetically pleasing in art and architecture",
    ],
    applications: [
      "Financial analysis: Fibonacci retracement levels in technical trading",
      "Computer algorithms: Fibonacci search technique",
      "Art and design: Golden ratio for pleasing proportions",
      "Architecture: Parthenon and other classical structures use golden ratio",
      "Botany: Understanding phyllotaxis (leaf arrangement) patterns",
    ],
  },

  "3d-geometry": {
    formulas: [
      { expression: "V - E + F = 2", description: "Euler's formula for convex polyhedra" },
      { expression: "V = (4/3)πr³", description: "Sphere volume" },
      { expression: "A = 4πr²", description: "Sphere surface area" },
    ],
    concepts: [
      "Platonic solids: 5 regular convex polyhedra (tetrahedron, cube, octahedron, dodecahedron, icosahedron)",
      "Regular polyhedron: All faces are congruent regular polygons",
      "Euler's formula relates vertices (V), edges (E), and faces (F)",
      "Symmetry groups describe transformations that preserve the solid",
      "Archimedean solids: Semi-regular polyhedra with multiple face types",
      "Dual solids: Cube ↔ octahedron, dodecahedron ↔ icosahedron",
      "3D coordinates: x, y, z describe position in space",
    ],
    applications: [
      "Crystal structures in chemistry and materials science",
      "Computer graphics and 3D modeling",
      "Architecture and structural engineering",
      "Molecular geometry and chemical bonding visualization",
      "Geodesic domes use triangular faces for structural efficiency",
    ],
  },

  "calculus-visualizer": {
    formulas: [
      { expression: "f'(x) = lim(h→0)[f(x+h)-f(x)]/h", description: "Derivative definition" },
      { expression: "∫f(x)dx = lim(n→∞)Σf(xᵢ*)Δx", description: "Definite integral" },
      { expression: "∫ₐᵇf(x)dx = F(b) - F(a)", description: "Fundamental Theorem of Calculus" },
    ],
    concepts: [
      "Derivative: Instantaneous rate of change, slope of tangent line",
      "Integral: Area under curve, accumulation of quantities",
      "Derivative and integral are inverse operations (Fundamental Theorem)",
      "Riemann sums approximate area using rectangles under curve",
      "Second derivative: Rate of change of rate of change (concavity)",
      "Derivatives represent velocity, acceleration, growth rates",
      "Integrals represent total distance, work, total accumulation",
    ],
    applications: [
      "Physics: Motion, forces, energy, and all physical laws",
      "Economics: Marginal cost, optimization problems",
      "Engineering: Control systems, signal processing",
      "Biology: Population growth, drug concentration over time",
      "Machine learning: Gradient descent uses derivatives",
    ],
  },

  "mandelbrot": {
    formulas: [
      { expression: "zₙ₊₁ = zₙ² + c", description: "Mandelbrot iteration" },
    ],
    concepts: [
      "Mandelbrot set: Points c where zₙ₊₁ = zₙ² + c remains bounded (doesn't escape to infinity)",
      "Start with z₀ = 0, iterate the formula for each point c in complex plane",
      "Points that escape quickly are colored based on iteration count",
      "Boundary of set is infinitely complex (fractal)",
      "Self-similarity: Similar patterns appear at all scales",
      "Complex numbers: a + bi where i² = -1",
      "Connected set: All points in the set are connected",
      "Cardioid and bulbs are main features of the set",
    ],
    applications: [
      "Computer graphics: Fractal image generation",
      "Data compression using fractal algorithms",
      "Modeling natural phenomena (coastlines, clouds, mountains)",
      "Computer security: Fractal-based encryption",
      "Art and design: Generating unique visual patterns",
    ],
  },

  "probability-distributions": {
    formulas: [
      { expression: "μ = Σx·P(x)", description: "Expected value (mean)" },
      { expression: "σ² = Σ(x-μ)²·P(x)", description: "Variance" },
      { expression: "f(x) = (1/σ√2π)e^(-(x-μ)²/(2σ²))", description: "Normal distribution PDF" },
    ],
    concepts: [
      "Random variables can be discrete (countable) or continuous",
      "Probability distributions show likelihood of each possible outcome",
      "Normal (Gaussian) distribution: Bell curve, symmetric, defined by mean and standard deviation",
      "68-95-99.7 rule: In normal distribution, 68%, 95%, 99.7% within 1, 2, 3 standard deviations",
      "Binomial: Number of successes in n independent trials",
      "Poisson: Number of events in fixed time/space interval",
      "Central Limit Theorem: Sum of many random variables tends toward normal distribution",
    ],
    applications: [
      "Quality control: Monitoring manufacturing processes",
      "Finance: Risk assessment and portfolio management",
      "Insurance: Calculating premiums based on risk",
      "Scientific research: Statistical analysis and hypothesis testing",
      "Weather forecasting: Probability of different weather events",
    ],
  },

  "linear-algebra": {
    formulas: [
      { expression: "Ax = b", description: "Matrix equation" },
      { expression: "det(A - λI) = 0", description: "Eigenvalue equation" },
    ],
    concepts: [
      "Vectors: Quantities with magnitude and direction in n-dimensional space",
      "Matrices: Rectangular arrays of numbers representing linear transformations",
      "Matrix multiplication represents composition of transformations",
      "Eigenvalues and eigenvectors: Special values where transformation only scales vector",
      "Determinant: Scaling factor of transformation, indicates invertibility",
      "Linear transformations: Rotation, scaling, shearing in 2D/3D space",
      "Systems of linear equations: Can be solved using matrix methods",
      "Basis and dimension: Building blocks for vector spaces",
    ],
    applications: [
      "Computer graphics: All 3D transformations use linear algebra",
      "Machine learning: Neural networks are essentially matrix operations",
      "Quantum mechanics: State vectors and operators",
      "Engineering: Structural analysis, control systems",
      "Data science: Principal component analysis (PCA)",
    ],
  },

  "trigonometry": {
    formulas: [
      { expression: "sin²θ + cos²θ = 1", description: "Pythagorean identity" },
      { expression: "sin(α±β) = sinαcosβ ± cosαsinβ", description: "Sum/difference formulas" },
      { expression: "A = ½ab sinC", description: "Area of triangle" },
      { expression: "c² = a² + b² - 2ab cosC", description: "Law of Cosines" },
    ],
    concepts: [
      "Unit circle: Circle with radius 1, center at origin",
      "Sine: y-coordinate on unit circle; cosine: x-coordinate",
      "Tangent: sinθ/cosθ, slope of angle",
      "Trig functions relate angles to side ratios in right triangles",
      "Periodic functions: sin and cos repeat every 2π",
      "Radians: Natural angle measure, arc length equals angle on unit circle",
      "Inverse trig functions: arcsin, arccos, arctan give angle from ratio",
    ],
    applications: [
      "Navigation: GPS uses triangulation and trilateration",
      "Engineering: Signal processing, AC circuits, vibrations",
      "Architecture: Roof slopes, structural angles",
      "Astronomy: Calculating distances and positions of celestial bodies",
      "Music: Sound waves and harmonics are sinusoidal",
    ],
  },

  "complex-numbers": {
    formulas: [
      { expression: "z = a + bi", description: "Complex number form" },
      { expression: "|z| = √(a² + b²)", description: "Modulus (magnitude)" },
      { expression: "z = r(cosθ + i sinθ) = re^(iθ)", description: "Polar and exponential form" },
      { expression: "i² = -1", description: "Definition of imaginary unit" },
    ],
    concepts: [
      "Complex numbers extend real numbers by including √(-1) = i",
      "Real part (a) and imaginary part (b)",
      "Argand plane: Complex numbers plotted as points (real, imaginary)",
      "Modulus: Distance from origin; Argument: Angle from positive real axis",
      "Complex conjugate: a - bi, reflects across real axis",
      "Complex addition: Add real and imaginary parts separately",
      "Euler's formula: e^(iπ) + 1 = 0 connects five fundamental constants",
    ],
    applications: [
      "Electrical engineering: AC circuit analysis uses complex numbers",
      "Quantum mechanics: Wave functions are complex-valued",
      "Signal processing: Fourier analysis uses complex exponentials",
      "Control theory: System stability analysis",
      "Fluid dynamics: Potential flow analysis",
    ],
  },

  "topology-surfaces": {
    formulas: [
      { expression: "χ = V - E + F", description: "Euler characteristic" },
    ],
    concepts: [
      "Topology studies properties preserved under continuous deformation",
      "Homeomorphism: One shape can be stretched into another without tearing",
      "Möbius strip: One-sided surface (only one boundary component)",
      "Klein bottle: Non-orientable surface with no inside or outside",
      "Torus: Doughnut shape, orientable surface with genus 1 (one hole)",
      "Genus: Number of holes in a surface",
      "Manifold: Topological space that locally resembles Euclidean space",
      "Orientable vs non-orientable: Möbius strip has no consistent inside/outside",
    ],
    applications: [
      "Computer graphics: Surface modeling and mesh generation",
      "Data analysis: Topological data analysis (TDA) finds structure in data",
      "Physics: String theory, spacetime topology",
      "Biology: Knots in DNA and protein folding",
      "Materials science: Liquid crystals and topological insulators",
    ],
  },
};
