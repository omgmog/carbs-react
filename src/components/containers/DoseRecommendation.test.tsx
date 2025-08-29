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
    expect(screen.getByText(/iob/i)).toBeInTheDocument();
  });

  test("displays dose recommendation section", () => {
    renderWithProvider(<DoseRecommendation />);

    expect(screen.getByText(/suggested dose/i)).toBeInTheDocument();
    expect(screen.getByText(/now \(total\):/i)).toBeInTheDocument();
  });

  test("shows injection plan when there are multiple injections or delayed doses", async () => {
    renderWithProvider(<DoseRecommendation />);

    // Add a large amount of carbs to trigger multiple injections (over max per shot)
    const extraCarbsInput = screen.getByLabelText(/extra carbs/i);
    await userEvent.type(extraCarbsInput, "150"); // Should exceed max single dose and split

    expect(screen.getByText(/injection plan/i)).toBeInTheDocument();
  });

  test("does not show injection plan for simple single injections", async () => {
    renderWithProvider(<DoseRecommendation />);

    // Add moderate carbs that would result in a single injection
    const extraCarbsInput = screen.getByLabelText(/extra carbs/i);
    await userEvent.type(extraCarbsInput, "30");

    // Should not show detailed injection plan for simple single injection
    expect(screen.queryByText(/injection plan/i)).not.toBeInTheDocument();
  });

  test("shows injection plan for high fat/protein meals with delayed doses", async () => {
    renderWithProvider(<DoseRecommendation />);

    // Add some carbs and enable high fat/protein (which can trigger delayed doses)
    const extraCarbsInput = screen.getByLabelText(/extra carbs/i);
    await userEvent.type(extraCarbsInput, "50");
    
    const checkbox = screen.getByLabelText(/high fat\/protein meal/i);
    await userEvent.click(checkbox);

    // Should show injection plan due to potential delayed dosing
    expect(screen.getByText(/injection plan/i)).toBeInTheDocument();
  });

  test("displays dosing parameters", () => {
    renderWithProvider(<DoseRecommendation />);

    expect(screen.getByText("ICR")).toBeInTheDocument();
    expect(screen.getByText("ISF")).toBeInTheDocument();
    expect(screen.getByText("Target BG")).toBeInTheDocument();
    expect(screen.getByText("Max per shot")).toBeInTheDocument();
  });

  test("allows meal selection", async () => {
    renderWithProvider(<DoseRecommendation />);

    const mealSelect = screen.getByRole("combobox"); // Find the select element
    await userEvent.selectOptions(mealSelect, "lunch");

    expect(mealSelect).toHaveValue("lunch");
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

    const breakdownSummary = screen.getByText(/calculation details/i);
    await userEvent.click(breakdownSummary);

    expect(screen.getByText("Carb bolus")).toBeInTheDocument();
    expect(screen.getByText("Correction")).toBeInTheDocument();
    expect(screen.getByText("High fat/protein add-on")).toBeInTheDocument();
  });

  test("displays carbs calculation summary", () => {
    renderWithProvider(<DoseRecommendation />);

    expect(screen.getByText(/carbs from selection:/i)).toBeInTheDocument();
    expect(screen.getByText(/total carbs used:/i)).toBeInTheDocument();
  });
});
