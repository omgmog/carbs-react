import { FoodTag } from "../types/food";

export type Meal = "breakfast" | "lunch" | "dinner";

export interface DosingSettings {
  unitMode?: "mmol" | "mgdl"; // default: mmol
  icr: Record<Meal, number>; // grams per unit, e.g. { breakfast: 8, lunch: 7, dinner: 10 }
  isf: number; // mmol/L drop per unit (mg/dL per unit if unitMode=mgdl)
  targetBG: number; // mmol/L (or mg/dL)
  penIncrement: 0.5 | 1;
  maxDose: number; // overall cap for a single recommendation
  maxSingleDose: number; // max per single injection (e.g. 12u)
  considerIOB: boolean;
  iobFractionForCorrection: number; // 0..1 (how much IOB offsets correction)
  dinnerAddonPct: number; // e.g. 0.15 for +15% at dinner
  split: Record<Meal, { pct: number; delayMin: number }>; // pct is delayed fraction (0..1)
  giSplitDefaults?: {
    low_gi: { pct: number; delayMin: number };
    high_gi: { pct: number; delayMin: number };
  };
}

export interface DoseInputs {
  meal: Meal;
  carbs: number; // grams
  currentBG: number; // mmol/L by default
  iob?: number; // units (rapid-acting)
  highFatProtein?: boolean; // optional flag (e.g. heavy dinner)
  tags?: FoodTag[]; // optional food tags
}

export interface DoseResult {
  immediate: number; // total immediate dose (u)
  delayed: number; // delayed dose (u), if any
  delayedAfterMin: number | null; // minutes until delayed dose
  breakdown: {
    carbBolus: number;
    correctionBolus: number;
    proteinFatAddon: number;
  };
  plan: SplitPlan; // detailed injection plan
  notes: string[]; // explanatory messages
}

export interface SplitPlan {
  injectionsNow: number[]; // doses to inject now, rounded
  injectionLater?: number; // optional delayed dose
  delayMin?: number; // minutes
  notes: string[]; // messages for UI
}

/** Round to pen step and clamp to >= 0 */
export const roundToPen = (u: number, inc: number) =>
  Math.max(0, Math.round(u / inc) * inc);

const clamp = (n: number, min = 0, max = Number.POSITIVE_INFINITY) =>
  Math.max(min, Math.min(max, n));

/**
 * Estimate ISF from total daily dose.
 * - mmol/L mode: Rule of 100 (ISF = 100 / TDD)
 * - mg/dL mode: Rule of 1800 (ISF = 1800 / TDD)
 */
export function calcISFfromTDD(
  tdd: number,
  unitMode: "mmol" | "mgdl" = "mmol",
): number {
  if (!isFinite(tdd) || tdd <= 0) throw new Error("TDD must be > 0");
  return unitMode === "mgdl" ? 1800 / tdd : 100 / tdd;
}

/**
 * Calculate a correction bolus.
 * If BG <= target, returns 0.
 * Optionally subtract some/all IOB from the correction component.
 */
export function calcCorrectionDose(params: {
  currentBG: number;
  targetBG: number;
  isf: number; // mmol/L per unit
  iob?: number; // units
  iobFraction?: number; // 0..1
  penIncrement?: number; // default 0.5
  maxDose?: number; // safety cap
}): { raw: number; recommended: number } {
  const {
    currentBG,
    targetBG,
    isf,
    iob = 0,
    iobFraction = 1,
    penIncrement = 0.5,
    maxDose = 25,
  } = params;

  if (isf <= 0) throw new Error("ISF must be > 0");

  // How much BG above target we need to even consider correcting
  // (half a pen step translated into mmol/L via ISF)
  const eps = 1e-9;
  const minStep = penIncrement ?? 0.5;
  const minCorrDeltaBG = isf * (minStep / 2); // e.g., ISF 1.6 → 0.4 mmol/L

  const deltaBG = currentBG - targetBG;

  // Dead-band: ignore micro deltas that would round up to a tiny 0.5u nudge
  if (deltaBG <= minCorrDeltaBG + eps) {
    return { raw: 0, recommended: 0 };
  }

  // Compute correction in units and account for IOB
  let correction = deltaBG / isf;
  correction = Math.max(0, correction - iob * iobFraction);

  // After IOB, if the correction left is still < half a step, ignore it
  if (correction < minStep / 2 - eps) {
    return { raw: 0, recommended: 0 };
  }

  const capped = Math.min(correction, maxDose);
  const recommended = roundToPen(capped, minStep);
  return { raw: correction, recommended };
}

