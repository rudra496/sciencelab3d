"use client";

import { useState, useMemo, useEffect } from "react";
import { experiments, categories } from "@/data/experiments";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Moon, Sun } from "lucide-react";

// Favorites utilities
function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  } catch {
    return [];
  }
}

function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

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
  category: (typeof categories)[0] | { id: string; name: string; icon: string; color?: string };
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

function ExperimentCard({ exp, index, onToggleFavorite }: {
  exp: (typeof experiments)[0];
  index: number;
  onToggleFavorite: (id: string) => void;
}) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(exp.id));
  }, [exp.id]);

  const handleClickFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(exp.id);
    setFav((f) => !f);
  };

  return (
    <motion.a
      href={`/experiment/${exp.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer block relative"
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
      <button
        onClick={handleClickFavorite}
        className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
          fav ? "text-yellow-400 bg-yellow-400/10" : "text-gray-500 hover:text-yellow-400"
        }`}
        title={fav ? "Remove from favorites" : "Add to favorites"}
      >
        <Star size={16} fill={fav ? "currentColor" : "none"} />
      </button>

      <div className="flex items-start justify-between mb-4 pr-8">
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
        {exp.topics.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500"
          >
            {t}
          </span>
        ))}
        {exp.topics.length > 3 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
            +{exp.topics.length - 3}
          </span>
        )}
      </div>
    </motion.a>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("light", savedTheme === "light");
      }
      // Update favorites count
      setFavoritesCount(getFavorites().length);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  const filtered = useMemo(() => {
    let result = experiments.filter((exp) => {
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

    if (showFavoritesOnly) {
      const favorites = getFavorites();
      result = result.filter((exp) => favorites.includes(exp.id));
    }

    return result;
  }, [activeCategory, search, showFavoritesOnly]);

  const handleToggleFavorite = (id: string) => {
    const favorites = getFavorites();
    if (favorites.includes(id)) {
      localStorage.setItem("favorites", JSON.stringify(favorites.filter((f) => f !== id)));
    } else {
      localStorage.setItem("favorites", JSON.stringify([...favorites, id]));
    }
    // Update favorites count
    setFavoritesCount(getFavorites().length);
    // Force re-render by updating state
    setShowFavoritesOnly((prev) => prev);
  };

  const favoriteCategories = [
    { id: "all", name: "All Experiments", icon: "🔬" },
    { id: "favorites", name: "⭐ Favorites", icon: "" },
    ...categories,
  ];

  return (
    <main>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 glass rounded-full shadow-lg hover:scale-105 transition-transform"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

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
              placeholder="Search experiments by name, topic, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 glass rounded-xl bg-transparent text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-3 justify-center flex-wrap mb-12">
            <button
              onClick={() => {
                setActiveCategory("all");
                setShowFavoritesOnly(false);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeCategory === "all" && !showFavoritesOnly
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-purple-500/20 scale-105"
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-xl">🔬</span>
              All Experiments
            </button>

            {/* Favorites filter */}
            <button
              onClick={() => {
                setActiveCategory("all");
                setShowFavoritesOnly((prev) => !prev);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                showFavoritesOnly
                  ? "bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-white shadow-lg shadow-yellow-500/20 scale-105"
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-xl">⭐</span>
              Favorites
              {favoritesCount > 0 && (
                <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            {categories.map((cat) => (
              <CategoryBadge
                key={cat.id}
                category={cat}
                active={activeCategory === cat.id && !showFavoritesOnly}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setShowFavoritesOnly(false);
                }}
              />
            ))}
          </div>

          {/* Difficulty filters */}
          <div className="flex gap-2 justify-center flex-wrap mb-8">
            {["Beginner", "Intermediate", "Advanced"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSearch(search ? `${search} ${diff}` : diff)}
                className="px-4 py-2 glass rounded-full text-sm text-gray-400 hover:text-white transition-colors"
              >
                {diff}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Experiment Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + search + showFavoritesOnly}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filtered.map((exp, i) => (
              <ExperimentCard
                key={exp.id}
                exp={exp}
                index={i}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            {showFavoritesOnly
              ? "No favorites yet. Click the star icon on any experiment to add it!"
              : "No experiments found. Try a different search or category."}
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
