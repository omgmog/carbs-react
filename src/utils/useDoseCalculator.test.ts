import { renderHook } from "@testing-library/react";
import {
  useDoseCalculator,
  UseDoseCalculatorParams,
} from "./useDoseCalculator";
import { defaultSettings, DosingSettings, DoseInputs } from "./dosing";

describe("useDoseCalculator", () => {
  const baseInputs: DoseInputs & { proteinFatHeavy?: boolean } = {
    meal: "breakfast",
    carbs: 50,
    currentBG: 7.0,
    iob: 0,
  };

  test("returns meal dose calculation", () => {
    const { result } = renderHook(() =>
      useDoseCalculator({
        settings: defaultSettings,
        inputs: baseInputs,
      }),
    );

    expect(result.current.mealDose).toBeDefined();
    expect(result.current.mealDose.immediate).toBeGreaterThan(0);
    expect(result.current.mealDose.breakdown).toBeDefined();
    expect(result.current.mealDose.breakdown.carbBolus).toBeGreaterThan(0);
  });

  test("returns correction dose calculation", () => {
    const { result } = renderHook(() =>
      useDoseCalculator({
        settings: defaultSettings,
        inputs: { ...baseInputs, currentBG: 8.5 },
      }),
    );

    expect(result.current.correction).toBeDefined();
    expect(result.current.correction.raw).toBeGreaterThan(0);
    expect(result.current.correction.recommended).toBeGreaterThan(0);
  });

  test("uses default settings when not provided", () => {
    const { result } = renderHook(() =>
      useDoseCalculator({
        inputs: baseInputs,
      }),
    );

    expect(result.current.mealDose).toBeDefined();
    expect(result.current.correction).toBeDefined();
  });

  test("recalculates when inputs change", () => {
    const { result, rerender } = renderHook(
      ({ inputs }: UseDoseCalculatorParams) =>
        useDoseCalculator({
          settings: defaultSettings,
          inputs,
        }),
      {
        initialProps: { inputs: baseInputs },
      },
    );

    const initialDose = result.current.mealDose.immediate;

    rerender({
      inputs: { ...baseInputs, carbs: 75 },
    });

    expect(result.current.mealDose.immediate).not.toBe(initialDose);
    expect(result.current.mealDose.immediate).toBeGreaterThan(initialDose);
  });

  test("recalculates when settings change", () => {
    const customSettings: DosingSettings = {
      ...defaultSettings,
      icr: { breakfast: 10, lunch: 9, dinner: 12 },
    };

    const { result, rerender } = renderHook(
      ({ settings, inputs }: UseDoseCalculatorParams) =>
        useDoseCalculator({
          settings,
          inputs,
        }),
      {
        initialProps: { settings: defaultSettings, inputs: baseInputs },
      },
    );

    const initialDose = result.current.mealDose.immediate;

    rerender({ settings: customSettings, inputs: baseInputs });

    expect(result.current.mealDose.immediate).not.toBe(initialDose);
  });

  test("handles different meal types", () => {
    const breakfastResult = renderHook(() =>
      useDoseCalculator({
        settings: defaultSettings,
        inputs: { ...baseInputs, meal: "breakfast" },
      }),
    );

    const lunchResult = renderHook(() =>
      useDoseCalculator({
        settings: defaultSettings,
        inputs: { ...baseInputs, meal: "lunch" },
      }),
    );

    expect(
      breakfastResult.result.current.mealDose.breakdown.carbBolus,
    ).not.toBe(lunchResult.result.current.mealDose.breakdown.carbBolus);
  });

  test("handles high fat/protein meals", () => {
    const regularResult = renderHook(() =>
      useDoseCalculator({
        settings: defaultSettings,
        inputs: baseInputs,
      }),
    );

    const hfpResult = renderHook(() =>
      useDoseCalculator({
        settings: defaultSettings,
        inputs: { ...baseInputs, highFatProtein: true },
      }),
    );

    expect(
      hfpResult.result.current.mealDose.breakdown.proteinFatAddon,
    ).toBeGreaterThan(
      regularResult.result.current.mealDose.breakdown.proteinFatAddon,
    );
  });

  test("handles IOB correctly", () => {
    const { result } = renderHook(() =>
      useDoseCalculator({
        settings: defaultSettings,
        inputs: { ...baseInputs, currentBG: 9.0, iob: 2.0 },
      }),
    );

    expect(result.current.correction.recommended).toBeGreaterThanOrEqual(0);
    expect(
      result.current.mealDose.breakdown.correctionBolus,
    ).toBeGreaterThanOrEqual(0);
  });

  test("handles zero carbs", () => {
    const { result } = renderHook(() =>
      useDoseCalculator({
        settings: defaultSettings,
        inputs: { ...baseInputs, carbs: 0 },
      }),
    );

    expect(result.current.mealDose.breakdown.carbBolus).toBe(0);
  });

  test("handles BG at target", () => {
    const { result } = renderHook(() =>
      useDoseCalculator({
        settings: defaultSettings,
        inputs: { ...baseInputs, currentBG: defaultSettings.targetBG },
      }),
    );

    expect(result.current.correction.recommended).toBe(0);
    expect(result.current.mealDose.breakdown.correctionBolus).toBe(0);
  });

  test("handles low BG scenario", () => {
    const { result } = renderHook(() =>
      useDoseCalculator({
        settings: defaultSettings,
        inputs: { ...baseInputs, currentBG: 3.5 },
      }),
    );

    expect(result.current.mealDose.immediate).toBe(0);
    expect(result.current.mealDose.notes).toContainEqual(
      expect.stringContaining("treat low before bolusing"),
    );
  });

  test("memoizes results correctly", () => {
    const { result, rerender } = renderHook(
      ({ inputs }: UseDoseCalculatorParams) =>
        useDoseCalculator({
          settings: defaultSettings,
          inputs,
        }),
      {
        initialProps: { inputs: baseInputs },
      },
    );

    const firstResult = result.current;

    rerender({ inputs: baseInputs });

    expect(result.current.mealDose).toBe(firstResult.mealDose);
    expect(result.current.correction).toBe(firstResult.correction);
  });
});
