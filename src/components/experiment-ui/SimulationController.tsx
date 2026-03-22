"use client";

import { useState, useRef, useEffect, useCallback, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

export interface SimulationControllerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  timeElapsed?: number;
  initialPosition?: { x: number; y: number };
}

/**
 * FLOATING SIMULATION CONTROLLER
 * - Always visible (no toggle needed)
 * - Draggable around the screen
 * - Play/Pause toggle
 * - Reset button
 * - Speed control (0.1x to 3x)
 * - Time elapsed display
 * - Touch-friendly
 * - Stays within viewport bounds
 * - Compact design
 */
export function SimulationController({
  isPlaying,
  onPlayPause,
  onReset,
  speed,
  onSpeedChange,
  timeElapsed = 0,
  initialPosition,
}: SimulationControllerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });

  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!initialPosition) {
        setPosition(mobile
          ? { x: 10, y: window.innerHeight - 80 }
          : { x: window.innerWidth / 2 - 150, y: window.innerHeight - 80 }
        );
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [initialPosition]);

  // Format time elapsed
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input")) return;
    e.preventDefault();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }, [position]);

  // Touch drag handlers
  const handleTouchStart = useCallback((e: ReactTouchEvent) => {
    if ((e.target as HTMLElement).closest("button, input")) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragOffset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
  }, [position]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // Constrain to viewport
      const panelWidth = panelRef.current?.offsetWidth || (isMobile ? window.innerWidth - 20 : 300);
      const panelHeight = panelRef.current?.offsetHeight || 60;

      setPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - panelWidth)),
        y: Math.max(0, Math.min(newY, window.innerHeight - panelHeight)),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.current.x;
      const newY = touch.clientY - dragOffset.current.y;

      const panelWidth = panelRef.current?.offsetWidth || (isMobile ? window.innerWidth - 20 : 300);
      const panelHeight = panelRef.current?.offsetHeight || 60;

      setPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - panelWidth)),
        y: Math.max(0, Math.min(newY, window.innerHeight - panelHeight)),
      });
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, isMobile, position]);

  return (
    <div
      ref={panelRef}
      className={`
        fixed z-40 transition-transform touch-none select-none
        ${isDragging ? "cursor-grabbing" : "cursor-grab"}
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMobile ? "calc(100vw - 20px)" : "auto",
        maxWidth: isMobile ? "none" : "400px",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="w-full bg-gray-900/90 backdrop-blur-xl border border-gray-600/50 rounded-full shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5">
          {/* Play / Pause */}
          <button
            onClick={onPlayPause}
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full font-bold text-sm sm:text-base transition-all shadow-md flex-shrink-0 ${
              isPlaying
                ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/40"
                : "bg-green-600 hover:bg-green-500 text-white shadow-green-500/40"
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm sm:text-base transition-all shadow-md flex-shrink-0"
            title="Reset"
          >
            🔄
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-600 flex-shrink-0" />

          {/* Time Elapsed */}
          {timeElapsed !== undefined && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">Time</span>
              <span className="text-xs sm:text-sm font-mono text-cyan-400 min-w-16 text-center">
                {formatTime(timeElapsed)}
              </span>
            </div>
          )}

          {/* Divider */}
          {timeElapsed !== undefined && <div className="w-px h-6 bg-gray-600 flex-shrink-0" />}

          {/* Speed control */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">Speed</span>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer touch-none"
              style={{ accentColor: "#8b5cf6" }}
            />
            <span className="text-xs sm:text-sm font-mono text-purple-400 min-w-10 text-center flex-shrink-0">
              {speed.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationController;
