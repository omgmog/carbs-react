import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FoodProvider, useFood } from "./FoodContext";

const TestComponent = () => {
  const { food, setFood, portion, setPortion, foods } = useFood();

  return (
    <div>
      <div data-testid="food-index">{food}</div>
      <div data-testid="portion">{portion}</div>
      <div data-testid="foods-count">{foods.length}</div>
      <button onClick={() => setFood(2)}>Set Food</button>
      <button onClick={() => setPortion("150")}>Set Portion</button>
    </div>
  );
};

describe("FoodContext", () => {
  test("provides initial values", () => {
    render(
      <FoodProvider>
        <TestComponent />
      </FoodProvider>,
    );

    expect(screen.getByTestId("food-index")).toHaveTextContent("");
    expect(screen.getByTestId("portion")).toHaveTextContent("");
    expect(screen.getByTestId("foods-count")).toHaveTextContent(/\d+/);
  });

  test("allows updating food selection", async () => {
    render(
      <FoodProvider>
        <TestComponent />
      </FoodProvider>,
    );

    const setFoodButton = screen.getByText("Set Food");
    await userEvent.click(setFoodButton);

    expect(screen.getByTestId("food-index")).toHaveTextContent("2");
  });

  test("allows updating portion", async () => {
    render(
      <FoodProvider>
        <TestComponent />
      </FoodProvider>,
    );

    const setPortionButton = screen.getByText("Set Portion");
    await userEvent.click(setPortionButton);

    expect(screen.getByTestId("portion")).toHaveTextContent("150");
  });

  test("provides foods array", () => {
    render(
      <FoodProvider>
        <TestComponent />
      </FoodProvider>,
    );

    const foodsCount = screen.getByTestId("foods-count");
    expect(parseInt(foodsCount.textContent || "0")).toBeGreaterThan(0);
  });

  test("throws error when useFood used outside provider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useFood must be used within a FoodProvider");

    consoleError.mockRestore();
  });
});
