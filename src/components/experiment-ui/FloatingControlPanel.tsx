"use client";

import { useState, useRef, useEffect, ReactNode, useCallback, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

export interface FloatingControlPanelProps {
  children?: ReactNode;
  title?: string;
  initialPosition?: { x: number; y: number };
  defaultCollapsed?: boolean;
}

/**
 * FLOATING DRAGGABLE Control Panel
 * - Can be dragged around the screen
 * - Collapsible
 * - Used for parameter controls only
 * - Touch-friendly
 * - Stays within viewport bounds
 * - Performance optimized
 */
export function FloatingControlPanel({
  children,
  title = "Controls",
  initialPosition,
  defaultCollapsed = false,
}: FloatingControlPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Use safe initial state to avoid hydration mismatch; set real position after mount
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [mounted, setMounted] = useState(false);

  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const autoCollapseTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Set position after mount to avoid hydration mismatch with SSR
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    // Apply initial position only on client
    if (initialPosition) {
      setPosition(initialPosition);
    } else {
      const mobile = window.innerWidth < 768;
      setPosition(mobile ? { x: 10, y: 70 } : { x: 20, y: 80 });
    }
    setMounted(true);

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  if (!mounted) return null;

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
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:text-gray-200 text-lg sm:text-xl p-1 transition-colors"
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
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
