import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PortionSize from "./PortionSize";
import * as FoodContext from "../../contexts/FoodContext";

describe("PortionSize", () => {
  test("renders portion input with correct label for grams", () => {
    const mockUseFood = jest.spyOn(FoodContext, "useFood").mockReturnValue({
      food: 0, // Pre-select a food that uses grams
      setFood: jest.fn(),
      portion: "",
      setPortion: jest.fn(),
      foods: [{ label: "Test Food", value: 50, tags: [] }],
    });

    render(<PortionSize />);

    expect(screen.getByLabelText(/portion \(g\)/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter amount in g/i),
    ).toBeInTheDocument();

    mockUseFood.mockRestore();
  });

  test("allows numeric input", async () => {
    const mockSetPortion = jest.fn();
    const mockUseFood = jest.spyOn(FoodContext, "useFood").mockReturnValue({
      food: 0,
      setFood: jest.fn(),
      portion: "",
      setPortion: mockSetPortion,
      foods: [{ label: "Test Food", value: 50, tags: [] }],
    });

    render(<PortionSize />);

    const input = screen.getByLabelText(/portion \(g\)/i);
    await userEvent.type(input, "150");

    expect(mockSetPortion).toHaveBeenCalled();

    mockUseFood.mockRestore();
  });

  test("has correct input attributes", () => {
    const mockUseFood = jest.spyOn(FoodContext, "useFood").mockReturnValue({
      food: 0,
      setFood: jest.fn(),
      portion: "",
      setPortion: jest.fn(),
      foods: [{ label: "Test Food", value: 50, tags: [] }],
    });

    render(<PortionSize />);

    const input = screen.getByLabelText(/portion \(g\)/i);
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("step", "1");

    mockUseFood.mockRestore();
  });

  test("starts with empty value", () => {
    const mockUseFood = jest.spyOn(FoodContext, "useFood").mockReturnValue({
      food: 0,
      setFood: jest.fn(),
      portion: "",
      setPortion: jest.fn(),
      foods: [{ label: "Test Food", value: 50, tags: [] }],
    });

    render(<PortionSize />);

    const input = screen.getByLabelText(/portion \(g\)/i);
    expect(input).toHaveValue(null);

    mockUseFood.mockRestore();
  });
});
