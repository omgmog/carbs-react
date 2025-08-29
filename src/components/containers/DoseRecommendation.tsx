import React, { useMemo, useState } from "react";
import { useFood } from "../../contexts/FoodContext";
import { calculateTotalCarbs } from "../../utils/calculations";
import {
  Meal,
  defaultSettings,
  DosingSettings,
  calcMealDose,
} from "../../utils/dosing";
import Tooltip from "../common/Tooltip";
import { tooltipDefinitions } from "../../constants/tooltipDefinitions";

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
        tags: food !== null ? foods[food]?.tags || [] : [],
      }),
    [settings, meal, totalCarbs, bg, iob, highFatProtein, foods, food],
  );


  return (
    <div className="my-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label htmlFor="extraCarbs" className="block text-sm font-bold mb-1">
                Extra carbs (g)
              </label>
              <input
                id="extraCarbs"
                type="number"
                step={1}
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded p-2"
                value={extraCarbs}
                onChange={(e) => setExtraCarbs(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold mb-1">Meal</label>
              <select
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded p-2"
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
            <label className="flex items-center gap-2 text-sm font-bold mt-6">
              <input
                type="checkbox"
                checked={highFatProtein}
                onChange={(e) => setHighFatProtein(e.target.checked)}
                className="rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
              High fat/protein meal
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold mb-1">
                <Tooltip content={tooltipDefinitions["Current BG"]}>
                  <span className="border-b border-dotted border-gray-400">
                    Current BG
                  </span>
                </Tooltip>{" "}
                (<Tooltip content={tooltipDefinitions["mmol/L"]}>
                  <span className="border-b border-dotted border-gray-400">
                    mmol/L
                  </span>
                </Tooltip>)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded p-2"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                <Tooltip content={tooltipDefinitions.IOB}>
                  <span className="border-b border-dotted border-gray-400">
                    IOB
                  </span>
                </Tooltip>{" "}
                (<Tooltip content={tooltipDefinitions.units}>
                  <span className="border-b border-dotted border-gray-400">
                    u
                  </span>
                </Tooltip>)
              </label>
              <input
                type="number"
                step={settings.penIncrement}
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded p-2"
                value={iob}
                onChange={(e) => setIob(e.target.value)}
              />
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

          {(result.plan.injectionsNow.length > 1 || result.delayed > 0) && (
            <div className="rounded-xl bg-slate-50 border p-3">
              <h4 className="font-medium">
                <Tooltip content={tooltipDefinitions["Injection plan"]}>
                  <span className="border-b border-dotted border-gray-400">
                    Injection plan
                  </span>
                </Tooltip>
              </h4>
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
          )}

          <details className="text-sm bg-gray-50 rounded-lg border p-3">
            <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800 select-none">Calculation Details</summary>
            <div className="mt-3 space-y-3">
              
              {/* Carb Information */}
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Carbohydrates</h5>
                <div className="space-y-1 pl-3">
                  <div>Carbs from selection: <strong>{carbsFromSelection.toFixed(1)} g</strong></div>
                  {extraCarbs && (
                    <div>+ Additional carbs: <strong>{(extraCarbs === "" ? 0 : Number(extraCarbs)).toFixed?.(1) ?? extraCarbs} g</strong></div>
                  )}
                  <div>Total carbs used: <strong>{totalCarbs.toFixed(1)} g</strong></div>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Settings</h5>
                <div className="space-y-1 pl-3">
                  <div>
                    <Tooltip content={tooltipDefinitions.ICR}>
                      <span className="border-b border-dotted border-gray-400">ICR</span>
                    </Tooltip> for {meal}: <strong>1:{settings.icr[meal]}</strong>
                  </div>
                  <div>
                    <Tooltip content={tooltipDefinitions.ISF}>
                      <span className="border-b border-dotted border-gray-400">ISF</span>
                    </Tooltip>: <strong>{settings.isf} mmol/L per unit</strong>
                  </div>
                  <div>
                    <Tooltip content={tooltipDefinitions["Target BG"]}>
                      <span className="border-b border-dotted border-gray-400">Target BG</span>
                    </Tooltip>: <strong>{settings.targetBG} mmol/L</strong>
                  </div>
                  <div>
                    <Tooltip content={tooltipDefinitions["Max per shot"]}>
                      <span className="border-b border-dotted border-gray-400">Max per shot</span>
                    </Tooltip>: <strong>{settings.maxSingleDose}u</strong>
                  </div>
                </div>
              </div>

              {/* Dose Breakdown */}
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Dose Breakdown</h5>
                <div className="space-y-1 pl-3">
                  <div>
                    <Tooltip content={tooltipDefinitions["Carb bolus"]}>
                      <span className="border-b border-dotted border-gray-400">Carb bolus</span>
                    </Tooltip>: <strong>{result.breakdown.carbBolus.toFixed(1)}u</strong>
                  </div>
                  <div>
                    <Tooltip content={tooltipDefinitions["Correction bolus"]}>
                      <span className="border-b border-dotted border-gray-400">Correction</span>
                    </Tooltip>: <strong>{result.breakdown.correctionBolus.toFixed(1)}u</strong>
                  </div>
                  <div>
                    <Tooltip content={tooltipDefinitions["Dinner add-on"]}>
                      <span className="border-b border-dotted border-gray-400">High fat/protein add-on</span>
                    </Tooltip>: <strong>{result.breakdown.proteinFatAddon.toFixed(1)}u</strong>
                  </div>
                  <div className="border-t border-gray-200 pt-1 mt-2 font-medium">
                    Total: <strong>{(result.breakdown.carbBolus + result.breakdown.correctionBolus + result.breakdown.proteinFatAddon).toFixed(1)}u</strong>
                  </div>
                </div>
              </div>
            </div>
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

        </div>
      </div>
    </div>
  );
};

export default DoseRecommendation;
