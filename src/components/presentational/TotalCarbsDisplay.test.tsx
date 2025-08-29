import React from "react";
import { render, screen } from "@testing-library/react";
import TotalCarbsDisplay from "./TotalCarbsDisplay";

describe("TotalCarbsDisplay", () => {
  test("renders total carbs amount correctly", () => {
    render(<TotalCarbsDisplay totalCarbs={45.5} portion="150" />);

    expect(screen.getByText("45.5g")).toBeInTheDocument();
  });

  test("displays portion information", () => {
    render(<TotalCarbsDisplay totalCarbs={30} portion="120" />);

    expect(screen.getByText("carbs per 120g")).toBeInTheDocument();
  });

  test("handles zero carbs", () => {
    render(<TotalCarbsDisplay totalCarbs={0} portion="100" />);

    expect(screen.getByText("0g")).toBeInTheDocument();
  });

  test("handles empty portion", () => {
    render(<TotalCarbsDisplay totalCarbs={25} portion="" />);

    expect(screen.getByText("carbs per 0g")).toBeInTheDocument();
  });

  test("has correct styling classes", () => {
    const { container } = render(
      <TotalCarbsDisplay totalCarbs={25} portion="100" />,
    );

    const displayDiv = container.firstChild as HTMLElement;
    expect(displayDiv).toHaveClass(
      "bg-green-500",
      "text-white",
      "text-center",
      "rounded-lg",
      "p-3",
      "mt-4",
      "shadow",
    );
  });

  test("has correct text size classes", () => {
    render(<TotalCarbsDisplay totalCarbs={25} portion="100" />);

    const carbAmount = screen.getByText("25g");
    expect(carbAmount).toHaveClass("text-4xl", "font-bold");

    const portionText = screen.getByText("carbs per 100g");
    expect(portionText).toHaveClass("text-lg");
  });

  test("handles decimal carb values", () => {
    render(<TotalCarbsDisplay totalCarbs={12.7} portion="85" />);

    expect(screen.getByText("12.7g")).toBeInTheDocument();
  });
});
