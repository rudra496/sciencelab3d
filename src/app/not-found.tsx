"use client";

import { motion } from "framer-motion";
import { FlaskConical, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative" style={{ background: "var(--bg-primary)" }}>
      <div className="absolute top-20 left-[20%] w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-[20%] w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />

      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="mb-6 inline-block"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
            <FlaskConical className="text-purple-400" size={48} />
          </div>
        </motion.div>

        <h1 className="text-8xl md:text-9xl font-black bg-linear-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Experiment Not Found</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          This experiment hasn&apos;t been discovered yet. It might be floating in an alternate dimension,
          or the lab assistant may have misplaced it.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg shadow-blue-500/25"
          >
            <Home size={18} /> Back to Lab
          </Link>
          <Link
            href="/#experiments"
            className="flex items-center gap-2 px-6 py-3 glass rounded-full font-semibold hover:scale-105 transition-transform"
          >
            <ArrowLeft size={18} /> Browse Experiments
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
