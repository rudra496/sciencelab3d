"use client";

import { useState, useRef, useEffect, ReactNode, useCallback, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

export interface FloatingControlPanelProps {
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
 * FLOATING DRAGGABLE Control Panel
 * - Can be dragged around the screen
 * - Collapsible
 * - Play/Pause toggle
 * - Reset button
 * - Speed control (0.1x to 3x)
 * - Touch-friendly
 * - Stays within viewport bounds
 * - Performance optimized
 */
export function FloatingControlPanel({
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
}: FloatingControlPanelProps) {
  const [isPlaying, setIsPlaying] = useState(defaultPlaying);
  const [speed, setSpeed] = useState(defaultSpeed);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
      }, 10000);
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
  }, [isDragging, isMobile, isCollapsed, position]);

  return (
    <div
      ref={panelRef}
      className={`
        fixed z-30 transition-transform touch-none select-none
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
      <div className="w-full bg-linear-to-br from-white/95 to-purple-50/90 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-linear-to-r from-blue-600 to-purple-600 py-2 px-3 sm:px-6 -mx-3 border-b border-purple-200 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
          <div className="flex gap-2">
            {showPlayPause && (
              <button
                onClick={handlePlayPause}
                className={`
                  px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1 sm:gap-2
                  ${isPlaying
                    ? "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/30"
                }`}
              >
                {isPlaying ? "⏸" : "▶"} <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
              </button>
            )}
            {showReset && (
              <button
                onClick={handleReset}
                className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1 sm:gap-2 bg-gray-200/50 hover:bg-gray-300 text-gray-700 shadow-md"
              >
                🔄 <span className="hidden sm:inline">Reset</span>
              </button>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-600 hover:text-gray-900 text-lg sm:text-xl p-1 transition-colors"
              aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? "▼" : "▲"}
            </button>
          </div>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="p-3 sm:p-4 space-y-3 max-h-[60vh] sm:max-h-[calc(100vh-80px)] overflow-y-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default FloatingControlPanel;
