/**
 * Shared physics calculations for Science Lab 3D experiments
 * All values in SI units unless otherwise noted
 */

// ============================================
// CONSTANTS
// ============================================

export const PHYSICS_CONSTANTS = {
  G: 6.674e-11, // Gravitational constant (m³/kg·s²)
  g: 9.81, // Standard gravity (m/s²)
  c: 299792458, // Speed of light (m/s)
  R: 8.314, // Universal gas constant (J/mol·K)
  k_B: 1.381e-23, // Boltzmann constant (J/K)
  h: 6.626e-34, // Planck constant (J·s)
  e: 1.602e-19, // Elementary charge (C)
  m_e: 9.109e-31, // Electron mass (kg)
  m_p: 1.673e-27, // Proton mass (kg)
  epsilon_0: 8.854e-12, // Vacuum permittivity (F/m)
  mu_0: 4 * Math.PI * 1e-7, // Vacuum permeability (H/m)
} as const;

// ============================================
// PENDULUM PHYSICS
// ============================================

/**
 * Calculate the period of a simple pendulum
 * T = 2π√(L/g)
 * @param L - Length of pendulum (m)
 * @param g - Gravitational acceleration (m/s²)
 * @returns Period in seconds
 */
export function calculatePendulumPeriod(L: number, g: number = PHYSICS_CONSTANTS.g): number {
  return 2 * Math.PI * Math.sqrt(L / g);
}

/**
 * Calculate the frequency of a simple pendulum
 * f = 1/T = (1/2π)√(g/L)
 * @param L - Length of pendulum (m)
 * @param g - Gravitational acceleration (m/s²)
 * @returns Frequency in Hz
 */
export function calculatePendulumFrequency(L: number, g: number = PHYSICS_CONSTANTS.g): number {
  return 1 / calculatePendulumPeriod(L, g);
}

/**
 * Calculate the angular frequency of a simple pendulum
 * ω = √(g/L)
 * @param L - Length of pendulum (m)
 * @param g - Gravitational acceleration (m/s²)
 * @returns Angular frequency (rad/s)
 */
export function calculatePendulumAngularFrequency(
  L: number,
  g: number = PHYSICS_CONSTANTS.g
): number {
  return Math.sqrt(g / L);
}

/**
 * Calculate pendulum potential energy
 * PE = mgh = mgL(1 - cos(θ))
 * @param m - Mass (kg)
 * @param g - Gravitational acceleration (m/s²)
 * @param L - Length (m)
 * @param theta - Angle from vertical (rad)
 * @returns Potential energy (J)
 */
export function calculatePendulumPE(
  m: number,
  g: number,
  L: number,
  theta: number
): number {
  return m * g * L * (1 - Math.cos(theta));
}

/**
 * Calculate pendulum kinetic energy
 * KE = ½mv² = ½mL²(dθ/dt)²
 * @param m - Mass (kg)
 * @param L - Length (m)
 * @param omega - Angular velocity (rad/s)
 * @returns Kinetic energy (J)
 */
export function calculatePendulumKE(m: number, L: number, omega: number): number {
  return 0.5 * m * L * L * omega * omega;
}

// ============================================
// PROJECTILE MOTION
// ============================================

/**
 * Calculate horizontal range of projectile
 * R = v₀²sin(2θ)/g
 * @param v0 - Initial velocity (m/s)
 * @param theta - Launch angle (rad)
 * @param g - Gravitational acceleration (m/s²)
 * @returns Range (m)
 */
export function calculateRange(v0: number, theta: number, g: number = PHYSICS_CONSTANTS.g): number {
  return (v0 * v0 * Math.sin(2 * theta)) / g;
}

/**
 * Calculate maximum height of projectile
 * H = v₀²sin²θ/(2g)
 * @param v0 - Initial velocity (m/s)
 * @param theta - Launch angle (rad)
 * @param g - Gravitational acceleration (m/s²)
 * @returns Maximum height (m)
 */
