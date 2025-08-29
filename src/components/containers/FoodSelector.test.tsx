import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FoodSelector from "./FoodSelector";
import { FoodProvider } from "../../contexts/FoodContext";

const renderWithProvider = (component: React.ReactElement) => {
  return render(<FoodProvider>{component}</FoodProvider>);
};

describe("FoodSelector", () => {
  test("renders food selector with label", () => {
    renderWithProvider(<FoodSelector />);

    expect(screen.getByLabelText(/food type/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("displays food options grouped by tags", () => {
    renderWithProvider(<FoodSelector />);

    const select = screen.getByLabelText(/food type/i);
    expect(select).toBeInTheDocument();

    const optgroups = screen.getAllByRole("group");
    expect(optgroups.length).toBeGreaterThan(0);
  });

  test("shows carbohydrate information for selected food", async () => {
    renderWithProvider(<FoodSelector />);

    // Initially no carb info should be shown
    expect(screen.queryByText(/carbs per 100/)).not.toBeInTheDocument();

    // Select a food
    const select = screen.getByLabelText(/food type/i);
    await userEvent.selectOptions(select, "0");

    // Now carb info should be shown
    expect(screen.getByText(/carbs per 100/)).toBeInTheDocument();
  });

  test("allows food selection", async () => {
    renderWithProvider(<FoodSelector />);

    const select = screen.getByLabelText(/food type/i);
    await userEvent.selectOptions(select, "1");

    expect(select).toHaveValue("1");
  });

  test("displays correct unit (g or ml) based on food type", async () => {
    renderWithProvider(<FoodSelector />);

    // Select a food that uses grams
    const select = screen.getByLabelText(/food type/i);
    await userEvent.selectOptions(select, "0"); // Potato should use grams

    expect(screen.getByText(/per 100 g/)).toBeInTheDocument();
  });

  test("shows link to add more food types", async () => {
    renderWithProvider(<FoodSelector />);

    // Select a food first to make the link appear
    const select = screen.getByLabelText(/food type/i);
    await userEvent.selectOptions(select, "0");

    const link = screen.getByRole("link", { name: /add another food type/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/omgmog/carbs-react/edit/main/src/constants/foods.ts",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  test("shows 'No food' option as default", () => {
    renderWithProvider(<FoodSelector />);

    const select = screen.getByLabelText(/food type/i);
    expect(select).toHaveValue("");
    expect(screen.getByRole("option", { name: "No food" })).toBeInTheDocument();
  });
});
