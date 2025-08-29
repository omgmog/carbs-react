import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tooltip from "./Tooltip";

describe("Tooltip", () => {
  const mockContent = "This is a helpful tooltip";
  const mockChildren = <span>Hover me</span>;

  test("renders children correctly", () => {
    render(<Tooltip content={mockContent}>{mockChildren}</Tooltip>);
    
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  test("shows tooltip on hover", async () => {
    render(<Tooltip content={mockContent}>{mockChildren}</Tooltip>);
    
    const trigger = screen.getByText("Hover me");
    expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
    
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText(mockContent)).toBeInTheDocument();
  });

  test("hides tooltip on mouse leave", async () => {
    render(<Tooltip content={mockContent}>{mockChildren}</Tooltip>);
    
    const trigger = screen.getByText("Hover me");
    
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText(mockContent)).toBeInTheDocument();
    
    fireEvent.mouseLeave(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
    });
  });

  test("shows tooltip on focus", async () => {
    render(<Tooltip content={mockContent}>{mockChildren}</Tooltip>);
    
    const trigger = screen.getByText("Hover me").parentElement;
    expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
    
    if (trigger) {
      fireEvent.focus(trigger);
      expect(screen.getByText(mockContent)).toBeInTheDocument();
    }
  });

  test("hides tooltip on blur", async () => {
    render(<Tooltip content={mockContent}>{mockChildren}</Tooltip>);
    
    const trigger = screen.getByText("Hover me").parentElement;
    
    if (trigger) {
      fireEvent.focus(trigger);
      expect(screen.getByText(mockContent)).toBeInTheDocument();
      
      fireEvent.blur(trigger);
      
      await waitFor(() => {
        expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
      });
    }
  });

  test("hides tooltip on Escape key", async () => {
    render(<Tooltip content={mockContent}>{mockChildren}</Tooltip>);
    
    const trigger = screen.getByText("Hover me").parentElement;
    
    if (trigger) {
      fireEvent.focus(trigger);
      expect(screen.getByText(mockContent)).toBeInTheDocument();
      
      fireEvent.keyDown(trigger, { key: "Escape" });
      
      expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
    }
  });

  test("has proper accessibility attributes", async () => {
    render(<Tooltip content={mockContent}>{mockChildren}</Tooltip>);
    
    const trigger = screen.getByText("Hover me").parentElement;
    
    if (trigger) {
      expect(trigger).toHaveClass("cursor-help");
      
      fireEvent.focus(trigger);
      const tooltip = screen.getByRole("tooltip");
      
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveAttribute("role", "tooltip");
      expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
    }
  });

  test("positions tooltip correctly", () => {
    render(
      <Tooltip content={mockContent} position="bottom">
        {mockChildren}
      </Tooltip>
    );
    
    const trigger = screen.getByText("Hover me").parentElement;
    
    if (trigger) {
      fireEvent.focus(trigger);
      const tooltip = screen.getByRole("tooltip");
      
      expect(tooltip).toHaveClass("top-full", "left-1/2", "transform", "-translate-x-1/2", "mt-2");
    }
  });

  test("applies custom className", () => {
    const customClass = "custom-tooltip-wrapper";
    const { container } = render(
      <Tooltip content={mockContent} className={customClass}>
        {mockChildren}
      </Tooltip>
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  test("handles long content correctly", async () => {
    const longContent = "This is a very long tooltip content that should wrap properly and not break the layout of the application";
    
    render(<Tooltip content={longContent}>{mockChildren}</Tooltip>);
    
    const trigger = screen.getByText("Hover me").parentElement;
    
    if (trigger) {
      fireEvent.focus(trigger);
      const tooltip = screen.getByRole("tooltip");
      
      expect(tooltip).toHaveClass("w-80");
      expect(screen.getByText(longContent)).toBeInTheDocument();
    }
  });

  test("tooltip persists when hovering over tooltip itself", async () => {
    render(<Tooltip content={mockContent}>{mockChildren}</Tooltip>);
    
    const trigger = screen.getByText("Hover me").parentElement;
    
    if (trigger) {
      fireEvent.mouseEnter(trigger);
      expect(screen.getByText(mockContent)).toBeInTheDocument();
      
      const tooltip = screen.getByRole("tooltip");
      fireEvent.mouseEnter(tooltip);
      
      // Tooltip should still be visible
      expect(screen.getByText(mockContent)).toBeInTheDocument();
    }
  });

  test("supports all position variants", () => {
    const positions: Array<"top" | "bottom" | "left" | "right"> = ["top", "bottom", "left", "right"];
    
    positions.forEach((position) => {
      const { unmount } = render(
        <Tooltip content={mockContent} position={position}>
          <span>Test {position}</span>
        </Tooltip>
      );
      
      const trigger = screen.getByText(`Test ${position}`).parentElement;
      
      if (trigger) {
        fireEvent.focus(trigger);
        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toBeInTheDocument();
      }
      
      unmount();
    });
  });

  test("cleans up timeout on unmount", () => {
    const { unmount } = render(
      <Tooltip content={mockContent}>{mockChildren}</Tooltip>
    );
    
    const trigger = screen.getByText("Hover me").parentElement;
    
    if (trigger) {
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
    }
    
    // Should not throw any errors when unmounting
    expect(() => unmount()).not.toThrow();
  });
});