export function calculateMaxHeight(
  v0: number,
  theta: number,
  g: number = PHYSICS_CONSTANTS.g
): number {
  return (v0 * v0 * Math.sin(theta) * Math.sin(theta)) / (2 * g);
}

/**
 * Calculate time of flight
 * T = 2v₀sinθ/g
 * @param v0 - Initial velocity (m/s)
 * @param theta - Launch angle (rad)
 * @param g - Gravitational acceleration (m/s²)
 * @returns Time of flight (s)
 */
export function calculateTimeOfFlight(
  v0: number,
  theta: number,
  g: number = PHYSICS_CONSTANTS.g
): number {
  return (2 * v0 * Math.sin(theta)) / g;
}

/**
 * Calculate projectile position at time t
 * @param v0 - Initial velocity (m/s)
 * @param theta - Launch angle (rad)
 * @param t - Time (s)
 * @param g - Gravitational acceleration (m/s²)
 * @returns Position {x, y}
 */
export function calculateProjectilePosition(
  v0: number,
  theta: number,
  t: number,
  g: number = PHYSICS_CONSTANTS.g
): { x: number; y: number } {
  const vx = v0 * Math.cos(theta);
  const vy = v0 * Math.sin(theta);
  return {
    x: vx * t,
    y: vy * t - 0.5 * g * t * t,
  };
}

/**
 * Calculate projectile velocity at time t with air resistance
 * @param v0 - Initial velocity (m/s)
 * @param theta - Launch angle (rad)
 * @param t - Time (s)
 * @param dragCoeff - Drag coefficient
 * @param g - Gravitational acceleration (m/s²)
 * @returns Velocity {vx, vy}
 */
export function calculateProjectileVelocityWithDrag(
  v0: number,
  theta: number,
  t: number,
  dragCoeff: number,
  g: number = PHYSICS_CONSTANTS.g
): { vx: number; vy: number } {
  const vx0 = v0 * Math.cos(theta);
  const vy0 = v0 * Math.sin(theta);

  // Simplified drag model
  const vx = vx0 * Math.exp(-dragCoeff * t);
  const vy = (vy0 + g / dragCoeff) * Math.exp(-dragCoeff * t) - g / dragCoeff;

  return { vx, vy };
}

// ============================================
// SPRING-MASS SYSTEM
// ============================================

/**
 * Calculate period of spring-mass oscillator
 * T = 2π√(m/k)
 * @param m - Mass (kg)
 * @param k - Spring constant (N/m)
 * @returns Period (s)
 */
export function calculateSpringPeriod(m: number, k: number): number {
  return 2 * Math.PI * Math.sqrt(m / k);
}

/**
 * Calculate angular frequency of spring-mass system
 * ω = √(k/m)
 * @param m - Mass (kg)
 * @param k - Spring constant (N/m)
 * @returns Angular frequency (rad/s)
 */
export function calculateSpringAngularFrequency(m: number, k: number): number {
  return Math.sqrt(k / m);
}

/**
 * Calculate spring potential energy
 * PE = ½kx²
 * @param k - Spring constant (N/m)
 * @param x - Displacement from equilibrium (m)
 * @returns Potential energy (J)
 */
export function calculateSpringPE(k: number, x: number): number {
  return 0.5 * k * x * x;
}

/**
 * Calculate kinetic energy
 * KE = ½mv²
 * @param m - Mass (kg)
 * @param v - Velocity (m/s)
 * @returns Kinetic energy (J)
 */
export function calculateKineticEnergy(m: number, v: number): number {
  return 0.5 * m * v * v;
}

// ============================================
// GAS LAWS (IDEAL GAS)
// ============================================

/**
 * Calculate pressure using ideal gas law
 * P = nRT/V
 * @param n - Moles of gas
 * @param R - Universal gas constant (J/mol·K)
 * @param T - Temperature (K)
 * @param V - Volume (m³)
 * @returns Pressure (Pa)
 */
export function calculateGasPressure(
  n: number,
  R: number = PHYSICS_CONSTANTS.R,
  T: number,
  V: number
): number {
  return (n * R * T) / V;
}

