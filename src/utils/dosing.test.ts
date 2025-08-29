import {
  roundToPen,
  calcISFfromTDD,
  calcCorrectionDose,
  splitIntoInjections,
  buildSplitPlan,
  calcMealDose,
  defaultSettings,
  DosingSettings,
  DoseInputs,
} from "./dosing";

describe("roundToPen", () => {
  test("rounds to 0.5 increments correctly", () => {
    expect(roundToPen(2.3, 0.5)).toBe(2.5);
    expect(roundToPen(2.7, 0.5)).toBe(2.5);
    expect(roundToPen(2.8, 0.5)).toBe(3);
  });

  test("rounds to 1.0 increments correctly", () => {
    expect(roundToPen(2.3, 1)).toBe(2);
    expect(roundToPen(2.7, 1)).toBe(3);
  });

  test("clamps negative values to 0", () => {
    expect(roundToPen(-1.5, 0.5)).toBe(0);
    expect(roundToPen(-0.3, 0.5)).toBe(0);
  });

  test("handles zero input", () => {
    expect(roundToPen(0, 0.5)).toBe(0);
  });

  test("handles exact increments", () => {
    expect(roundToPen(2.5, 0.5)).toBe(2.5);
    expect(roundToPen(3, 1)).toBe(3);
  });
});

describe("calcISFfromTDD", () => {
  test("calculates ISF correctly for mmol/L mode", () => {
    expect(calcISFfromTDD(50, "mmol")).toBe(2);
    expect(calcISFfromTDD(100, "mmol")).toBe(1);
  });

  test("calculates ISF correctly for mg/dL mode", () => {
    expect(calcISFfromTDD(50, "mgdl")).toBe(36);
    expect(calcISFfromTDD(100, "mgdl")).toBe(18);
  });

  test("defaults to mmol mode", () => {
    expect(calcISFfromTDD(50)).toBe(2);
  });

  test("throws error for invalid TDD", () => {
    expect(() => calcISFfromTDD(0)).toThrow("TDD must be > 0");
    expect(() => calcISFfromTDD(-10)).toThrow("TDD must be > 0");
    expect(() => calcISFfromTDD(Infinity)).toThrow("TDD must be > 0");
  });
});

describe("calcCorrectionDose", () => {
  const baseParams = {
    currentBG: 8.0,
    targetBG: 6.0,
    isf: 2.0,
    penIncrement: 0.5,
    maxDose: 25,
  };

  test("calculates correction dose correctly", () => {
    const result = calcCorrectionDose(baseParams);
    expect(result.raw).toBe(1);
    expect(result.recommended).toBe(1);
  });

  test("returns zero when BG is at target", () => {
    const result = calcCorrectionDose({ ...baseParams, currentBG: 6.0 });
    expect(result.raw).toBe(0);
    expect(result.recommended).toBe(0);
  });

  test("returns zero when BG is below target", () => {
    const result = calcCorrectionDose({ ...baseParams, currentBG: 5.0 });
    expect(result.raw).toBe(0);
    expect(result.recommended).toBe(0);
  });

  test("accounts for IOB", () => {
    const result = calcCorrectionDose({
      ...baseParams,
      iob: 0.5,
      iobFraction: 1,
    });
    expect(result.raw).toBe(0.5);
    expect(result.recommended).toBe(0.5);
  });

  test("applies max dose cap", () => {
    const result = calcCorrectionDose({
      ...baseParams,
      currentBG: 20.0,
      maxDose: 5,
    });
    expect(result.recommended).toBe(5);
  });

  test("applies pen increment rounding", () => {
    const result = calcCorrectionDose({
      ...baseParams,
      currentBG: 7.6,
      isf: 2.0,
    });
    expect(result.recommended).toBe(1);
  });

  test("ignores tiny corrections below dead-band", () => {
    const result = calcCorrectionDose({
      ...baseParams,
      currentBG: 6.1,
      isf: 2.0,
    });
    expect(result.recommended).toBe(0);
  });

  test("throws error for invalid ISF", () => {
    expect(() => calcCorrectionDose({ ...baseParams, isf: 0 })).toThrow(
      "ISF must be > 0",
    );
    expect(() => calcCorrectionDose({ ...baseParams, isf: -1 })).toThrow(
      "ISF must be > 0",
    );
  });
});

describe("splitIntoInjections", () => {
  test("returns single injection when under max", () => {
    const result = splitIntoInjections(8, 12, 0.5);
    expect(result).toEqual([8]);
  });

  test("splits into multiple injections when over max", () => {
    const result = splitIntoInjections(18, 12, 0.5);
    expect(result).toEqual([9, 9]);
  });

  test("respects pen increment", () => {
    const result = splitIntoInjections(7.3, 12, 0.5);
    expect(result).toEqual([7.5]);
  });

  test("handles zero dose", () => {
    const result = splitIntoInjections(0, 12, 0.5);
    expect(result).toEqual([]);
  });

  test("handles negative dose", () => {
    const result = splitIntoInjections(-5, 12, 0.5);
    expect(result).toEqual([]);
  });

  test("creates appropriate number of shots for large doses", () => {
    const result = splitIntoInjections(30, 12, 0.5);
    expect(result.length).toBe(3);
    expect(result.reduce((a, b) => a + b, 0)).toBe(30);
    expect(Math.max(...result)).toBeLessThanOrEqual(12);
  });
});

