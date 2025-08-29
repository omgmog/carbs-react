import { useMemo } from "react";
import {
  DosingSettings,
  DoseInputs,
  DoseResult,
  calcMealDose,
  calcCorrectionDose,
  defaultSettings,
} from "./dosing";

export interface UseDoseCalculatorParams {
  settings?: DosingSettings;
  inputs: DoseInputs & { proteinFatHeavy?: boolean };
}

export interface DoseCalculatorResult {
  mealDose: DoseResult;
  correction: {
    raw: number;
    recommended: number;
  };
}

export function useDoseCalculator({
  settings = defaultSettings,
  inputs,
}: UseDoseCalculatorParams): DoseCalculatorResult {
  // Calculate meal-aware dose
  const mealDose = useMemo(
    () => calcMealDose(settings, inputs),
    [settings, inputs],
  );

  // Calculate correction dose (standalone, if needed)
  const correction = useMemo(
    () =>
      calcCorrectionDose({
        currentBG: inputs.currentBG,
        targetBG: settings.targetBG,
        isf: settings.isf,
        iob: inputs.iob,
        iobFraction: settings.iobFractionForCorrection,
        penIncrement: settings.penIncrement,
        maxDose: settings.maxDose,
        // Note: highFatProtein and tags are not relevant for correction dose
      }),
    [
      inputs.currentBG,
      settings.targetBG,
      settings.isf,
      inputs.iob,
      settings.iobFractionForCorrection,
      settings.penIncrement,
      settings.maxDose,
    ],
  );

  return { mealDose, correction };
}
