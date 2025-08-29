import React, { useState, useRef, useEffect, useCallback } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

interface TooltipPosition {
  top: number;
  left: number;
  position: "top" | "bottom" | "left" | "right";
  arrowTop?: number;
  arrowLeft?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipId] = useState(() => `tooltip-${Math.random().toString(36).substr(2, 9)}`);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback((): TooltipPosition => {
    if (!triggerRef.current) {
      return { top: 0, left: 0, position: position };
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth || 1024;
    const viewportHeight = window.innerHeight || 768;

    // Safety check for test environment
    if (triggerRect.width === 0 && triggerRect.height === 0) {
      return { top: 0, left: 0, position: position };
    }
    
    // Tooltip dimensions
    const tooltipWidth = 320; // w-80 = 20rem = 320px
    const tooltipHeight = tooltipRef.current?.offsetHeight || 60; // Use actual height if available
    const margin = 8; // Spacing from edges
    const spacing = 8; // Spacing between tooltip and trigger

    let finalPosition = position;
    let top = 0;
    let left = 0;

    // Determine best position based on available space
    switch (position) {
      case "top": {
        // Check if tooltip fits above the trigger without going off viewport
        const topPosition = triggerRect.top - tooltipHeight - spacing;
        if (topPosition >= margin) {
          finalPosition = "top";
          top = topPosition;
        } else {
          // Not enough space above, position below instead
          finalPosition = "bottom";
          top = triggerRect.bottom + spacing;
        }
        // Center horizontally, but clamp to viewport
        left = Math.max(margin, Math.min(
          viewportWidth - tooltipWidth - margin,
          triggerRect.left + (triggerRect.width - tooltipWidth) / 2
        ));
        break;
      }

      case "bottom": {
        // Check if tooltip fits below the trigger without going off viewport
        const bottomPosition = triggerRect.bottom + spacing;
        if (bottomPosition + tooltipHeight <= viewportHeight - margin) {
          finalPosition = "bottom";
          top = bottomPosition;
        } else {
          // Not enough space below, position above instead
          finalPosition = "top";
          top = triggerRect.top - tooltipHeight - spacing;
        }
        // Center horizontally, but clamp to viewport
        left = Math.max(margin, Math.min(
          viewportWidth - tooltipWidth - margin,
          triggerRect.left + (triggerRect.width - tooltipWidth) / 2
        ));
        break;
      }

      case "left": {
        // Check if tooltip fits to the left of the trigger without going off viewport
        const leftPosition = triggerRect.left - tooltipWidth - spacing;
        if (leftPosition >= margin) {
          finalPosition = "left";
          left = leftPosition;
        } else {
          // Not enough space to the left, position to the right instead
          finalPosition = "right";
          left = triggerRect.right + spacing;
        }
        // Center vertically, but clamp to viewport
        top = Math.max(margin, Math.min(
          viewportHeight - tooltipHeight - margin,
          triggerRect.top + (triggerRect.height - tooltipHeight) / 2
        ));
        break;
      }

      case "right": {
        // Check if tooltip fits to the right of the trigger without going off viewport
        const rightPosition = triggerRect.right + spacing;
        if (rightPosition + tooltipWidth <= viewportWidth - margin) {
          finalPosition = "right";
          left = rightPosition;
        } else {
          // Not enough space to the right, position to the left instead
          finalPosition = "left";
          left = triggerRect.left - tooltipWidth - spacing;
        }
        // Center vertically, but clamp to viewport
        top = Math.max(margin, Math.min(
          viewportHeight - tooltipHeight - margin,
          triggerRect.top + (triggerRect.height - tooltipHeight) / 2
        ));
        break;
      }
    }

    // Calculate arrow position to point to the center of the trigger element
    let arrowTop: number | undefined;
    let arrowLeft: number | undefined;

    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    switch (finalPosition) {
      case "top":
      case "bottom":
        // Arrow should be centered horizontally on the trigger
        arrowLeft = Math.max(8, Math.min(tooltipWidth - 16, triggerCenterX - left));
        arrowTop = finalPosition === "top" ? tooltipHeight - 4 : -4;
        break;
      case "left":
      case "right":
        // Arrow should be centered vertically on the trigger
        arrowTop = Math.max(8, Math.min(tooltipHeight - 16, triggerCenterY - top));
        arrowLeft = finalPosition === "left" ? tooltipWidth - 4 : -4;
        break;
    }

    return { top, left, position: finalPosition, arrowTop, arrowLeft };
  }, [position]);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setTooltipPosition(null);
    }, 100); // Small delay to prevent flickering
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsVisible(false);
      setTooltipPosition(null);
    }
  };

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      setTooltipPosition(calculatePosition());
    }
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowClasses = (pos: "top" | "bottom" | "left" | "right") => {
    switch (pos) {
      case "top":
        return "border-l-transparent border-r-transparent border-b-transparent border-t-gray-900";
      case "bottom":
        return "border-l-transparent border-r-transparent border-t-transparent border-b-gray-900";
      case "left":
        return "border-t-transparent border-b-transparent border-r-transparent border-l-gray-900";
      case "right":
        return "border-t-transparent border-b-transparent border-l-transparent border-r-gray-900";
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onKeyDown={handleKeyDown}
        aria-describedby={isVisible ? tooltipId : undefined}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && tooltipPosition && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg w-80 pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          {content}
          {/* Tooltip arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${getArrowClasses(tooltipPosition.position)}`}
            style={{
              top: tooltipPosition.arrowTop !== undefined ? `${tooltipPosition.arrowTop}px` : undefined,
              left: tooltipPosition.arrowLeft !== undefined ? `${tooltipPosition.arrowLeft}px` : undefined,
            }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;