describe("buildSplitPlan", () => {
  const baseParams = {
    totalDose: 10,
    penIncrement: 0.5,
    maxPerShot: 12,
  };

  test("creates plan for immediate dose only", () => {
    const result = buildSplitPlan(baseParams);
    expect(result.injectionsNow).toEqual([10]);
    expect(result.injectionLater).toBeUndefined();
    expect(result.delayMin).toBeUndefined();
  });

  test("creates staggered plan when specified", () => {
    const result = buildSplitPlan({
      ...baseParams,
      staggerPct: 0.3,
      staggerDelayMin: 90,
      reason: "high fat meal",
    });

    expect(result.injectionsNow).toEqual([7]);
    expect(result.injectionLater).toBe(3);
    expect(result.delayMin).toBe(90);
    expect(result.notes.some((n) => n.includes("high fat meal"))).toBe(true);
  });

  test("splits immediate dose when exceeds max per shot", () => {
    const result = buildSplitPlan({
      ...baseParams,
      totalDose: 20,
      maxPerShot: 10,
    });

    expect(result.injectionsNow).toEqual([10, 10]);
  });

  test("handles zero dose", () => {
    const result = buildSplitPlan({
      ...baseParams,
      totalDose: 0,
    });

    expect(result.injectionsNow).toEqual([]);
    expect(result.injectionLater).toBeUndefined();
  });
});

describe("calcMealDose", () => {
  const testInputs: DoseInputs = {
    meal: "breakfast",
    carbs: 50,
    currentBG: 6.0,
    iob: 0,
  };

  test("calculates basic meal dose correctly", () => {
    const result = calcMealDose(defaultSettings, testInputs);

    expect(result.breakdown.carbBolus).toBeCloseTo(50 / 8); // ICR for breakfast is 8
    expect(result.breakdown.correctionBolus).toBe(0); // BG at target
    expect(result.immediate).toBeCloseTo(6.5);
  });

  test("includes correction when BG is high", () => {
    const result = calcMealDose(defaultSettings, {
      ...testInputs,
      currentBG: 8.0,
    });

    expect(result.breakdown.correctionBolus).toBeGreaterThan(0);
    expect(result.immediate).toBeGreaterThan(6.5);
  });

  test("prevents dosing when BG is low (hypo)", () => {
    const result = calcMealDose(defaultSettings, {
      ...testInputs,
      currentBG: 3.5,
    });

    expect(result.immediate).toBe(0);
    expect(result.notes[0]).toContain("treat low before bolusing");
  });

  test("applies high fat/protein addon when enabled", () => {
    const result = calcMealDose(defaultSettings, {
      ...testInputs,
      highFatProtein: true,
    });

    expect(result.breakdown.proteinFatAddon).toBeGreaterThan(0);
    expect(result.immediate + result.delayed).toBeGreaterThan(6.5); // Total dose should be higher
  });

  test("creates staggered plan for high fat/protein meals", () => {
    const result = calcMealDose(defaultSettings, {
      ...testInputs,
      meal: "dinner",
      highFatProtein: true,
    });

    expect(result.delayed).toBeGreaterThan(0);
    expect(result.delayedAfterMin).toBe(90);
  });

  test("applies max dose cap", () => {
    const highCarbInputs: DoseInputs = {
      ...testInputs,
      carbs: 200,
      currentBG: 15.0,
    };

    const result = calcMealDose(defaultSettings, highCarbInputs);
    expect(result.immediate + result.delayed).toBeLessThanOrEqual(
      defaultSettings.maxDose,
    );
  });

  test("considers IOB in correction", () => {
    const result = calcMealDose(defaultSettings, {
      ...testInputs,
      currentBG: 8.0,
      iob: 1.0,
    });

    const resultWithoutIOB = calcMealDose(defaultSettings, {
      ...testInputs,
      currentBG: 8.0,
      iob: 0,
    });

    expect(result.breakdown.correctionBolus).toBeLessThan(
      resultWithoutIOB.breakdown.correctionBolus,
    );
  });

  test("handles different meals with different ICRs", () => {
    const breakfastResult = calcMealDose(defaultSettings, {
      ...testInputs,
      meal: "breakfast",
    });

    const lunchResult = calcMealDose(defaultSettings, {
      ...testInputs,
      meal: "lunch",
    });

    expect(breakfastResult.breakdown.carbBolus).not.toBe(
      lunchResult.breakdown.carbBolus,
    );
  });

  test("handles zero carbs", () => {
    const result = calcMealDose(defaultSettings, {
      ...testInputs,
      carbs: 0,
    });

    expect(result.breakdown.carbBolus).toBe(0);
  });
});