/**
 * Calculate temperature from pressure using ideal gas law
 * T = PV/(nR)
 * @param P - Pressure (Pa)
 * @param V - Volume (m³)
 * @param n - Moles of gas
 * @param R - Universal gas constant (J/mol·K)
 * @returns Temperature (K)
 */
export function calculateGasTemperature(
  P: number,
  V: number,
  n: number,
  R: number = PHYSICS_CONSTANTS.R
): number {
  return (P * V) / (n * R);
}

/**
 * Calculate average kinetic energy of gas particles
 * KE_avg = (3/2)kT
 * @param T - Temperature (K)
 * @param k_B - Boltzmann constant (J/K)
 * @returns Average kinetic energy (J)
 */
export function calculateGasAverageKE(T: number, k_B: number = PHYSICS_CONSTANTS.k_B): number {
  return 1.5 * k_B * T;
}

/**
 * Calculate root-mean-square speed of gas particles
 * v_rms = √(3kT/m) = √(3RT/M)
 * @param T - Temperature (K)
 * @param molarMass - Molar mass (kg/mol)
 * @param R - Universal gas constant (J/mol·K)
 * @returns RMS speed (m/s)
 */
export function calculateGasRMS(
  T: number,
  molarMass: number,
  R: number = PHYSICS_CONSTANTS.R
): number {
  return Math.sqrt((3 * R * T) / molarMass);
}

// ============================================
// WAVE PHYSICS
// ============================================

/**
 * Calculate wave speed from frequency and wavelength
 * v = fλ
 * @param frequency - Frequency (Hz)
 * @param wavelength - Wavelength (m)
 * @returns Wave speed (m/s)
 */
export function calculateWaveSpeed(frequency: number, wavelength: number): number {
  return frequency * wavelength;
}

/**
 * Calculate wavelength from wave speed and frequency
 * λ = v/f
 * @param waveSpeed - Wave speed (m/s)
 * @param frequency - Frequency (Hz)
 * @returns Wavelength (m)
 */
export function calculateWavelength(waveSpeed: number, frequency: number): number {
  return waveSpeed / frequency;
}

/**
 * Calculate Doppler shifted frequency (moving source, stationary observer)
 * f' = f(v/(v±vs))
 * @param f - Source frequency (Hz)
 * @param v - Wave speed (m/s)
 * @param vs - Source velocity (m/s) (positive = moving away, negative = approaching)
 * @returns Observed frequency (Hz)
 */
export function calculateDopplerFrequency(f: number, v: number, vs: number): number {
  return f * (v / (v + vs));
}

/**
 * Calculate wave number
 * k = 2π/λ
 * @param wavelength - Wavelength (m)
 * @returns Wave number (rad/m)
 */
export function calculateWaveNumber(wavelength: number): number {
  return (2 * Math.PI) / wavelength;
}

/**
 * Calculate angular frequency
 * ω = 2πf
 * @param frequency - Frequency (Hz)
 * @returns Angular frequency (rad/s)
 */
export function calculateAngularFrequency(frequency: number): number {
  return 2 * Math.PI * frequency;
}

// ============================================
// OPTICS (REFRACTION & REFLECTION)
// ============================================

/**
 * Calculate refraction angle using Snell's Law
 * n₁sin(θ₁) = n₂sin(θ₂)
 * @param n1 - Refractive index of medium 1
 * @param theta1 - Incident angle (rad)
 * @param n2 - Refractive index of medium 2
 * @returns Refraction angle (rad), or null if total internal reflection
 */
export function calculateRefractionAngle(
  n1: number,
  theta1: number,
  n2: number
): number | null {
  const sinTheta2 = (n1 / n2) * Math.sin(theta1);
  if (Math.abs(sinTheta2) > 1) {
    return null; // Total internal reflection
  }
  return Math.asin(sinTheta2);
}

/**
 * Calculate critical angle for total internal reflection
 * θc = arcsin(n₂/n₁)
 * @param n1 - Refractive index of denser medium
 * @param n2 - Refractive index of less dense medium
 * @returns Critical angle (rad), or null if n1 < n2 (no TIR possible)
 */