/** Split a total dose into multiple injections by maxPerShot, respecting penIncrement. */
export function splitIntoInjections(
  total: number,
  maxPerShot = 12,
  penIncrement = 0.5,
): number[] {
  const eps = 1e-9;
  const roundedTotal = Math.round(total / penIncrement) * penIncrement;
  if (roundedTotal <= 0) return [];

  // Decide how many shots we need based on the cap
  const shotsCount = Math.max(1, Math.ceil(roundedTotal / maxPerShot));

  // Evenly distribute, capped per shot
  const base = roundedTotal / shotsCount;
  const proposals: number[] = Array.from({ length: shotsCount }, () => base);

  // Cap each proposal
  for (let i = 0; i < proposals.length; i++) {
    proposals[i] = Math.min(proposals[i], maxPerShot);
  }

  // Round each to pen increment
  let shots = proposals.map((v) => Math.round(v / penIncrement) * penIncrement);

  // Reconcile rounding so the sum equals roundedTotal
  const sumShots = () => shots.reduce((a, b) => a + b, 0);
  let delta =
    Math.round((roundedTotal - sumShots()) / penIncrement) * penIncrement;

  // Function to try nudge a shot by +/- penIncrement within [0, maxPerShot]
  const tryAdjust = (sign: 1 | -1) => {
    const order = shots
      .map((v, i) => ({ v, i }))
      // Prefer adjusting the shot whose fractional part was largest/smallest originally
      .sort((a, b) =>
        sign === 1
          ? (a.v % penIncrement) - (b.v % penIncrement)
          : (b.v % penIncrement) - (a.v % penIncrement),
      );

    for (const { i } of order) {
      const candidate = shots[i] + sign * penIncrement;
      if (candidate >= penIncrement - eps && candidate <= maxPerShot + eps) {
        shots[i] = Math.round(candidate / penIncrement) * penIncrement;
        return true;
      }
    }
    return false;
  };

  let safety = 100;
  while (Math.abs(delta) >= penIncrement - eps && safety-- > 0) {
    const ok = delta > 0 ? tryAdjust(1) : tryAdjust(-1);
    if (!ok) break;
    delta =
      Math.round((roundedTotal - sumShots()) / penIncrement) * penIncrement;
  }

  // Remove zeros if any snuck in (shouldn't unless roundedTotal < penIncrement)
  shots = shots.filter((u) => u > eps);

  return shots;
}

/**
 * Build an injection plan with optional staggered later dose (for high fat/protein meals).
 * - Ensures per-injection cap and pen rounding are applied.
 */
export function buildSplitPlan(params: {
  totalDose: number; // total recommended dose
  penIncrement: number; // 0.5 or 1.0
  maxPerShot: number; // e.g. 12
  staggerPct?: number; // 0..1 of total to give later
  staggerDelayMin?: number; // minutes (e.g. 90)
  reason?: string; // e.g. "high fat/protein meal"
}): SplitPlan {
  const {
    totalDose,
    penIncrement,
    maxPerShot,
    staggerPct = 0,
    staggerDelayMin = 0,
    reason,
  } = params;

  const notes: string[] = [];
  const total = Math.max(0, totalDose);

  // Separate into now/later components
  const laterRaw = clamp(total * staggerPct, 0, total);
  const nowRaw = clamp(total - laterRaw, 0, total);

  // Split immediate shots
  const nowShots = splitIntoInjections(nowRaw, maxPerShot, penIncrement);

  // Delayed component: prefer a single shot later
  let laterDose: number | undefined;
  if (laterRaw > 0) {
    const cappedLater = Math.min(laterRaw, maxPerShot);
    laterDose = Math.max(
      0,
      Math.round(cappedLater / penIncrement) * penIncrement,
    );
    if (laterRaw > maxPerShot) {
      const overflow = laterRaw - cappedLater;
      const overflowRounded = Math.max(
        0,
        Math.round(overflow / penIncrement) * penIncrement,
      );
      if (overflowRounded > 0) {
        nowShots.push(overflowRounded);
        notes.push(
          `Delayed dose exceeded ${maxPerShot}u cap; moved ${overflowRounded}u to the immediate plan.`,
        );
      }
    }
  }

  if (nowShots.some((s) => s > maxPerShot)) {
    notes.push(
      `One or more immediate injections exceed ${maxPerShot}u; consider adding another site.`,
    );
  }
  if (nowShots.length > 1) {
    notes.push(
      `Split due to max ${maxPerShot}u per injection for reliable absorption.`,
    );
  }
  if (laterDose && staggerDelayMin) {
    notes.push(
      `Staggered ${laterDose}u at +${staggerDelayMin} min${
        reason ? ` (${reason})` : ""
      }.`,
    );
  }

  return {
    injectionsNow: nowShots,
    injectionLater: laterDose,
    delayMin: laterDose ? staggerDelayMin : undefined,
    notes,
  };
}

