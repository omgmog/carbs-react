import React from "react";
import { render, screen } from "@testing-library/react";
import TotalCarbs from "./TotalCarbs";
import { FoodProvider } from "../../contexts/FoodContext";
import * as FoodContext from "../../contexts/FoodContext";

const renderWithProvider = (component: React.ReactElement) => {
  return render(<FoodProvider>{component}</FoodProvider>);
};

describe("TotalCarbs", () => {
  test("renders TotalCarbsDisplay component", () => {
    const mockUseFood = jest.spyOn(FoodContext, "useFood").mockReturnValue({
      food: 0, // Pre-select a food
      setFood: jest.fn(),
      portion: "100",
      setPortion: jest.fn(),
      foods: [{ label: "Test Food", value: 50, tags: [] }],
    });

    render(<TotalCarbs />);

    expect(screen.getByText(/carbs per/i)).toBeInTheDocument();

    mockUseFood.mockRestore();
  });

  test("calculates and displays total carbs correctly", () => {
    const mockUseFood = jest.spyOn(FoodContext, "useFood").mockReturnValue({
      food: 0,
      setFood: jest.fn(),
      portion: "100",
      setPortion: jest.fn(),
      foods: [{ label: "Test Food", value: 50, tags: [] }],
    });

    render(<TotalCarbs />);

    expect(screen.getByText("50g")).toBeInTheDocument();

    mockUseFood.mockRestore();
  });

  test("handles zero portion correctly", () => {
    const mockUseFood = jest.spyOn(FoodContext, "useFood").mockReturnValue({
      food: 0,
      setFood: jest.fn(),
      portion: "",
      setPortion: jest.fn(),
      foods: [{ label: "Test Food", value: 50, tags: [] }],
    });

    render(<TotalCarbs />);

    expect(screen.getByText("0g")).toBeInTheDocument();

    mockUseFood.mockRestore();
  });

  test("updates when portion changes", () => {
    const mockUseFood = jest.spyOn(FoodContext, "useFood").mockReturnValue({
      food: 0,
      setFood: jest.fn(),
      portion: "200",
      setPortion: jest.fn(),
      foods: [{ label: "Test Food", value: 25, tags: [] }],
    });

    render(<TotalCarbs />);

    expect(screen.getByText("50g")).toBeInTheDocument();

    mockUseFood.mockRestore();
  });
});
