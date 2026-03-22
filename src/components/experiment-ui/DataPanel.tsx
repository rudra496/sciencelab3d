"use client";

import { useState, useRef, useEffect, ReactNode, useCallback, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

export interface DataPanelProps {
  children: ReactNode;
  isVisible?: boolean;
  onToggle?: () => void;
  initialPosition?: { x: number; y: number };
  defaultCollapsed?: boolean;
}

/**
 * FLOATING TOGGLEABLE DATA PANEL
 * - Small floating panel for real-time data
 * - Toggle button to show/hide
 * - Draggable around the screen
 * - Touch-friendly
 * - Stays within viewport bounds
 * - Dark semi-transparent design
 * - Collapsible with smooth animation
 */
export function DataPanel({
  children,
  isVisible: controlledVisible,
  onToggle,
  initialPosition,
  defaultCollapsed = false,
}: DataPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [internalVisible, setInternalVisible] = useState(true);
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });

  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Use controlled or internal visibility state
  const isVisible = controlledVisible !== undefined ? controlledVisible : internalVisible;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!initialPosition) {
        setPosition(mobile
          ? { x: 10, y: window.innerHeight - 160 }
          : { x: window.innerWidth - 340, y: window.innerHeight - 200 }
        );
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [initialPosition]);

  // Handle visibility toggle
  const handleToggle = useCallback(() => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalVisible((v) => !v);
    }
  }, [onToggle]);

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
      const panelHeight = panelRef.current?.offsetHeight || (isCollapsed ? 60 : 200);

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
      const panelHeight = panelRef.current?.offsetHeight || (isCollapsed ? 60 : 200);

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
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, isMobile, isCollapsed, position]);

  if (!isVisible) {
    // Render just a small toggle button when hidden
    return (
      <div
        className="fixed z-30 touch-none select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <button
          onClick={handleToggle}
          className="w-10 h-10 bg-gray-900/90 backdrop-blur-xl border border-gray-600/50 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
          title="Show Data"
        >
          📊
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`
        fixed z-30 transition-all touch-none select-none
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
      <div className="w-full bg-gray-900/90 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-cyan-600 to-blue-600 py-2 px-3 sm:px-4 -mx-0.5 border-b border-gray-600/50 shrink-0">
          <h2 className="text-sm sm:text-base font-bold text-white">📊 Data</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white hover:text-gray-200 text-sm p-1 transition-colors"
              aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? "▼" : "▲"}
            </button>
            <button
              onClick={handleToggle}
              className="text-white hover:text-gray-200 text-sm p-1 transition-colors"
              aria-label="Hide"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="p-3 sm:p-4 space-y-3 max-h-[50vh] sm:max-h-[calc(100vh-150px)] overflow-y-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default DataPanel;
