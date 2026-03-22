"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Line } from "@react-three/drei";
import * as THREE from "three";

// Element data with categories and properties
export interface ElementData {
  symbol: string;
  name: string;
  number: number;
  mass: number;
  group: number;
  period: number;
  category: "alkali-metal" | "alkaline-earth" | "transition-metal" | "post-transition" | "metalloid" | "nonmetal" | "halogen" | "noble-gas" | "lanthanide" | "actinide";
  atomicRadius: number; // picometers
  electronegativity: number; // Pauling scale
  ionizationEnergy: number; // kJ/mol
  electronAffinity: number; // kJ/mol
  electronConfig: string;
}

const ELEMENTS: ElementData[] = [
  // Period 1
  { symbol: "H", name: "Hydrogen", number: 1, mass: 1.008, group: 1, period: 1, category: "nonmetal", atomicRadius: 53, electronegativity: 2.20, ionizationEnergy: 1312, electronAffinity: 72.8, electronConfig: "1s¹" },
  { symbol: "He", name: "Helium", number: 2, mass: 4.003, group: 18, period: 1, category: "noble-gas", atomicRadius: 31, electronegativity: 0, ionizationEnergy: 2372, electronAffinity: 0, electronConfig: "1s²" },
  // Period 2
  { symbol: "Li", name: "Lithium", number: 3, mass: 6.941, group: 1, period: 2, category: "alkali-metal", atomicRadius: 167, electronegativity: 0.98, ionizationEnergy: 520, electronAffinity: 59.6, electronConfig: "[He] 2s¹" },
  { symbol: "Be", name: "Beryllium", number: 4, mass: 9.012, group: 2, period: 2, category: "alkaline-earth", atomicRadius: 112, electronegativity: 1.57, ionizationEnergy: 899, electronAffinity: 0, electronConfig: "[He] 2s²" },
  { symbol: "B", name: "Boron", number: 5, mass: 10.81, group: 13, period: 2, category: "metalloid", atomicRadius: 87, electronegativity: 2.04, ionizationEnergy: 801, electronAffinity: 26.7, electronConfig: "[He] 2s² 2p¹" },
  { symbol: "C", name: "Carbon", number: 6, mass: 12.01, group: 14, period: 2, category: "nonmetal", atomicRadius: 67, electronegativity: 2.55, ionizationEnergy: 1086, electronAffinity: 121.9, electronConfig: "[He] 2s² 2p²" },
  { symbol: "N", name: "Nitrogen", number: 7, mass: 14.01, group: 15, period: 2, category: "nonmetal", atomicRadius: 56, electronegativity: 3.04, ionizationEnergy: 1402, electronAffinity: -7, electronConfig: "[He] 2s² 2p³" },
  { symbol: "O", name: "Oxygen", number: 8, mass: 16.00, group: 16, period: 2, category: "nonmetal", atomicRadius: 48, electronegativity: 3.44, ionizationEnergy: 1314, electronAffinity: 141, electronConfig: "[He] 2s² 2p⁴" },
  { symbol: "F", name: "Fluorine", number: 9, mass: 19.00, group: 17, period: 2, category: "halogen", atomicRadius: 42, electronegativity: 3.98, ionizationEnergy: 1681, electronAffinity: 328, electronConfig: "[He] 2s² 2p⁵" },
  { symbol: "Ne", name: "Neon", number: 10, mass: 20.18, group: 18, period: 2, category: "noble-gas", atomicRadius: 38, electronegativity: 0, ionizationEnergy: 2081, electronAffinity: 0, electronConfig: "[He] 2s² 2p⁶" },
  // Period 3
  { symbol: "Na", name: "Sodium", number: 11, mass: 22.99, group: 1, period: 3, category: "alkali-metal", atomicRadius: 190, electronegativity: 0.93, ionizationEnergy: 496, electronAffinity: 52.9, electronConfig: "[Ne] 3s¹" },
  { symbol: "Mg", name: "Magnesium", number: 12, mass: 24.31, group: 2, period: 3, category: "alkaline-earth", atomicRadius: 145, electronegativity: 1.31, ionizationEnergy: 738, electronAffinity: 0, electronConfig: "[Ne] 3s²" },
  { symbol: "Al", name: "Aluminum", number: 13, mass: 26.98, group: 13, period: 3, category: "post-transition", atomicRadius: 118, electronegativity: 1.61, ionizationEnergy: 578, electronAffinity: 42.5, electronConfig: "[Ne] 3s² 3p¹" },
  { symbol: "Si", name: "Silicon", number: 14, mass: 28.09, group: 14, period: 3, category: "metalloid", atomicRadius: 111, electronegativity: 1.90, ionizationEnergy: 787, electronAffinity: 133.6, electronConfig: "[Ne] 3s² 3p²" },
  { symbol: "P", name: "Phosphorus", number: 15, mass: 30.97, group: 15, period: 3, category: "nonmetal", atomicRadius: 98, electronegativity: 2.19, ionizationEnergy: 1012, electronAffinity: 72, electronConfig: "[Ne] 3s² 3p³" },
  { symbol: "S", name: "Sulfur", number: 16, mass: 32.07, group: 16, period: 3, category: "nonmetal", atomicRadius: 88, electronegativity: 2.58, ionizationEnergy: 1000, electronAffinity: 200.4, electronConfig: "[Ne] 3s² 3p⁴" },
  { symbol: "Cl", name: "Chlorine", number: 17, mass: 35.45, group: 17, period: 3, category: "halogen", atomicRadius: 79, electronegativity: 3.16, ionizationEnergy: 1251, electronAffinity: 349, electronConfig: "[Ne] 3s² 3p⁵" },
  { symbol: "Ar", name: "Argon", number: 18, mass: 39.95, group: 18, period: 3, category: "noble-gas", atomicRadius: 71, electronegativity: 0, ionizationEnergy: 1521, electronAffinity: 0, electronConfig: "[Ne] 3s² 3p⁶" },
  // Period 4
  { symbol: "K", name: "Potassium", number: 19, mass: 39.10, group: 1, period: 4, category: "alkali-metal", atomicRadius: 243, electronegativity: 0.82, ionizationEnergy: 419, electronAffinity: 48.4, electronConfig: "[Ar] 4s¹" },
  { symbol: "Ca", name: "Calcium", number: 20, mass: 40.08, group: 2, period: 4, category: "alkaline-earth", atomicRadius: 194, electronegativity: 1.00, ionizationEnergy: 590, electronAffinity: 2.37, electronConfig: "[Ar] 4s²" },
  { symbol: "Sc", name: "Scandium", number: 21, mass: 44.96, group: 3, period: 4, category: "transition-metal", atomicRadius: 184, electronegativity: 1.36, ionizationEnergy: 631, electronAffinity: 18.1, electronConfig: "[Ar] 3d¹ 4s²" },
  { symbol: "Ti", name: "Titanium", number: 22, mass: 47.87, group: 4, period: 4, category: "transition-metal", atomicRadius: 176, electronegativity: 1.54, ionizationEnergy: 658, electronAffinity: 7.6, electronConfig: "[Ar] 3d² 4s²" },
  { symbol: "V", name: "Vanadium", number: 23, mass: 50.94, group: 5, period: 4, category: "transition-metal", atomicRadius: 171, electronegativity: 1.63, ionizationEnergy: 650, electronAffinity: 50.6, electronConfig: "[Ar] 3d³ 4s²" },
  { symbol: "Cr", name: "Chromium", number: 24, mass: 52.00, group: 6, period: 4, category: "transition-metal", atomicRadius: 166, electronegativity: 1.66, ionizationEnergy: 653, electronAffinity: 64.3, electronConfig: "[Ar] 3d⁵ 4s¹" },
  { symbol: "Mn", name: "Manganese", number: 25, mass: 54.94, group: 7, period: 4, category: "transition-metal", atomicRadius: 161, electronegativity: 1.55, ionizationEnergy: 717, electronAffinity: 0, electronConfig: "[Ar] 3d⁵ 4s²" },
  { symbol: "Fe", name: "Iron", number: 26, mass: 55.85, group: 8, period: 4, category: "transition-metal", atomicRadius: 156, electronegativity: 1.83, ionizationEnergy: 762, electronAffinity: 15.7, electronConfig: "[Ar] 3d⁶ 4s²" },
  { symbol: "Co", name: "Cobalt", number: 27, mass: 58.93, group: 9, period: 4, category: "transition-metal", atomicRadius: 152, electronegativity: 1.88, ionizationEnergy: 760, electronAffinity: 63.7, electronConfig: "[Ar] 3d⁷ 4s²" },
  { symbol: "Ni", name: "Nickel", number: 28, mass: 58.69, group: 10, period: 4, category: "transition-metal", atomicRadius: 149, electronegativity: 1.91, ionizationEnergy: 737, electronAffinity: 111.5, electronConfig: "[Ar] 3d⁸ 4s²" },
  { symbol: "Cu", name: "Copper", number: 29, mass: 63.55, group: 11, period: 4, category: "transition-metal", atomicRadius: 145, electronegativity: 1.90, ionizationEnergy: 745, electronAffinity: 118.4, electronConfig: "[Ar] 3d¹⁰ 4s¹" },
  { symbol: "Zn", name: "Zinc", number: 30, mass: 65.38, group: 12, period: 4, category: "transition-metal", atomicRadius: 142, electronegativity: 1.65, ionizationEnergy: 906, electronAffinity: 0, electronConfig: "[Ar] 3d¹⁰ 4s²" },
  { symbol: "Ga", name: "Gallium", number: 31, mass: 69.72, group: 13, period: 4, category: "post-transition", atomicRadius: 136, electronegativity: 1.81, ionizationEnergy: 579, electronAffinity: 28.9, electronConfig: "[Ar] 3d¹⁰ 4s² 4p¹" },
  { symbol: "Ge", name: "Germanium", number: 32, mass: 72.63, group: 14, period: 4, category: "metalloid", atomicRadius: 125, electronegativity: 2.01, ionizationEnergy: 762, electronAffinity: 118.9, electronConfig: "[Ar] 3d¹⁰ 4s² 4p²" },
  { symbol: "As", name: "Arsenic", number: 33, mass: 74.92, group: 15, period: 4, category: "metalloid", atomicRadius: 114, electronegativity: 2.18, ionizationEnergy: 947, electronAffinity: 78, electronConfig: "[Ar] 3d¹⁰ 4s² 4p³" },
  { symbol: "Se", name: "Selenium", number: 34, mass: 78.96, group: 16, period: 4, category: "nonmetal", atomicRadius: 103, electronegativity: 2.55, ionizationEnergy: 941, electronAffinity: 195, electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁴" },
  { symbol: "Br", name: "Bromine", number: 35, mass: 79.90, group: 17, period: 4, category: "halogen", atomicRadius: 94, electronegativity: 2.96, ionizationEnergy: 1140, electronAffinity: 324.6, electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁵" },
  { symbol: "Kr", name: "Krypton", number: 36, mass: 83.80, group: 18, period: 4, category: "noble-gas", atomicRadius: 88, electronegativity: 3.00, ionizationEnergy: 1351, electronAffinity: 0, electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁶" },
  // Period 5
  { symbol: "Rb", name: "Rubidium", number: 37, mass: 85.47, group: 1, period: 5, category: "alkali-metal", atomicRadius: 265, electronegativity: 0.82, ionizationEnergy: 403, electronAffinity: 46.9, electronConfig: "[Kr] 5s¹" },
  { symbol: "Sr", name: "Strontium", number: 38, mass: 87.62, group: 2, period: 5, category: "alkaline-earth", atomicRadius: 219, electronegativity: 0.95, ionizationEnergy: 549, electronAffinity: 5.03, electronConfig: "[Kr] 5s²" },
  { symbol: "Y", name: "Yttrium", number: 39, mass: 88.91, group: 3, period: 5, category: "transition-metal", atomicRadius: 212, electronegativity: 1.22, ionizationEnergy: 600, electronAffinity: 29.6, electronConfig: "[Kr] 4d¹ 5s²" },
  { symbol: "Zr", name: "Zirconium", number: 40, mass: 91.22, group: 4, period: 5, category: "transition-metal", atomicRadius: 206, electronegativity: 1.33, ionizationEnergy: 640, electronAffinity: 41.1, electronConfig: "[Kr] 4d² 5s²" },
  { symbol: "Nb", name: "Niobium", number: 41, mass: 92.91, group: 5, period: 5, category: "transition-metal", atomicRadius: 198, electronegativity: 1.6, ionizationEnergy: 652, electronAffinity: 86.2, electronConfig: "[Kr] 4d⁴ 5s¹" },
  { symbol: "Mo", name: "Molybdenum", number: 42, mass: 95.94, group: 6, period: 5, category: "transition-metal", atomicRadius: 190, electronegativity: 2.16, ionizationEnergy: 684, electronAffinity: 71.9, electronConfig: "[Kr] 4d⁵ 5s¹" },
  { symbol: "Tc", name: "Technetium", number: 43, mass: 98, group: 7, period: 5, category: "transition-metal", atomicRadius: 183, electronegativity: 1.9, ionizationEnergy: 702, electronAffinity: 53, electronConfig: "[Kr] 4d⁵ 5s²" },
  { symbol: "Ru", name: "Ruthenium", number: 44, mass: 101.1, group: 8, period: 5, category: "transition-metal", atomicRadius: 178, electronegativity: 2.2, ionizationEnergy: 710, electronAffinity: 101.3, electronConfig: "[Kr] 4d⁷ 5s¹" },
  { symbol: "Rh", name: "Rhodium", number: 45, mass: 102.9, group: 9, period: 5, category: "transition-metal", atomicRadius: 173, electronegativity: 2.28, ionizationEnergy: 719, electronAffinity: 109.7, electronConfig: "[Kr] 4d⁸ 5s¹" },
  { symbol: "Pd", name: "Palladium", number: 46, mass: 106.4, group: 10, period: 5, category: "transition-metal", atomicRadius: 169, electronegativity: 2.20, ionizationEnergy: 804, electronAffinity: 54.2, electronConfig: "[Kr] 4d¹⁰" },
  { symbol: "Ag", name: "Silver", number: 47, mass: 107.9, group: 11, period: 5, category: "transition-metal", atomicRadius: 165, electronegativity: 1.93, ionizationEnergy: 731, electronAffinity: 125.6, electronConfig: "[Kr] 4d¹⁰ 5s¹" },
  { symbol: "Cd", name: "Cadmium", number: 48, mass: 112.4, group: 12, period: 5, category: "transition-metal", atomicRadius: 161, electronegativity: 1.69, ionizationEnergy: 867, electronAffinity: 0, electronConfig: "[Kr] 4d¹⁰ 5s²" },
  { symbol: "In", name: "Indium", number: 49, mass: 114.8, group: 13, period: 5, category: "post-transition", atomicRadius: 156, electronegativity: 1.78, ionizationEnergy: 558, electronAffinity: 28.9, electronConfig: "[Kr] 4d¹⁰ 5s² 5p¹" },
  { symbol: "Sn", name: "Tin", number: 50, mass: 118.7, group: 14, period: 5, category: "post-transition", atomicRadius: 145, electronegativity: 1.96, ionizationEnergy: 709, electronAffinity: 107.3, electronConfig: "[Kr] 4d¹⁰ 5s² 5p²" },
  { symbol: "Sb", name: "Antimony", number: 51, mass: 121.8, group: 15, period: 5, category: "metalloid", atomicRadius: 133, electronegativity: 2.05, ionizationEnergy: 834, electronAffinity: 100.9, electronConfig: "[Kr] 4d¹⁰ 5s² 5p³" },
  { symbol: "Te", name: "Tellurium", number: 52, mass: 127.6, group: 16, period: 5, category: "metalloid", atomicRadius: 123, electronegativity: 2.1, ionizationEnergy: 869, electronAffinity: 190.2, electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁴" },
  { symbol: "I", name: "Iodine", number: 53, mass: 126.9, group: 17, period: 5, category: "halogen", atomicRadius: 115, electronegativity: 2.66, ionizationEnergy: 1008, electronAffinity: 295.2, electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁵" },
  { symbol: "Xe", name: "Xenon", number: 54, mass: 131.3, group: 18, period: 5, category: "noble-gas", atomicRadius: 108, electronegativity: 2.6, ionizationEnergy: 1170, electronAffinity: 0, electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁶" },
  // Period 6
  { symbol: "Cs", name: "Cesium", number: 55, mass: 132.9, group: 1, period: 6, category: "alkali-metal", atomicRadius: 298, electronegativity: 0.79, ionizationEnergy: 376, electronAffinity: 45.5, electronConfig: "[Xe] 6s¹" },
  { symbol: "Ba", name: "Barium", number: 56, mass: 137.3, group: 2, period: 6, category: "alkaline-earth", atomicRadius: 253, electronegativity: 0.89, ionizationEnergy: 503, electronAffinity: 13.95, electronConfig: "[Xe] 6s²" },
  { symbol: "La", name: "Lanthanum", number: 57, mass: 138.9, group: 3, period: 6, category: "lanthanide", atomicRadius: 195, electronegativity: 1.10, ionizationEnergy: 538, electronAffinity: 48, electronConfig: "[Xe] 5d¹ 6s²" },
  { symbol: "Ce", name: "Cerium", number: 58, mass: 140.1, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.12, ionizationEnergy: 534, electronAffinity: 50, electronConfig: "[Xe] 4f¹ 5d¹ 6s²" },
  { symbol: "Pr", name: "Praseodymium", number: 59, mass: 140.9, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.13, ionizationEnergy: 527, electronAffinity: 50, electronConfig: "[Xe] 4f³ 6s²" },
  { symbol: "Nd", name: "Neodymium", number: 60, mass: 144.2, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.14, ionizationEnergy: 533, electronAffinity: 50, electronConfig: "[Xe] 4f⁴ 6s²" },
  { symbol: "Pm", name: "Promethium", number: 61, mass: 145, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.13, ionizationEnergy: 540, electronAffinity: 50, electronConfig: "[Xe] 4f⁵ 6s²" },
  { symbol: "Sm", name: "Samarium", number: 62, mass: 150.4, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.17, ionizationEnergy: 544, electronAffinity: 50, electronConfig: "[Xe] 4f⁶ 6s²" },
  { symbol: "Eu", name: "Europium", number: 63, mass: 152.0, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.2, ionizationEnergy: 547, electronAffinity: 50, electronConfig: "[Xe] 4f⁷ 6s²" },
  { symbol: "Gd", name: "Gadolinium", number: 64, mass: 157.3, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.20, ionizationEnergy: 593, electronAffinity: 50, electronConfig: "[Xe] 4f⁷ 5d¹ 6s²" },
  { symbol: "Tb", name: "Terbium", number: 65, mass: 158.9, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.2, ionizationEnergy: 565, electronAffinity: 50, electronConfig: "[Xe] 4f⁹ 6s²" },
  { symbol: "Dy", name: "Dysprosium", number: 66, mass: 162.5, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.22, ionizationEnergy: 572, electronAffinity: 50, electronConfig: "[Xe] 4f¹⁰ 6s²" },
  { symbol: "Ho", name: "Holmium", number: 67, mass: 164.9, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.23, ionizationEnergy: 581, electronAffinity: 50, electronConfig: "[Xe] 4f¹¹ 6s²" },
  { symbol: "Er", name: "Erbium", number: 68, mass: 167.3, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.24, ionizationEnergy: 589, electronAffinity: 50, electronConfig: "[Xe] 4f¹² 6s²" },
  { symbol: "Tm", name: "Thulium", number: 69, mass: 168.9, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.25, ionizationEnergy: 597, electronAffinity: 50, electronConfig: "[Xe] 4f¹³ 6s²" },
  { symbol: "Yb", name: "Ytterbium", number: 70, mass: 173.0, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.1, ionizationEnergy: 603, electronAffinity: 50, electronConfig: "[Xe] 4f¹⁴ 6s²" },
  { symbol: "Lu", name: "Lutetium", number: 71, mass: 175.0, group: 3, period: 6, category: "lanthanide", atomicRadius: 185, electronegativity: 1.27, ionizationEnergy: 524, electronAffinity: 50, electronConfig: "[Xe] 4f¹⁴ 5d¹ 6s²" },
  { symbol: "Hf", name: "Hafnium", number: 72, mass: 178.5, group: 4, period: 6, category: "transition-metal", atomicRadius: 208, electronegativity: 1.3, ionizationEnergy: 658, electronAffinity: 0, electronConfig: "[Xe] 4f¹⁴ 5d² 6s²" },
  { symbol: "Ta", name: "Tantalum", number: 73, mass: 180.9, group: 5, period: 6, category: "transition-metal", atomicRadius: 200, electronegativity: 1.5, ionizationEnergy: 761, electronAffinity: 31.1, electronConfig: "[Xe] 4f¹⁴ 5d³ 6s²" },
  { symbol: "W", name: "Tungsten", number: 74, mass: 183.8, group: 6, period: 6, category: "transition-metal", atomicRadius: 193, electronegativity: 2.36, ionizationEnergy: 770, electronAffinity: 78.6, electronConfig: "[Xe] 4f¹⁴ 5d⁴ 6s²" },
  { symbol: "Re", name: "Rhenium", number: 75, mass: 186.2, group: 7, period: 6, category: "transition-metal", atomicRadius: 188, electronegativity: 1.9, ionizationEnergy: 760, electronAffinity: 14.5, electronConfig: "[Xe] 4f¹⁴ 5d⁵ 6s²" },
  { symbol: "Os", name: "Osmium", number: 76, mass: 190.2, group: 8, period: 6, category: "transition-metal", atomicRadius: 185, electronegativity: 2.2, ionizationEnergy: 840, electronAffinity: 80.8, electronConfig: "[Xe] 4f¹⁴ 5d⁶ 6s²" },
  { symbol: "Ir", name: "Iridium", number: 77, mass: 192.2, group: 9, period: 6, category: "transition-metal", atomicRadius: 180, electronegativity: 2.20, ionizationEnergy: 880, electronAffinity: 150.9, electronConfig: "[Xe] 4f¹⁴ 5d⁷ 6s²" },
  { symbol: "Pt", name: "Platinum", number: 78, mass: 195.1, group: 10, period: 6, category: "transition-metal", atomicRadius: 177, electronegativity: 2.28, ionizationEnergy: 870, electronAffinity: 205.3, electronConfig: "[Xe] 4f¹⁴ 5d⁹ 6s¹" },
  { symbol: "Au", name: "Gold", number: 79, mass: 197.0, group: 11, period: 6, category: "transition-metal", atomicRadius: 174, electronegativity: 2.54, ionizationEnergy: 890, electronAffinity: 222.8, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹" },
  { symbol: "Hg", name: "Mercury", number: 80, mass: 200.6, group: 12, period: 6, category: "transition-metal", atomicRadius: 171, electronegativity: 2.00, ionizationEnergy: 1007, electronAffinity: 0, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s²" },
  { symbol: "Tl", name: "Thallium", number: 81, mass: 204.4, group: 13, period: 6, category: "post-transition", atomicRadius: 170, electronegativity: 1.62, ionizationEnergy: 589, electronAffinity: 19.3, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹" },
  { symbol: "Pb", name: "Lead", number: 82, mass: 207.2, group: 14, period: 6, category: "post-transition", atomicRadius: 175, electronegativity: 2.33, ionizationEnergy: 716, electronAffinity: 35.1, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²" },
  { symbol: "Bi", name: "Bismuth", number: 83, mass: 209.0, group: 15, period: 6, category: "post-transition", atomicRadius: 160, electronegativity: 2.02, ionizationEnergy: 703, electronAffinity: 91.3, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³" },
  { symbol: "Po", name: "Polonium", number: 84, mass: 209, group: 16, period: 6, category: "metalloid", atomicRadius: 153, electronegativity: 2.0, ionizationEnergy: 812, electronAffinity: 183.3, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴" },
  { symbol: "At", name: "Astatine", number: 85, mass: 210, group: 17, period: 6, category: "halogen", atomicRadius: 150, electronegativity: 2.2, ionizationEnergy: 890, electronAffinity: 270, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵" },
  { symbol: "Rn", name: "Radon", number: 86, mass: 222, group: 18, period: 6, category: "noble-gas", atomicRadius: 145, electronegativity: 2.2, ionizationEnergy: 1041, electronAffinity: 0, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶" },
  // Period 7
  { symbol: "Fr", name: "Francium", number: 87, mass: 223, group: 1, period: 7, category: "alkali-metal", atomicRadius: 300, electronegativity: 0.7, ionizationEnergy: 380, electronAffinity: 44, electronConfig: "[Rn] 7s¹" },
  { symbol: "Ra", name: "Radium", number: 88, mass: 226, group: 2, period: 7, category: "alkaline-earth", atomicRadius: 248, electronegativity: 0.9, ionizationEnergy: 509, electronAffinity: 10, electronConfig: "[Rn] 7s²" },
  { symbol: "Ac", name: "Actinium", number: 89, mass: 227, group: 3, period: 7, category: "actinide", atomicRadius: 215, electronegativity: 1.1, ionizationEnergy: 490, electronAffinity: 35, electronConfig: "[Rn] 6d¹ 7s²" },
  { symbol: "Th", name: "Thorium", number: 90, mass: 232.0, group: 3, period: 7, category: "actinide", atomicRadius: 206, electronegativity: 1.3, ionizationEnergy: 590, electronAffinity: 0, electronConfig: "[Rn] 6d² 7s²" },
  { symbol: "Pa", name: "Protactinium", number: 91, mass: 231.0, group: 3, period: 7, category: "actinide", atomicRadius: 200, electronegativity: 1.5, ionizationEnergy: 570, electronAffinity: 50, electronConfig: "[Rn] 5f² 6d¹ 7s²" },
  { symbol: "U", name: "Uranium", number: 92, mass: 238.0, group: 3, period: 7, category: "actinide", atomicRadius: 196, electronegativity: 1.38, ionizationEnergy: 598, electronAffinity: 0, electronConfig: "[Rn] 5f³ 6d¹ 7s²" },
  { symbol: "Np", name: "Neptunium", number: 93, mass: 237, group: 3, period: 7, category: "actinide", atomicRadius: 190, electronegativity: 1.36, ionizationEnergy: 600, electronAffinity: 0, electronConfig: "[Rn] 5f⁴ 6d¹ 7s²" },
  { symbol: "Pu", name: "Plutonium", number: 94, mass: 244, group: 3, period: 7, category: "actinide", atomicRadius: 187, electronegativity: 1.28, ionizationEnergy: 585, electronAffinity: 0, electronConfig: "[Rn] 5f⁶ 7s²" },
  { symbol: "Am", name: "Americium", number: 95, mass: 243, group: 3, period: 7, category: "actinide", atomicRadius: 180, electronegativity: 1.13, ionizationEnergy: 578, electronAffinity: 0, electronConfig: "[Rn] 5f⁷ 7s²" },
  { symbol: "Cm", name: "Curium", number: 96, mass: 247, group: 3, period: 7, category: "actinide", atomicRadius: 175, electronegativity: 1.28, ionizationEnergy: 581, electronAffinity: 0, electronConfig: "[Rn] 5f⁷ 6d¹ 7s²" },
  { symbol: "Bk", name: "Berkelium", number: 97, mass: 247, group: 3, period: 7, category: "actinide", atomicRadius: 170, electronegativity: 1.3, ionizationEnergy: 601, electronAffinity: 0, electronConfig: "[Rn] 5f⁹ 7s²" },
  { symbol: "Cf", name: "Californium", number: 98, mass: 251, group: 3, period: 7, category: "actinide", atomicRadius: 165, electronegativity: 1.3, ionizationEnergy: 608, electronAffinity: 0, electronConfig: "[Rn] 5f¹⁰ 7s²" },
];

export interface PeriodicTrendsData {
  selectedElement: ElementData | null;
  trendType: TrendType;
  trendValue: number;
  trendName: string;
  trendDescription: string;
  minValue: number;
  maxValue: number;
  hoveredElement: ElementData | null;
}

export type TrendType = "atomicRadius" | "electronegativity" | "ionizationEnergy" | "electronAffinity";

export interface PeriodicTrendsSceneProps {
  trendType: TrendType;
  animationSpeed: number;
  isPlaying: boolean;
  showCategories: boolean;
  highlightPeriod: number | null;
  highlightGroup: number | null;
  onDataChange?: (data: PeriodicTrendsData) => void;
  onElementClick?: (element: ElementData) => void;
}

// Category colors
const CATEGORY_COLORS: Record<ElementData["category"], string> = {
  "alkali-metal": "#ef4444",      // red
  "alkaline-earth": "#f97316",    // orange
  "transition-metal": "#eab308",  // yellow
  "post-transition": "#22c55e",   // green
  "metalloid": "#14b8a6",         // teal
  "nonmetal": "#3b82f6",          // blue
  "halogen": "#a855f7",           // purple
  "noble-gas": "#ec4899",         // pink
  "lanthanide": "#6b7280",        // gray
  "actinide": "#4b5563",          // darker gray
};

// Trend information
const TRENDS: Record<TrendType, { name: string; unit: string; description: string; min: number; max: number }> = {
  atomicRadius: {
    name: "Atomic Radius",
    unit: "pm",
    description: "The size of an atom, typically measured from the nucleus to the outermost electron. Decreases across a period (more protons pull electrons in) and increases down a group (more electron shells).",
    min: 30,
    max: 300
  },
  electronegativity: {
    name: "Electronegativity",
    unit: "Pauling",
    description: "A measure of an atom's ability to attract shared electrons in a chemical bond. Increases across a period and decreases down a group. Fluorine is the most electronegative element.",
    min: 0,
    max: 4
  },
  ionizationEnergy: {
    name: "Ionization Energy",
    unit: "kJ/mol",
    description: "The energy required to remove an electron from a gaseous atom. Increases across a period (stronger nuclear attraction) and decreases down a group (electrons farther from nucleus).",
    min: 300,
    max: 2400
  },
  electronAffinity: {
    name: "Electron Affinity",
    unit: "kJ/mol",
    description: "The energy change when an electron is added to a neutral atom. Generally becomes more negative (more favorable) across a period, with halogens having the highest affinity.",
    min: -50,
    max: 350
  }
};

// Element box component
interface ElementBoxProps {
  element: ElementData;
  position: [number, number, number];
  height: number;
  color: string;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  onClick: () => void;
  onHover: () => void;
  trendType: TrendType;
}

function ElementBox({ element, position, height, color, isSelected, isHighlighted, isDimmed, onClick, onHover, trendType }: ElementBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const baseHeight = 0.3;
  const totalHeight = baseHeight + height;
  const width = 0.85;
  const depth = 0.85;

  // Animate height on hover/selection
  const targetHeight = isSelected ? totalHeight * 1.2 : (hovered || isHighlighted) ? totalHeight * 1.1 : totalHeight;

  useFrame(() => {
    if (meshRef.current) {
      const currentScale = meshRef.current.scale.y;
      const diff = (targetHeight / baseHeight) - currentScale;
      meshRef.current.scale.y += diff * 0.1;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation?.();
    onClick();
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation?.();
    setHovered(true);
    onHover();
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation?.();
    setHovered(false);
  };

  const opacity = isDimmed ? 0.3 : 1;
  const emissiveIntensity = isSelected ? 0.8 : (hovered || isHighlighted) ? 0.5 : 0.2;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        position={[0, totalHeight / 2 - baseHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, baseHeight, depth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Text label */}
      <Text
        position={[0, totalHeight + 0.3, 0]}
        fontSize={0.25}
        color={isSelected ? "#ffffff" : "#eeeeee"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/bold.ttf"
      >
        {element.symbol}
      </Text>
      <Text
        position={[0, totalHeight + 0.55, 0]}
        fontSize={0.12}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        {element.number}
      </Text>

      {/* Glow effect for selected */}
      {isSelected && (
        <mesh position={[0, totalHeight / 2 - baseHeight / 2, 0]}>
          <boxGeometry args={[width * 1.1, baseHeight * 1.1, depth * 1.1]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

// Main scene component
export function PeriodicTrendsScene({
  trendType,
  animationSpeed,
  isPlaying,
  showCategories,
  highlightPeriod,
  highlightGroup,
  onDataChange,
  onElementClick
}: PeriodicTrendsSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, raycaster, pointer } = useThree();

  // Performance refs - updated every frame
  const frameCountRef = useRef(0);
  const rotationRef = useRef(0);

  // State refs - for tracking
  const selectedElementRef = useRef<ElementData | null>(ELEMENTS[5]); // Carbon
  const hoveredElementRef = useRef<ElementData | null>(null);

  // React state - updated every 8 frames
  const [data, setData] = useState<PeriodicTrendsData>({
    selectedElement: ELEMENTS[5],
    trendType,
    trendValue: ELEMENTS[5].atomicRadius,
    trendName: TRENDS.atomicRadius.name,
    trendDescription: TRENDS.atomicRadius.description,
    minValue: TRENDS.atomicRadius.min,
    maxValue: TRENDS.atomicRadius.max,
    hoveredElement: null,
  });

  // Get trend value for element
  const getTrendValue = useCallback((element: ElementData): number => {
    switch (trendType) {
      case "atomicRadius": return element.atomicRadius;
      case "electronegativity": return element.electronegativity;
      case "ionizationEnergy": return element.ionizationEnergy;
      case "electronAffinity": return element.electronAffinity;
      default: return element.atomicRadius;
    }
  }, [trendType]);

  // Calculate position for element in periodic table
  const getElementPosition = useCallback((element: ElementData): [number, number, number] => {
    let x: number, z: number;

    if (element.category === "lanthanide") {
      x = (element.number - 57) * 0.9 - 8;
      z = 8;
    } else if (element.category === "actinide") {
      x = (element.number - 89) * 0.9 - 8;
      z = 9;
    } else {
      x = (element.group - 9) * 0.95;
      z = (3.5 - element.period) * 0.95;
    }

    return [x, 0, z];
  }, []);

  // Check if element should be highlighted
  const isElementHighlighted = useCallback((element: ElementData): boolean => {
    if (highlightPeriod !== null && element.period === highlightPeriod) return true;
    if (highlightGroup !== null && element.group === highlightGroup) return true;
    return false;
  }, [highlightPeriod, highlightGroup]);

  // Check if element should be dimmed
  const isElementDimmed = useCallback((element: ElementData): boolean => {
    if (!showCategories) return false;
    if (highlightPeriod !== null && element.period !== highlightPeriod) return true;
    if (highlightGroup !== null && element.group !== highlightGroup) return true;
    return false;
  }, [showCategories, highlightPeriod, highlightGroup]);

  // Handle element click
  const handleElementClick = useCallback((element: ElementData) => {
    selectedElementRef.current = element;
    onElementClick?.(element);
  }, [onElementClick]);

  // Handle element hover
  const handleElementHover = useCallback((element: ElementData) => {
    hoveredElementRef.current = element;
  }, []);

  // Calculate normalized height for visualization
  const getElementHeight = useCallback((element: ElementData): number => {
    const value = getTrendValue(element);
    const trend = TRENDS[trendType];
    const normalized = (value - trend.min) / (trend.max - trend.min);
    return normalized * 5; // Max height of 5 units
  }, [trendType, getTrendValue]);

  // Animation frame
  useFrame((_, delta) => {
    if (!isPlaying) return;

    rotationRef.current += delta * animationSpeed * 0.05;

    // Subtle rotation of entire table
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(rotationRef.current * 0.2) * 0.1;
    }

    frameCountRef.current++;

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const selected = selectedElementRef.current;
      const hovered = hoveredElementRef.current;
      const trendInfo = TRENDS[trendType];

      if (selected) {
        const newData: PeriodicTrendsData = {
          selectedElement: selected,
          trendType,
          trendValue: getTrendValue(selected),
          trendName: trendInfo.name,
          trendDescription: trendInfo.description,
          minValue: trendInfo.min,
          maxValue: trendInfo.max,
          hoveredElement: hovered,
        };

        setData(newData);
        onDataChange?.(newData);
      }
    }
  });

  // Update data when trend type changes
  useEffect(() => {
    const selected = selectedElementRef.current;
    if (selected) {
      const trendInfo = TRENDS[trendType];
      const newData: PeriodicTrendsData = {
        selectedElement: selected,
        trendType,
        trendValue: getTrendValue(selected),
        trendName: trendInfo.name,
        trendDescription: trendInfo.description,
        minValue: trendInfo.min,
        maxValue: trendInfo.max,
        hoveredElement: hoveredElementRef.current,
      };
      setData(newData);
      onDataChange?.(newData);
    }
  }, [trendType, getTrendValue, onDataChange]);

  // Generate element boxes
  const elementBoxes = useMemo(() => {
    return ELEMENTS.map((element) => {
      const position = getElementPosition(element);
      const color = CATEGORY_COLORS[element.category];
      const height = getElementHeight(element);
      const isSelected = selectedElementRef.current?.number === element.number;
      const isHighlighted = isElementHighlighted(element);
      const isDimmed = isElementDimmed(element);

      return (
        <ElementBox
          key={element.symbol}
          element={element}
          position={position}
          height={height}
          color={color}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
          isDimmed={isDimmed}
          onClick={() => handleElementClick(element)}
          onHover={() => handleElementHover(element)}
          trendType={trendType}
        />
      );
    });
  }, [trendType, getElementPosition, getElementHeight, isElementHighlighted, isElementDimmed, handleElementClick, handleElementHover]);

  // Generate connecting lines for 3D effect
  const connectingLines = useMemo(() => {
    return ELEMENTS.map((element) => {
      const position = getElementPosition(element);
      const height = getElementHeight(element);
      const color = CATEGORY_COLORS[element.category];
      const isDimmed = isElementDimmed(element);

      return (
        <Line
          key={`line-${element.symbol}`}
          points={[[position[0], 0, position[2]], [position[0], height, position[2]]]}
          color={color}
          lineWidth={1}
          opacity={isDimmed ? 0.1 : 0.3}
          transparent
        />
      );
    });
  }, [trendType, getElementPosition, getElementHeight, isElementDimmed]);

  return (
    <group ref={groupRef}>
      {/* Ground plane with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <meshStandardMaterial color="#0a0a1e" roughness={0.9} metalness={0.1} />
      </mesh>

      <gridHelper args={[28, 28, "#1a1a3e", "#1a1a3e"]} position={[0, -0.04, 0]} />

      {/* Period and Group labels */}
      {[1, 2, 3, 4, 5, 6, 7].map((period) => (
        <Text
          key={`period-${period}`}
          position={[-11, 0.1, (3.5 - period) * 0.95]}
          fontSize={0.15}
          color="#4b5563"
          anchorX="center"
          anchorY="middle"
        >
          {period}
        </Text>
      ))}

      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((group) => (
        <Text
          key={`group-${group}`}
          position={[(group - 9) * 0.95, 0.1, 5]}
          fontSize={0.12}
          color="#4b5563"
          anchorX="center"
          anchorY="middle"
        >
          {group}
        </Text>
      ))}

      {/* Lanthanides/Actinides label */}
      <Text
        position={[-8, 0.1, 8.5]}
        fontSize={0.12}
        color="#6b7280"
        anchorX="left"
        anchorY="middle"
      >
        Lanthanides
      </Text>
      <Text
        position={[-8, 0.1, 9.5]}
        fontSize={0.12}
        color="#6b7280"
        anchorX="left"
        anchorY="middle"
      >
        Actinides
      </Text>

      {/* Element boxes */}
      {elementBoxes}

      {/* Vertical trend lines */}
      {connectingLines}
    </group>
  );
}

export default PeriodicTrendsScene;
