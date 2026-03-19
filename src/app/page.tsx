"use client";

import { useState, useMemo } from "react";
import { experiments, categories } from "@/data/experiments";
import { AnimatePresence, motion } from "framer-motion";

function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(79,143,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79,143,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-[10%] w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute top-40 right-[30%] w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <div className="text-sm font-mono text-blue-400 mb-4 tracking-widest uppercase">
          Interactive 3D Science Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
          ScienceLab 3D
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Explore 40+ interactive experiments across Physics, Chemistry, Biology,
          and Mathematics. Control variables, watch simulations, and learn
          science like never before.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#experiments"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg shadow-blue-500/25"
          >
            Start Exploring
          </a>
          <a
            href="#about"
            className="px-8 py-3 glass rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Learn More
          </a>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 mt-16 flex gap-8 md:gap-16 flex-wrap justify-center"
      >
        {[
          { num: "40+", label: "Experiments" },
          { num: "4", label: "Subjects" },
          { num: "3D", label: "Interactive" },
          { num: "∞", label: "Learning" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {s.num}
            </div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function CategoryBadge({
  category,
  active,
  onClick,
}: {
  category: (typeof categories)[0];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
        active
          ? "text-white shadow-lg scale-105"
          : "glass text-gray-400 hover:text-white hover:scale-102"
      }`}
      style={
        active
          ? {
              background: `linear-gradient(135deg, ${category.color}33, ${category.color}11)`,
              boxShadow: `0 0 20px ${category.color}33`,
              borderColor: `${category.color}55`,
            }
          : {}
      }
    >
      <span className="text-xl">{category.icon}</span>
      {category.name}
    </button>
  );
}

function ExperimentCard({ exp, index }: { exp: (typeof experiments)[0]; index: number }) {
  return (
    <motion.a
      href={`/experiment/${exp.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer block"
      style={{
        borderColor: `${exp.color}15`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${exp.color}15`;
        (e.currentTarget as HTMLElement).style.borderColor = `${exp.color}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.borderColor = `${exp.color}15`;
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{exp.icon}</span>
        <span
          className="text-xs font-mono px-2 py-1 rounded-full"
          style={{
            background: `${exp.color}15`,
            color: exp.color,
          }}
        >
          {exp.difficulty}
        </span>
      </div>
      <h3 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">
        {exp.title}
      </h3>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{exp.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {exp.topics.map((t) => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.a>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return experiments.filter((exp) => {
      const matchCat =
        activeCategory === "all" || exp.category === activeCategory;
      const matchSearch =
        search === "" ||
        exp.title.toLowerCase().includes(search.toLowerCase()) ||
        exp.description.toLowerCase().includes(search.toLowerCase()) ||
        exp.topics.some((t) =>
          t.toLowerCase().includes(search.toLowerCase())
        );
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <main>
      <HeroSection />

      {/* Experiments Section */}
      <section id="experiments" className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Explore Experiments
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
            Choose a subject or search for a specific experiment. Each one is
            fully interactive with real-time 3D controls.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <input
              type="text"
              placeholder="Search experiments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 glass rounded-xl bg-transparent text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-3 justify-center flex-wrap mb-12">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeCategory === "all"
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-purple-500/20 scale-105"
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-xl">🔬</span>
              All Experiments
            </button>
            {categories.map((cat) => (
              <CategoryBadge
                key={cat.id}
                category={cat}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Experiment Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filtered.map((exp, i) => (
              <ExperimentCard key={exp.id} exp={exp} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No experiments found. Try a different search or category.
          </div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Choose",
                desc: "Pick from 40+ experiments across 4 scientific subjects",
              },
              {
                icon: "🎛️",
                title: "Control",
                desc: "Adjust variables with interactive sliders and real-time controls",
              },
              {
                icon: "🧠",
                title: "Learn",
                desc: "Watch 3D simulations and understand the science behind each experiment",
              },
            ].map((s) => (
              <div key={s.title} className="glass rounded-2xl p-6">
                <span className="text-4xl mb-4 block">{s.icon}</span>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm">
        <p>
          Built with ❤️ by{" "}
          <a
            href="https://rudra496.github.io/site"
            className="text-purple-400 hover:text-purple-300"
          >
            Rudra Sarker
          </a>{" "}
          — ScienceLab 3D © 2026
        </p>
      </footer>
    </main>
  );
}
