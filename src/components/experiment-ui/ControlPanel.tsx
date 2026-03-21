"use client";

import { ReactNode, useRef, useState, useEffect, useCallback } from "react";

export interface ControlPanelProps {
  children?: ReactNode;
  onPlayPause?: (isPlaying: boolean) => void;
  onReset?: () => void;
  onSpeedChange?: (speed: number) => void;
  defaultSpeed?: number;
  defaultPlaying?: boolean;
  showPlayPause?: boolean;
  showReset?: boolean;
  showSpeed?: boolean;
  title?: string;
}

/**
 * Unified Control Panel with Play/Pause, Reset, and Speed Control
 * - Floating draggable panel
 * - Play/Pause toggle
 * - Reset button
 * - Speed slider (0.1x to 3x)
 * - Collapsible
 */
export function ControlPanel({
  children,
  onPlayPause,
  onReset,
  onSpeedChange,
  defaultSpeed = 1,
  defaultPlaying = true,
  showPlayPause = true,
  showReset = true,
  showSpeed = true,
  title = "Controls",
}: ControlPanelProps) {
  const [isPlaying, setIsPlaying] = useState(defaultPlaying);
  const [speed, setSpeed] = useState(defaultSpeed);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePlayPause = useCallback(() => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    onPlayPause?.(newState);
  }, [isPlaying, onPlayPause]);

  const handleReset = useCallback(() => {
    onReset?.();
    setIsPlaying(defaultPlaying);
    setSpeed(defaultSpeed);
  }, [onReset, defaultPlaying, defaultSpeed]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    onSpeedChange?.(newSpeed);
  }, [onSpeedChange]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input")) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      setPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - 320)),
        y: Math.max(0, Math.min(newY, window.innerHeight - 100)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className={`fixed z-30 transition-all duration-200 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: isDragging ? "none" : "auto",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="w-80 bg-gradient-to-br from-gray-900/95 to-purple-900/90 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30 bg-gray-900/50">
          <h3 className="text-lg font-bold text-purple-400">{title}</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
        </div>

        {!isCollapsed && (
          <div className="p-4 space-y-4">
            {/* Playback Controls */}
            {(showPlayPause || showReset) && (
              <div className="flex gap-2">
                {showPlayPause && (
                  <button
                    onClick={handlePlayPause}
                    className={`
                      flex-1 py-2 px-4 rounded-lg font-medium text-sm
                      transition-all duration-200 flex items-center justify-center gap-2
                      ${isPlaying
                        ? "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/30"
                      }
                    `}
                  >
                    {isPlaying ? (
                      <>
                        <span>⏸</span>
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <span>▶</span>
                        <span>Play</span>
                      </>
                    )}
                  </button>
                )}
                {showReset && (
                  <button
                    onClick={handleReset}
                    className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-all shadow-lg"
                  >
                    🔄 Reset
                  </button>
                )}
              </div>
            )}

            {/* Speed Control */}
            {showSpeed && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Speed</span>
                  <span className="font-mono text-purple-400">
                    {speed.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={speed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: "#8b5cf6" }}
                  onMouseDown={(e) => e.stopPropagation()}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.1x</span>
                  <span>1x</span>
                  <span>3x</span>
                </div>
              </div>
            )}

            {/* Custom Controls */}
            {children && (
              <div className="pt-4 border-t border-purple-500/30">
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ControlPanel;
