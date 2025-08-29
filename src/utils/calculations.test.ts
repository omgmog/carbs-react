import { calculateTotalCarbs, isAlcohol, displayUnit } from "./calculations";
import { Food } from "../types/food";

describe("calculateTotalCarbs", () => {
  const testFood: Food = {
    label: "Test Food",
    value: 50,
    tags: [],
  };

  test("calculates carbs correctly with valid inputs", () => {
    const result = calculateTotalCarbs(testFood, "100");
    expect(result).toBe(50);
  });

  test("calculates carbs correctly with decimal values", () => {
    const food: Food = { label: "Fruit", value: 12.5, tags: [] };
    const result = calculateTotalCarbs(food, "80");
    expect(result).toBe(10);
  });

  test("handles empty portion string", () => {
    const result = calculateTotalCarbs(testFood, "");
    expect(result).toBe(0);
  });

  test("handles zero portion", () => {
    const result = calculateTotalCarbs(testFood, "0");
    expect(result).toBe(0);
  });

  test("rounds result to 1 decimal place", () => {
    const food: Food = { label: "Complex Food", value: 33.33, tags: [] };
    const result = calculateTotalCarbs(food, "150");
    expect(result).toBe(50);
  });

  test("handles very small portions", () => {
    const result = calculateTotalCarbs(testFood, "1");
    expect(result).toBe(0.5);
  });

  test("handles large portions", () => {
    const result = calculateTotalCarbs(testFood, "1000");
    expect(result).toBe(500);
  });

  test("handles decimal portion values", () => {
    const result = calculateTotalCarbs(testFood, "150.5");
    expect(result).toBe(75.3);
  });
});

describe("isAlcohol", () => {
  test("returns true for food with alcohol tag", () => {
    const alcoholFood: Food = {
      label: "Wine",
      value: 4,
      tags: ["alcohol"],
    };
    expect(isAlcohol(alcoholFood)).toBe(true);
  });

  test("returns true for food with alcohol tag among other tags", () => {
    const alcoholFood: Food = {
      label: "Cocktail",
      value: 8,
      tags: ["dessert", "alcohol", "high_gi"],
    };
    expect(isAlcohol(alcoholFood)).toBe(true);
  });

  test("returns false for food without alcohol tag", () => {
    const regularFood: Food = {
      label: "Bread",
      value: 50,
      tags: ["staple", "bread"],
    };
    expect(isAlcohol(regularFood)).toBe(false);
  });

  test("returns false for food with no tags", () => {
    const noTagsFood: Food = {
      label: "Plain Food",
      value: 25,
      tags: [],
    };
    expect(isAlcohol(noTagsFood)).toBe(false);
  });

  test("returns false for food with undefined tags", () => {
    const undefinedTagsFood: Food = {
      label: "Undefined Tags Food",
      value: 25,
    };
    expect(isAlcohol(undefinedTagsFood)).toBe(false);
  });

  test("returns false for undefined food", () => {
    expect(isAlcohol(undefined)).toBe(false);
  });
});

describe("displayUnit", () => {
  test('returns "ml" for alcohol food', () => {
    const alcoholFood: Food = {
      label: "Beer",
      value: 4,
      tags: ["alcohol"],
    };
    expect(displayUnit(alcoholFood)).toBe("ml");
  });

  test('returns "g" for non-alcohol food', () => {
    const regularFood: Food = {
      label: "Rice",
      value: 75,
      tags: ["grain", "rice"],
    };
    expect(displayUnit(regularFood)).toBe("g");
  });

  test('returns "g" for food with no tags', () => {
    const noTagsFood: Food = {
      label: "Unknown Food",
      value: 30,
      tags: [],
    };
    expect(displayUnit(noTagsFood)).toBe("g");
  });

  test('returns "g" for undefined food', () => {
    expect(displayUnit(undefined)).toBe("g");
  });

  test('returns "g" for food with undefined tags', () => {
    const undefinedTagsFood: Food = {
      label: "No Tags",
      value: 40,
    };
    expect(displayUnit(undefinedTagsFood)).toBe("g");
  });
});
