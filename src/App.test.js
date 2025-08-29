import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App Component", () => {
  test("renders all main components", () => {
    render(<App />);

    expect(screen.getByLabelText(/food type/i)).toBeInTheDocument();
    expect(screen.getByText(/suggested dose/i)).toBeInTheDocument();
  });

  test("allows food selection and portion input", async () => {
    render(<App />);

    const foodSelect = screen.getByLabelText(/food type/i);
    
    // First select a food to make portion input appear
    await userEvent.selectOptions(foodSelect, "1");
    
    // Now the portion input should be available
    const portionInput = screen.getByLabelText(/portion \(g\)/i);
    await userEvent.type(portionInput, "100");

    expect(portionInput).toHaveValue(100);
  });

  test("displays carb calculation when food and portion selected", async () => {
    render(<App />);

    const foodSelect = screen.getByLabelText(/food type/i);
    
    // First select a food to make portion input appear
    await userEvent.selectOptions(foodSelect, "1");
    
    // Now the portion input should be available
    const portionInput = screen.getByLabelText(/portion \(g\)/i);
    await userEvent.type(portionInput, "100");

    expect(screen.getByText(/carbs per 100g/i)).toBeInTheDocument();
  });

  test("shows dose recommendation interface", () => {
    render(<App />);

    expect(screen.getByLabelText(/meal/i)).toBeInTheDocument();
    expect(screen.getByText(/current bg/i)).toBeInTheDocument();
    expect(screen.getByText(/iob/i)).toBeInTheDocument();
    expect(screen.getByText(/suggested dose/i)).toBeInTheDocument();
  });
});
