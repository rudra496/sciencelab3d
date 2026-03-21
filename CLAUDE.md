# 3D Science Lab - Claude Code Project Guide

## Project Overview
Interactive 3D science education platform with 40 experiments across Physics, Chemistry, Biology, and Mathematics. Built with Next.js 15, React Three Fiber, TypeScript, and Tailwind CSS.

**Live URL:** https://rudra496.github.io/science
**Dev Server:** `npm run dev` (http://localhost:3000)
**Build:** `npm run build`

## CRITICAL: Architecture Pattern (FOLLOW EXACTLY)

Every experiment consists of **3 files** following this exact pattern:

### 1. Scene Component: `src/experiments/{name}-scene.tsx`
- The 3D scene with Three.js/R3F
- Receives config props and `onDataChange` callback
- **MUST** export a data type interface (e.g., `export interface SpringData`)
- **MUST** use `useFrame` for animations
- **MUST** call `onDataChange` every frame with real-time physics values

### 2. Page Component: `src/experiments/{name}-page.tsx`
- Uses `ExperimentContainer` wrapper
- Has `controls`, `dataPanel`, and `details` sections
- Uses `ControlGroup`, `ControlSlider`, `DataGrid`, `EnergyBar` from shared components
- Contains educational content (formulas, concepts, applications)

### 3. Route Page: `src/app/experiments/{name}/page.tsx`
- Minimal — just imports and re-exports the page component
- **MUST** have `export const dynamic = 'force-dynamic';` (SSR fix)

## Imports to Use

```typescript
// Page components:
import { ExperimentContainer } from "@/components/experiment-ui/ExperimentContainer";
import { ControlGroup, ControlSlider, DataGrid, EnergyBar } from "@/components/experiment-ui/ExperimentControls";

// Scene components:
import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
```

## Shared UI Components

### ExperimentContainer Props
```typescript
interface ExperimentContainerProps {
  title: string;
  description: string;
  cameraPosition: [number, number, number]; // 30-80 units for large spaces
  backgroundColor?: string; // default "#050510"
  controls: ReactNode;
  dataPanel: ReactNode;
  details: ReactNode;
}
```

### ControlSlider Props
```typescript
interface ControlSliderProps {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step: number;
  color?: string; // e.g., "#3b82f6"
  onChange: (value: number) => void;
  decimals?: number;
  disabled?: boolean;
}
```

### DataGrid Props
```typescript
interface DataGridProps {
  data: Record<string, { value: number; unit: string; color?: string; decimals?: number }>;
  columns?: 1 | 2 | 3;
}
```

### EnergyBar Props
```typescript
interface EnergyBarProps {
  kinetic: number;
  potential: number;
  total: number;
  maxEnergy?: number;
}
```

## ⛔ CRITICAL RULES — DO NOT VIOLATE

### TypeScript / R3F Rules
1. **NEVER use `meshBasicMaterial` with `emissive`** — use `meshStandardMaterial` instead
2. **NEVER use `clearcoat` or `clearcoatRoughness`** — not supported by current R3F types
3. **ALWAYS null-check refs** before accessing `.current`: `if (!ref.current) return;`
4. **NEVER access `.current` on a ref without checking** (TypeScript will error on `possibly null`)
5. **NEVER use `useState` for browser APIs** — use `useEffect` instead (SSR safety)
6. **ALWAYS use `useEffect` for `window.addEventListener`**, never `useState`

### Route Rules
7. **Every experiment route MUST have** `export const dynamic = 'force-dynamic';` as the first line
8. **NEVER import browser-only code** at module level in route files

### Code Quality Rules
9. **Use `meshStandardMaterial`** for all objects (supports metalness, roughness, emissive, envMapIntensity)
10. **Camera positions: 30-80 units** — experiments should feel spacious
11. **Use descriptive colors** for each slider/data item — no default purple everywhere
12. **All physics formulas must be real and accurate** — no placeholder values
13. **Every experiment needs 3 toggleable panels**: Controls ⚙, Data 📊, Info ℹ

### File Safety Rules
14. **NEVER modify or delete the 10 completed physics experiments:**
    - pendulum, projectile-motion, wave-interference, gas-laws, double-slit
    - spring-mass, gravitational-orbits, doppler, refraction, electromagnetic
15. **NEVER modify shared components** (`ExperimentContainer.tsx`, `ExperimentControls.tsx`) unless fixing a bug
16. **NEVER delete old experiment files** (e.g., `ohms-law.tsx`) until the new version is complete and verified

## Reference: Complete Page Component Pattern

```typescript
"use client";

import { useState } from "react";
import { ExperimentNameSceneComponent, ExperimentData } from "@/experiments/experiment-name-scene";
import { ExperimentContainer } from "@/components/experiment-ui/ExperimentContainer";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

export default function ExperimentNamePage() {
  const [data, setData] = useState<ExperimentData | null>(null);
  const [config, setConfig] = useState({
    // ... default values
  });

  const updateConfig = (key: string, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const controls = (
    <div className="space-y-5">
      <ControlGroup title="Parameters">
        <ControlSlider
          label="Parameter Name"
          value={config.param}
          unit="units"
          min={0}
          max={100}
          step={1}
          color="#3b82f6"
          onChange={(v) => updateConfig("param", v)}
        />
      </ControlGroup>
      <button
        onClick={handleReset}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg"
      >
        🔄 Reset Simulation
      </button>
    </div>
  );

  const dataPanel = data ? (
    <DataGrid
      data={{
        measurement1: { value: data.value1, unit: "m", color: "#3b82f6" },
        measurement2: { value: data.value2, unit: "s", color: "#22c55e" },
      }}
      columns={2}
    />
  ) : null;

  const details = (
    <div className="space-y-6 text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">About This Experiment</h3>
        <p className="text-sm leading-relaxed">
          Description of the experiment...
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Formulas</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-2">
          <div className="text-purple-300">Formula 1</div>
          <div className="text-green-300">Formula 2</div>
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Applications</h3>
        <ul className="space-y-2 text-sm">
          <li>• Application 1</li>
          <li>• Application 2</li>
        </ul>
      </section>
    </div>
  );

  return (
    <ExperimentContainer
      title="Experiment Title"
      description="Short description"
      cameraPosition={[35, 25, 35]}
      backgroundColor="#050510"
      controls={controls}
      dataPanel={dataPanel}
      details={details}
    >
      <ExperimentNameSceneComponent onDataChange={setData} {...config} />
    </ExperimentContainer>
  );
}
```

## Educational Content Source

All educational content (formulas, concepts, applications) already exists in:
- **`src/data/experiment-details.ts`** — structured data per experiment with `formulas`, `concepts`, `applications`
- **`src/data/experiments.ts`** — experiment metadata (id, title, category, description, topics)

**Use these as the source of truth for educational content.** Do NOT invent content — use what's already defined.

## Experiments to Convert (30 remaining)

### Physics (1 remaining)
- `ohms-law` — circuit with animated electrons, voltage/resistance controls

### Chemistry (10 remaining)
- `atomic-structure` — protons, neutrons, electrons, shells
- `chemical-bonding` — ionic, covalent, metallic bonds
- `electrolysis` — electrodes, bubbles, redox reactions
- `titration` — acid-base burette, pH indicator color change
- `acid-base-reactions` — neutralization, pH scale
- `crystal-lattice` — FCC, BCC, HCP structures
- `diffusion` — particles through membrane, Brownian motion
- `thermochemistry` — energy diagrams, bond breaking/forming
- `periodic-trends` — 3D periodic table, atomic radius trends

### Biology (10 remaining)
- `cell-structure` — 3D animal cell, clickable organelles
- `dna-replication` — double helix unzipping, enzymes
- `protein-synthesis` — transcription, translation, ribosomes
- `photosynthesis` — chloroplast, light reactions, Calvin cycle
- `cellular-respiration` — mitochondria, ATP production
- `mitosis-meiosis` — cell division stages
- `natural-selection` — evolution simulation, generations
- `nervous-system` — neuron, action potential, synapse
- `ecosystem` — food web, population dynamics
- `immune-response` — immune cells fighting pathogens

### Mathematics (9 remaining)
- `fourier-transform` — waveform decomposition, frequency spectrum
- `fibonacci-spiral` — golden spiral in 3D
- `3d-geometry` — Platonic solids, Euler's formula
- `calculus-visualizer` — derivatives, integrals, Riemann sums
- `mandelbrot` — fractal zoom
- `probability-distributions` — normal, binomial, Poisson
- `linear-algebra` — vectors, matrices, transformations
- `trigonometry` — unit circle, sin/cos/tan
- `topology-surfaces` — Möbius strip, Klein bottle, torus

## Quality Standards

### Visual Quality
- Use `meshStandardMaterial` with `metalness`, `roughness`, `envMapIntensity` for premium look
- Add `castShadow` and `receiveShadow` to objects
- Use subtle glow effects with `emissive` and `emissiveIntensity`
- Color scheme: Dark background (#050510), vibrant accent colors per parameter

### Physics/Math Accuracy
- All formulas must be real and correct
- Values must update in real-time as user adjusts controls
- Use proper units everywhere
- Show energy conservation where applicable

### UI/UX
- Each slider gets a unique color (not all purple)
- Data panel shows values with proper units and colors
- Info panel has educational content (formulas, concepts, applications)
- Reset button for simulations with state

## Build Verification

After completing each experiment:
```bash
npm run build
```
- Fix ANY TypeScript errors before moving to the next experiment
- Common errors: null ref access, unsupported material props, wrong column types
- Build MUST pass with 0 errors

## Git Workflow

After each batch of completed experiments:
```bash
git add -A
git commit -m "feat: add [experiment-name] experiment with full UI and physics"
```

## Do NOT

- ❌ Use `leva` or `@react-three/leva` for controls (we use our own UI)
- ❌ Use `meshBasicMaterial` (use `meshStandardMaterial`)
- ❌ Use `clearcoat`, `clearcoatRoughness` props
- ❌ Access `.current` on refs without null check
- ❌ Use `useState` for `window.addEventListener`
- ❌ Forget `export const dynamic = 'force-dynamic'` on route pages
- ❌ Modify completed experiments (pendulum, projectile-motion, etc.)
- ❌ Delete old files before new ones are verified
- ❌ Use placeholder/dummy content — use `experiment-details.ts`