/** Main meal-aware dose calculator with split/stagger plan. */
export function calcMealDose(s: DosingSettings, d: DoseInputs): DoseResult {
  const notes: string[] = [];
  const penInc = s.penIncrement ?? 0.5;

  // Safety: treat hypo first
  const hypoThresh = s.unitMode === "mgdl" ? 70 : 3.9;
  if (d.currentBG < hypoThresh) {
    const msg = "BG below target range — treat low before bolusing.";
    return {
      immediate: 0,
      delayed: 0,
      delayedAfterMin: null,
      breakdown: { carbBolus: 0, correctionBolus: 0, proteinFatAddon: 0 },
      plan: { injectionsNow: [], notes: [msg] },
      notes: [msg],
    };
  }

  // --- Carb bolus ---
  const icr = s.icr[d.meal];
  const carbBolus = d.carbs > 0 && icr > 0 ? d.carbs / icr : 0;

  // --- Correction (with dead-band + IOB) ---
  const corr = calcCorrectionDose({
    currentBG: d.currentBG,
    targetBG: s.targetBG,
    isf: s.isf,
    iob: d.iob,
    iobFraction: s.iobFractionForCorrection,
    penIncrement: penInc,
    maxDose: s.maxDose,
  });
  const correctionBolus = corr.recommended; // rounded, dead-band applied
  if (correctionBolus > 0) {
    notes.push(
      `Correction applied: ${(d.currentBG - s.targetBG).toFixed(1)} mmol/L above target using ISF ${s.isf}.`
    );
    if (s.considerIOB && (d.iob ?? 0) > 0) notes.push(`IOB considered (${d.iob}u).`);
  }

  // --- High fat/protein add-on (only if checkbox is true) ---
  const useHFP = d.highFatProtein === true;
  const addonPct = useHFP ? s.dinnerAddonPct : 0;
  const proteinFatAddon = addonPct > 0 ? carbBolus * addonPct : 0;
  if (proteinFatAddon > 0) {
    notes.push(`High fat/protein add-on: +${Math.round(addonPct * 100)}% of carb bolus.`);
  }

  // --- Total (cap to maxDose) ---
  const totalRaw = carbBolus + correctionBolus + proteinFatAddon;
  const totalCapped = Math.min(totalRaw, s.maxDose);

  // --- Decide stagger source: HFP overrides, otherwise GI hint ---
  const mealSplit = s.split[d.meal];
  const dinnerFallback = s.split["dinner"];
  const giDefaults = s.giSplitDefaults ?? {
    low_gi: { pct: 0.3, delayMin: 60 },
    high_gi: { pct: 0, delayMin: 0 },
  };

  // GI-derived suggestion (only used if HFP is off)
  let giSplit = { pct: 0, delayMin: 0 };
  const tags = d.tags ?? [];
  if (!useHFP) {
    if (tags.includes("low_gi")) {
      giSplit = giDefaults.low_gi;
      if (giSplit.pct > 0) {
        notes.push(`Low-GI timing: suggesting ${Math.round(giSplit.pct * 100)}% at +${giSplit.delayMin} min (timing only).`);
      }
    } else if (tags.includes("high_gi")) {
      // No auto-stagger; just advise a pre-bolus in notes.
      notes.push("High-GI food: consider a pre-bolus (e.g., 10–15 min) if safe.");
    }
  }

  // Effective split choice
  // Priority: HFP (uses meal's configured split or falls back to dinner's) > GI suggestion > no split
  const effectiveSplit = useHFP
    ? (mealSplit?.pct && mealSplit.pct > 0 ? mealSplit : dinnerFallback)
    : giSplit;

  const shouldStagger = (effectiveSplit?.pct ?? 0) > 0;

  // Build injection plan (timing only; total preserved)
  const plan = buildSplitPlan({
    totalDose: totalCapped,
    penIncrement: penInc,
    maxPerShot: s.maxSingleDose,
    staggerPct: shouldStagger ? effectiveSplit.pct : 0,
    staggerDelayMin: shouldStagger ? effectiveSplit.delayMin : 0,
    reason: useHFP ? "high fat/protein meal" : (tags.includes("low_gi") ? "low-GI food" : undefined),
  });

  if (shouldStagger) {
    notes.push(
      `Stagger plan: ${Math.round((1 - effectiveSplit.pct) * 100)}/${Math.round(effectiveSplit.pct * 100)} split with +${effectiveSplit.delayMin} min delay.`
    );
  }

  // Final result
  return {
    immediate: plan.injectionsNow.reduce((a, b) => a + b, 0),
    delayed: plan.injectionLater ?? 0,
    delayedAfterMin: plan.delayMin ?? null,
    breakdown: { carbBolus, correctionBolus, proteinFatAddon },
    plan,
    notes,
  };
}


/** Defaults tailored to your profile */
export const defaultSettings: DosingSettings = {
  unitMode: "mmol",
  icr: { breakfast: 8, lunch: 7, dinner: 10 },
  isf: 1.6, // from TDD ~61u → 100/61 ≈ 1.6 mmol/L/u
  targetBG: 6.0,
  penIncrement: 0.5,
  maxDose: 25,
  maxSingleDose: 12,
  considerIOB: true,
  iobFractionForCorrection: 1,
  dinnerAddonPct: 0.15,
  split: {
    breakfast: { pct: 0, delayMin: 0 },
    lunch: { pct: 0, delayMin: 0 },
    dinner: { pct: 0.3, delayMin: 90 }, // used only when highFatProtein=true
  },
  giSplitDefaults: {
    low_gi: { pct: 0.3, delayMin: 60 }, // 70/30 with +60 min
    high_gi: { pct: 0,   delayMin: 0  }, // no stagger; consider pre-bolus (note only)
  }
};
