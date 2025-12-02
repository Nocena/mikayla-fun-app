import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ResizableSidebarProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  collapsedWidth?: number;
  storageKey?: string;
}

const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_MAX_WIDTH = 500;
const DEFAULT_WIDTH = 320;
const DEFAULT_COLLAPSED_WIDTH = 60;

export const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  children,
  minWidth = DEFAULT_MIN_WIDTH,
  maxWidth = DEFAULT_MAX_WIDTH,
  defaultWidth = DEFAULT_WIDTH,
  collapsedWidth = DEFAULT_COLLAPSED_WIDTH,
  storageKey = 'chat-sidebar',
}) => {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}-width`);
    return saved ? parseInt(saved, 10) : defaultWidth;
  });
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}-collapsed`);
    return saved === 'true';
  });

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Persist width to localStorage
  useEffect(() => {
    if (!isCollapsed) {
      localStorage.setItem(`${storageKey}-width`, width.toString());
    }
  }, [width, isCollapsed, storageKey]);

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem(`${storageKey}-collapsed`, isCollapsed.toString());
  }, [isCollapsed, storageKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!sidebarRef.current) return;
    
    // Store the initial mouse X position and sidebar width
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarRef.current.offsetWidth;
    
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !sidebarRef.current) return;

    // Calculate the difference from where the drag started
    const deltaX = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + deltaX;
    
    // Auto-collapse threshold: if dragged below this width, collapse automatically
    // Use a threshold between collapsedWidth and minWidth
    const collapseThreshold = Math.max(collapsedWidth + 40, minWidth * 0.6);
    
    if (newWidth < collapseThreshold) {
      // Auto-collapse when dragged too narrow
      setIsCollapsed(true);
    } else {
      // Normal resize within bounds
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(clampedWidth);
      // Auto-expand when dragging wider from collapsed state
      if (isCollapsed && clampedWidth >= collapseThreshold) {
        setIsCollapsed(false);
      }
    }
  }, [isResizing, minWidth, maxWidth, collapsedWidth, isCollapsed]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    startXRef.current = 0;
    startWidthRef.current = 0;
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const currentWidth = isCollapsed ? collapsedWidth : width;

  return (
    <>
      <div
        ref={sidebarRef}
        className={`relative h-full flex-shrink-0 bg-panel border-r border-border-color overflow-hidden ${
          isResizing ? '' : 'transition-all duration-200 ease-out'
        }`}
        style={{ width: `${currentWidth}px` }}
      >
        {/* Collapse/Expand Button */}
        <button
          onClick={toggleCollapse}
          className="absolute top-4 right-2 z-20 p-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors shadow-sm"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Sidebar Content */}
        <div className="h-full">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { isCollapsed } as any);
            }
            return child;
          })}
        </div>

        {/* Resize Handle - always show, but thinner when collapsed */}
        <div
          ref={resizeHandleRef}
          onMouseDown={handleMouseDown}
          className={`absolute top-0 right-0 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-10 group ${
            isCollapsed ? 'w-0.5' : 'w-1'
          }`}
          style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
        >
          {/* Visual indicator on hover */}
          <div className="absolute top-0 right-0 w-0.5 h-full bg-transparent group-hover:bg-primary transition-colors" />
        </div>
      </div>
    </>
  );
};