export function calculateCriticalAngle(n1: number, n2: number): number | null {
  if (n1 < n2) return null;
  return Math.asin(n2 / n1);
}

/**
 * Calculate reflectance using Fresnel equations (simplified)
 * @param n1 - Refractive index of medium 1
 * @param n2 - Refractive index of medium 2
 * @param theta1 - Incident angle (rad)
 * @returns Reflectance (0-1)
 */
export function calculateReflectance(n1: number, n2: number, theta1: number): number {
  const sinTheta2 = (n1 / n2) * Math.sin(theta1);

  // Check for total internal reflection
  if (Math.abs(sinTheta2) > 1) {
    return 1;
  }

  const theta2 = Math.asin(sinTheta2);
  const cosTheta1 = Math.cos(theta1);
  const cosTheta2 = Math.cos(theta2);

  // s-polarized light
  const Rs = Math.pow((n1 * cosTheta1 - n2 * cosTheta2) / (n1 * cosTheta1 + n2 * cosTheta2), 2);

  // p-polarized light
  const Rp = Math.pow((n1 * cosTheta2 - n2 * cosTheta1) / (n1 * cosTheta2 + n2 * cosTheta1), 2);

  // Average for unpolarized light
  return (Rs + Rp) / 2;
}

/**
 * Calculate transmittance
 * T = 1 - R
 * @param n1 - Refractive index of medium 1
 * @param n2 - Refractive index of medium 2
 * @param theta1 - Incident angle (rad)
 * @returns Transmittance (0-1)
 */
export function calculateTransmittance(n1: number, n2: number, theta1: number): number {
  return 1 - calculateReflectance(n1, n2, theta1);
}

/**
 * Calculate the refracted angle using Snell's Law (alias with different parameter order)
 * n₁sin(θ₁) = n₂sin(θ₂)
 * @param theta1 - Incident angle in radians
 * @param n1 - Refractive index of medium 1
 * @param n2 - Refractive index of medium 2
 * @returns Refracted angle in radians, or null if total internal reflection occurs
 */
export function calculateSnellsLaw(theta1: number, n1: number, n2: number): number | null {
  return calculateRefractionAngle(n1, theta1, n2);
}

// ============================================
// GRAVITATIONAL ORBITS
// ============================================

/**
 * Calculate gravitational force between two masses
 * F = G*m1*m2/r²
 * @param m1 - Mass 1 (kg)
 * @param m2 - Mass 2 (kg)
 * @param r - Distance between centers (m)
 * @param G - Gravitational constant (m³/kg·s²)
 * @returns Force magnitude (N)
 */
export function calculateGravitationalForce(
  m1: number,
  m2: number,
  r: number,
  G: number = PHYSICS_CONSTANTS.G
): number {
  return (G * m1 * m2) / (r * r);
}

/**
 * Calculate escape velocity
 * ve = √(2GM/r)
 * @param M - Mass of central body (kg)
 * @param r - Distance from center (m)
 * @param G - Gravitational constant (m³/kg·s²)
 * @returns Escape velocity (m/s)
 */
export function calculateEscapeVelocity(
  M: number,
  r: number,
  G: number = PHYSICS_CONSTANTS.G
): number {
  return Math.sqrt((2 * G * M) / r);
}

/**
 * Calculate orbital velocity for circular orbit
 * v = √(GM/r)
 * @param M - Mass of central body (kg)
 * @param r - Orbital radius (m)
 * @param G - Gravitational constant (m³/kg·s²)
 * @returns Orbital velocity (m/s)
 */
export function calculateOrbitalVelocity(
  M: number,
  r: number,
  G: number = PHYSICS_CONSTANTS.G
): number {
  return Math.sqrt((G * M) / r);
}

/**
 * Calculate orbital period for circular orbit
 * T = 2π√(r³/GM)
 * @param r - Orbital radius (m)
 * @param M - Mass of central body (kg)
 * @param G - Gravitational constant (m³/kg·s²)
 * @returns Orbital period (s)
 */
