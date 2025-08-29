import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PortionSize from "./PortionSize";
import { FoodProvider } from "../../contexts/FoodContext";

const renderWithProvider = (component: React.ReactElement) => {
  return render(<FoodProvider>{component}</FoodProvider>);
};

describe("PortionSize", () => {
  test("renders portion input with correct label for grams", () => {
    renderWithProvider(<PortionSize />);

    expect(screen.getByLabelText(/portion \(g\)/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter amount in g/i),
    ).toBeInTheDocument();
  });

  test("allows numeric input", async () => {
    renderWithProvider(<PortionSize />);

    const input = screen.getByLabelText(/portion \(g\)/i);
    await userEvent.type(input, "150");

    expect(input).toHaveValue(150);
  });

  test("has correct input attributes", () => {
    renderWithProvider(<PortionSize />);

    const input = screen.getByLabelText(/portion \(g\)/i);
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("step", "1");
  });

  test("starts with empty value", () => {
    renderWithProvider(<PortionSize />);

    const input = screen.getByLabelText(/portion \(g\)/i);
    expect(input).toHaveValue(null);
  });
});
