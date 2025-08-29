import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DoseRecommendation from "./DoseRecommendation";
import { FoodProvider } from "../../contexts/FoodContext";

const renderWithProvider = (component: React.ReactElement) => {
  return render(<FoodProvider>{component}</FoodProvider>);
};

describe("DoseRecommendation", () => {
  test("renders all input fields", () => {
    renderWithProvider(<DoseRecommendation />);

    expect(screen.getByText(/extra carbs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/meal/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/high fat\/protein meal/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/current bg/i)).toBeInTheDocument();
    expect(screen.getByText(/iob \(u\)/i)).toBeInTheDocument();
  });

  test("displays dose recommendation section", () => {
    renderWithProvider(<DoseRecommendation />);

    expect(screen.getByText(/suggested dose/i)).toBeInTheDocument();
    expect(screen.getByText(/now \(total\):/i)).toBeInTheDocument();
  });

  test("shows injection plan", () => {
    renderWithProvider(<DoseRecommendation />);

    expect(screen.getByText(/injection plan/i)).toBeInTheDocument();
  });

  test("displays dosing parameters", () => {
    renderWithProvider(<DoseRecommendation />);

    expect(screen.getByText(/icr for breakfast:/i)).toBeInTheDocument();
    expect(screen.getByText(/isf:/i)).toBeInTheDocument();
    expect(screen.getByText(/target bg:/i)).toBeInTheDocument();
    expect(screen.getByText(/max per shot:/i)).toBeInTheDocument();
  });

  test("allows meal selection", async () => {
    renderWithProvider(<DoseRecommendation />);

    const mealSelect = screen.getByRole("combobox"); // Find the select element
    await userEvent.selectOptions(mealSelect, "lunch");

    expect(mealSelect).toHaveValue("lunch");
    expect(screen.getByText(/icr for lunch:/i)).toBeInTheDocument();
  });

  test("allows high fat/protein checkbox toggle", async () => {
    renderWithProvider(<DoseRecommendation />);

    const checkbox = screen.getByLabelText(/high fat\/protein meal/i);
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test("allows BG input", async () => {
    renderWithProvider(<DoseRecommendation />);

    const inputs = screen.getAllByRole("spinbutton");
    const bgInput = inputs.find(
      (input) => input.getAttribute("step") === "0.1",
    );

    if (bgInput) {
      await userEvent.clear(bgInput);
      await userEvent.type(bgInput, "8.5");
      expect(bgInput).toHaveValue(8.5);
    }
  });

  test("allows IOB input", async () => {
    renderWithProvider(<DoseRecommendation />);

    const inputs = screen.getAllByRole("spinbutton");
    const iobInput = inputs.find(
      (input) => input.getAttribute("step") === "0.5",
    );

    if (iobInput) {
      await userEvent.type(iobInput, "2.5");
      expect(iobInput).toHaveValue(2.5);
    }
  });

  test("allows extra carbs input", async () => {
    renderWithProvider(<DoseRecommendation />);

    const inputs = screen.getAllByRole("spinbutton");
    const extraCarbsInput = inputs.find(
      (input) => input.getAttribute("step") === "1",
    );

    if (extraCarbsInput) {
      await userEvent.type(extraCarbsInput, "15");
      expect(extraCarbsInput).toHaveValue(15);
    }
  });

  test("shows breakdown details when expanded", async () => {
    renderWithProvider(<DoseRecommendation />);

    const breakdownSummary = screen.getByText(/breakdown/i);
    await userEvent.click(breakdownSummary);

    expect(screen.getByText(/carb bolus:/i)).toBeInTheDocument();
    expect(screen.getByText(/correction:/i)).toBeInTheDocument();
    expect(screen.getByText(/dinner add-on:/i)).toBeInTheDocument();
  });

  test("displays carbs calculation summary", () => {
    renderWithProvider(<DoseRecommendation />);

    expect(screen.getByText(/carbs from selection:/i)).toBeInTheDocument();
    expect(screen.getByText(/total carbs used:/i)).toBeInTheDocument();
  });
});
