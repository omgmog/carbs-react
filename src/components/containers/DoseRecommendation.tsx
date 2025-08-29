import React, { useMemo, useState } from "react";
import { useFood } from "../../contexts/FoodContext";
import { calculateTotalCarbs } from "../../utils/calculations";
import {
  Meal,
  defaultSettings,
  DosingSettings,
  calcMealDose,
  calcCorrectionDose,
} from "../../utils/dosing";

const mealOptions: { label: string; value: Meal }[] = [
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
];

const DoseRecommendation: React.FC = () => {
  const { food, foods, portion } = useFood();

  const [meal, setMeal] = useState<Meal>("breakfast");
  // state

  const [highFatProtein, setHighFatProtein] = useState<boolean>(false);
  const [settings] = useState<DosingSettings>(defaultSettings);

  const [bg, setBg] = useState<string>(settings.targetBG.toString());
  const [iob, setIob] = useState<string>("0");
  const [extraCarbs, setExtraCarbs] = useState<string>("");

  const carbsFromSelection = useMemo(
    () =>
      foods && typeof food === "number"
        ? calculateTotalCarbs(foods[food], portion)
        : 0,
    [foods, food, portion],
  );
  const totalCarbs = useMemo(
    () =>
      Math.max(
        0,
        Number(
          (
            carbsFromSelection + (extraCarbs === "" ? 0 : Number(extraCarbs))
          ).toFixed(1),
        ),
      ),
    [carbsFromSelection, extraCarbs],
  );

  const result = useMemo(
    () =>
      calcMealDose(settings, {
        meal,
        carbs: totalCarbs,
        currentBG: bg === "" ? 0 : Number(bg),
        iob: iob === "" ? 0 : Number(iob),
        highFatProtein,
        tags: foods[food]?.tags || [],
      }),
    [settings, meal, totalCarbs, bg, iob, highFatProtein, foods, food],
  );

  const correction = useMemo(
    () =>
      calcCorrectionDose({
        currentBG: bg === "" ? 0 : Number(bg),
        targetBG: settings.targetBG,
        isf: settings.isf,
        iob: iob === "" ? 0 : Number(iob),
        iobFraction: settings.iobFractionForCorrection,
        penIncrement: settings.penIncrement,
        maxDose: settings.maxDose,
      }),
    [
      bg,
      settings.targetBG,
      settings.isf,
      iob,
      settings.iobFractionForCorrection,
      settings.penIncrement,
      settings.maxDose,
    ],
  );

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium">
                Extra carbs (g)
              </label>
              <input
                type="number"
                step={1}
                className="w-full border rounded p-2"
                value={extraCarbs}
                onChange={(e) => setExtraCarbs(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Meal</label>
              <select
                className="w-full border rounded p-2"
                value={meal}
                onChange={(e) => setMeal(e.target.value as Meal)}
              >
                {mealOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm mt-6">
              <input
                type="checkbox"
                checked={highFatProtein}
                onChange={(e) => setHighFatProtein(e.target.checked)}
              />
              High fat/protein meal
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">
                Current BG (mmol/L)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border rounded p-2"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">IOB (u)</label>
              <input
                type="number"
                step={settings.penIncrement}
                className="w-full border rounded p-2"
                value={iob}
                onChange={(e) => setIob(e.target.value)}
              />
            </div>
          </div>

          <div className="text-sm opacity-80 space-y-1">
            <div>
              Carbs from selection:{" "}
              <strong>{carbsFromSelection.toFixed(1)} g</strong>
            </div>
            {extraCarbs && (
              <div>
                + Additional carbs:{" "}
                <strong>
                  {(extraCarbs === "" ? 0 : Number(extraCarbs)).toFixed?.(1) ??
                    extraCarbs}{" "}
                  g
                </strong>
              </div>
            )}
            <div>
              Total carbs used: <strong>{totalCarbs.toFixed(1)} g</strong>
            </div>
            <div>
              ICR for {meal}: <strong>1:{settings.icr[meal]}</strong>
            </div>
            <div>
              ISF: <strong>{settings.isf} mmol/L per unit</strong>
            </div>
            <div>
              Target BG: <strong>{settings.targetBG} mmol/L</strong>
            </div>
            <div>
              Max per shot: <strong>{settings.maxSingleDose}u</strong>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Suggested dose</h3>

          <div className="text-lg">
            <div>
              Now (total): <strong>{result.immediate}u</strong>
            </div>
            {result.delayedAfterMin && (
              <div>
                Later: <strong>{result.delayed}u</strong> in{" "}
                <strong>{result.delayedAfterMin} min</strong>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 border p-3">
            <h4 className="font-medium">Injection plan</h4>
            <ul className="list-disc pl-5 mt-2">
              {result.plan.injectionsNow.map((u, i) => (
                <li key={i}>
                  Inject <strong>{u}u</strong> now{" "}
                  {result.plan.injectionsNow.length > 1
                    ? `(site ${i + 1})`
                    : "(usual site)"}
                </li>
              ))}
              {typeof result.plan.injectionLater === "number" &&
                result.plan.injectionLater > 0 &&
                result.plan.delayMin && (
                  <li>
                    Then inject <strong>{result.plan.injectionLater}u</strong>{" "}
                    in <strong>{result.plan.delayMin} min</strong>
                    {meal === "dinner" ? " (to cover delayed digestion)" : ""}.
                  </li>
                )}
            </ul>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer">Breakdown</summary>
            <ul className="list-disc pl-5">
              <li>Carb bolus: {result.breakdown.carbBolus.toFixed(1)}u</li>
              <li>
                Correction: {result.breakdown.correctionBolus.toFixed(1)}u
              </li>
              <li>
                Dinner add-on: {result.breakdown.proteinFatAddon.toFixed(1)}u
              </li>
            </ul>
          </details>

          {result.notes?.length > 0 && (
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-sm">
              <ul className="list-disc pl-5">
                {result.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preserve your original standalone correction card style */}
          {correction.recommended > 0 && (
            <div className="bg-yellow-400 text-yellow-900 text-center rounded-lg p-4 mt-4 shadow font-semibold">
              Standalone Correction: {correction.recommended}u
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoseRecommendation;