export function calculateOrbitalPeriod(
  r: number,
  M: number,
  G: number = PHYSICS_CONSTANTS.G
): number {
  return 2 * Math.PI * Math.sqrt((r * r * r) / (G * M));
}

/**
 * Calculate specific orbital energy
 * E = v²/2 - GM/r (negative = bound orbit, positive = unbound)
 * @param v - Velocity (m/s)
 * @param r - Distance from central body (m)
 * @param M - Mass of central body (kg)
 * @param G - Gravitational constant (m³/kg·s²)
 * @returns Specific orbital energy (J/kg)
 */
export function calculateOrbitalEnergy(
  v: number,
  r: number,
  M: number,
  G: number = PHYSICS_CONSTANTS.G
): number {
  return (v * v) / 2 - (G * M) / r;
}

/**
 * Calculate semi-major axis from orbital energy
 * a = -GM/(2E)
 * @param energy - Specific orbital energy (J/kg)
 * @param M - Mass of central body (kg)
 * @param G - Gravitational constant (m³/kg·s²)
 * @returns Semi-major axis (m)
 */
export function calculateSemiMajorAxis(
  energy: number,
  M: number,
  G: number = PHYSICS_CONSTANTS.G
): number {
  return (-G * M) / (2 * energy);
}

/**
 * Calculate orbital eccentricity
 * e = √(1 + 2Eh²/(GM)²)
 * where h is specific angular momentum
 * @param energy - Specific orbital energy (J/kg)
 * @param angularMomentum - Specific angular momentum (m²/s)
 * @param M - Mass of central body (kg)
 * @param G - Gravitational constant (m³/kg·s²)
 * @returns Eccentricity (0 = circle, 0 < e < 1 = ellipse, e = 1 = parabola, e > 1 = hyperbola)
 */
export function calculateEccentricity(
  energy: number,
  angularMomentum: number,
  M: number,
  G: number = PHYSICS_CONSTANTS.G
): number {
  return Math.sqrt(1 + (2 * energy * angularMomentum * angularMomentum) / Math.pow(G * M, 2));
}

/**
 * Calculate angular momentum magnitude
 * L = |r × v|
 * @param r - Position vector {x, y, z}
 * @param v - Velocity vector {vx, vy, vz}
 * @returns Angular momentum magnitude (m²/s)
 */
export function calculateAngularMomentum(
  r: { x: number; y: number; z: number },
  v: { x: number; y: number; z: number }
): number {
  return Math.abs(r.x * v.z - r.z * v.x);
}

// ============================================
// DOUBLE SLIT INTERFERENCE
// ============================================

/**
 * Calculate fringe spacing for double slit interference
 * Δy = λL/d
 * @param wavelength - Wavelength (m)
 * @param L - Distance to screen (m)
 * @param d - Slit separation (m)
 * @returns Fringe spacing (m)
 */
export function calculateFringeSpacing(wavelength: number, L: number, d: number): number {
  return (wavelength * L) / d;
}

/**
 * Calculate intensity at position on screen (double slit)
 * I = I₀cos²(πd sinθ/λ) * sinc²(πa sinθ/λ)
 * @param y - Position on screen (m)
 * @param L - Distance to screen (m)
 * @param d - Slit separation (m)
 * @param a - Slit width (m)
 * @param wavelength - Wavelength (m)
 * @param I0 - Maximum intensity
 * @returns Intensity at position y
 */
export function calculateDoubleSlitIntensity(
  y: number,
  L: number,
  d: number,
  a: number,
  wavelength: number,
  I0: number = 1
): number {
  const theta = Math.atan(y / L);
  const k = (2 * Math.PI) / wavelength;

  const beta = (k * d * Math.sin(theta)) / 2;
  const alpha = (k * a * Math.sin(theta)) / 2;

  // Double slit interference
  const interference = Math.cos(beta) ** 2;

  // Single slit diffraction envelope
  let diffraction = 1;
  if (Math.abs(alpha) > 0.001) {
    diffraction = Math.sin(alpha) / alpha;
    diffraction = diffraction * diffraction;
  }

  return I0 * interference * diffraction;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
