# Contributing to ScienceLab 3D

Thank you for your interest in contributing to **ScienceLab 3D**! 🎉

Whether you want to add a new experiment, fix a bug, improve the UI, or enhance SEO/performance — all contributions are welcome.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Basic knowledge of React / TypeScript / Three.js

### Setup

```bash
git clone https://github.com/rudra496/sciencelab3d.git
cd sciencelab3d
npm install
npm run dev
```

---

## 🤝 How to Contribute

### 1. Fork & Clone
- Fork the repository on GitHub
- Clone your fork locally

### 2. Create a Branch
```bash
git checkout -b feature/my-new-experiment
# or
git checkout -b fix/bug-description
```

### 3. Make Your Changes
- Follow the existing code style (TypeScript, functional components)
- Keep components small and focused
- Add meaningful comments for complex logic

### 4. Test Your Changes
```bash
npm run build   # Ensure no build errors
npm run dev     # Visually test your changes
```

### 5. Commit & Push
```bash
git add .
git commit -m "feat: add new experiment — <experiment name>"
git push origin feature/my-new-experiment
```

### 6. Open a Pull Request
- Go to the GitHub repository
- Click "New Pull Request"
- Describe what your PR does and why

---

## 🔬 Adding a New Experiment

To add a new experiment to ScienceLab 3D:

1. **Add experiment metadata** in `src/data/experiments.ts`:
   ```ts
   {
     id: "my-experiment",
     title: "My Experiment",
     category: "physics", // physics | chemistry | biology | math
     difficulty: "Beginner", // Beginner | Intermediate | Advanced
     description: "A short description of the experiment.",
     icon: "🔬",
     color: "#4f8fff",
     topics: ["Topic 1", "Topic 2", "Topic 3"],
   }
   ```

2. **Create the experiment page** at:
   - `src/app/experiments/my-experiment/page.tsx` — main simulation
   - `src/app/experiments/my-experiment/details/page.tsx` — details/theory

3. **Create experiment components** in `src/experiments/`:
   - `my-experiment-scene.tsx` — Three.js 3D scene
   - `my-experiment-page.tsx` — page wrapper with controls

4. **Test thoroughly** — ensure it works on both desktop and mobile.

---

## 📐 Code Style Guidelines

- Use **TypeScript** with proper types — avoid `any`
- Use **functional components** with React hooks
- Follow **existing naming conventions** (kebab-case for files, PascalCase for components)
- Keep **components small** — split large components into smaller ones
- Add **accessibility attributes** (`aria-label`, `role`, `title`)
- Ensure **mobile responsiveness** with Tailwind CSS classes

---

## 🐛 Reporting Bugs

Found a bug? Please [open an issue](https://github.com/rudra496/sciencelab3d/issues/new) with:
- A clear description of the bug
- Steps to reproduce it
- Expected vs actual behavior
- Browser and device info

---

## 💡 Suggesting Features

Have an idea? [Open a feature request](https://github.com/rudra496/sciencelab3d/issues/new) and describe:
- What you'd like to see
- Why it would be useful
- Any implementation ideas

---

## 📜 Code of Conduct

Be respectful, inclusive, and constructive. We welcome everyone regardless of experience level.

---

## 👤 Contact

- **Author:** [Rudra Sarker](https://rudra496.github.io/site)
- **Email:** [rudrasarker125@gmail.com](mailto:rudrasarker125@gmail.com)
- **LinkedIn:** [linkedin.com/in/rudrasarker](https://www.linkedin.com/in/rudrasarker)
- **GitHub:** [github.com/rudra496](https://github.com/rudra496)

---

Thank you for helping make science more accessible to everyone! 🌍🔬
