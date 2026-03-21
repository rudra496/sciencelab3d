"use client";

import { ReactNode, useRef, useState, useCallback, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

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
  initialPosition?: { x: number; y: number };
}

/**
 * RESPONSIVE Control Panel with Mouse + Touch Drag Support
 * - Works on desktop (mouse) and mobile (touch)
 * - Play/Pause toggle
 * - Reset button
 * - Speed control (0.1x to 3x)
 * - Collapsible
 * - Stays within viewport bounds
 * - Performance optimized
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
  initialPosition,
}: ControlPanelProps) {
  const [isPlaying, setIsPlaying] = useState(defaultPlaying);
  const [speed, setSpeed] = useState(defaultSpeed);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive positioning
  const [position, setPosition] = useState(() => {
    if (typeof window === "undefined") return { x: 20, y: 80 };
    const isSmallScreen = window.innerWidth < 768;
    return initialPosition || (isSmallScreen ? { x: 10, y: 70 } : { x: 20, y: 80 });
  });

  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const autoCollapseTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !initialPosition) {
        setPosition({ x: 10, y: 70 });
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [initialPosition]);

  // Auto-collapse on mobile after inactivity
  useEffect(() => {
    if (!isMobile) return;

    const resetTimeout = () => {
      clearTimeout(autoCollapseTimeout.current);
      autoCollapseTimeout.current = setTimeout(() => {
        setIsCollapsed(true);
      }, 10000); // 10 seconds of inactivity
    };

    resetTimeout();
    window.addEventListener("touchstart", resetTimeout);
    window.addEventListener("click", resetTimeout);

    return () => {
      clearTimeout(autoCollapseTimeout.current);
      window.removeEventListener("touchstart", resetTimeout);
      window.removeEventListener("click", resetTimeout);
    };
  }, [isMobile]);

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
      const panelWidth = panelRef.current?.offsetWidth || (isMobile ? window.innerWidth - 20 : 320);
      const panelHeight = panelRef.current?.offsetHeight || 400;

      setPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - panelWidth)),
        y: Math.max(0, Math.min(newY, window.innerHeight - (isCollapsed ? 60 : panelHeight))),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.current.x;
      const newY = touch.clientY - dragOffset.current.y;

      const panelWidth = panelRef.current?.offsetWidth || (isMobile ? window.innerWidth - 20 : 320);
      const panelHeight = panelRef.current?.offsetHeight || 400;

      setPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - panelWidth)),
        y: Math.max(0, Math.min(newY, window.innerHeight - (isCollapsed ? 60 : panelHeight))),
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
  }, [isDragging, isMobile, isCollapsed]);

  return (
    <div
      ref={panelRef}
      className={`
        fixed z-30 transition-none touch-none select-none
        ${isDragging ? "cursor-grabbing" : "cursor-grab"}
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMobile ? "calc(100vw - 20px)" : "auto",
        maxWidth: isMobile ? "none" : "320px",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="w-full bg-gradient-to-br from-gray-900/95 to-purple-900/90 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-2 sm:p-4 border-b border-purple-500/30 bg-gray-900/50">
          <h3 className="text-sm sm:text-base font-bold text-purple-400">{title}</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base p-1"
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
        </div>

        {!isCollapsed && (
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Playback Controls */}
            {(showPlayPause || showReset) && (
              <div className="flex gap-2">
                {showPlayPause && (
                  <button
                    onClick={handlePlayPause}
                    className={`
                      flex-1 py-2 px-3 sm:py-2.5 sm:px-4 rounded-lg font-medium text-xs sm:text-sm
                      transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2
                      ${isPlaying
                        ? "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/30"
                      }
                    `}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <>
                        <span className="text-sm">⏸</span>
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">▶</span>
                        <span className="hidden sm:inline">Play</span>
                      </>
                    )}
                  </button>
                )}
                {showReset && (
                  <button
                    onClick={handleReset}
                    className="py-2 px-3 sm:py-2.5 sm:px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-xs sm:text-sm transition-all shadow-lg"
                    aria-label="Reset"
                  >
                    <span className="text-sm sm:hidden">🔄</span>
                    <span className="hidden sm:inline">🔄 Reset</span>
                  </button>
                )}
              </div>
            )}

            {/* Speed Control */}
            {showSpeed && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
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
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer touch-none"
                  style={{ accentColor: "#8b5cf6" }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                />
                <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
                  <span>0.1x</span>
                  <span>1x</span>
                  <span>3x</span>
                </div>
              </div>
            )}

            {/* Custom Controls */}
            {children && (
              <div className="pt-3 sm:pt-4 border-t border-purple-500/30 space-y-2 sm:space-y-3">
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
