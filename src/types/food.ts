export type FoodTag =
  | "staple"
  | "fruit"
  | "veg"
  | "grain"
  | "bread"
  | "pasta"
  | "rice"
  | "cereal"
  | "dessert"
  | "alcohol"
  | "high_gi"
  | "low_gi"
  | "high_fat_protein";

export interface Food {
  label: string;
  /** For normal foods: grams carbs per 100 g.
   *  For alcohol (tags includes "alcohol"): grams carbs per 100 ml. */
  value: number;
  tags?: FoodTag[];

  /** Optional dosing helpers (you can ignore if not using) */
  addonPct?: number; // e.g. 0.15 => +15% of carb bolus
  stagger?: { pct: number; delayMin: number }; // e.g. { pct: 0.3, delayMin: 90 }
}

export interface FoodContextType {
  food: number | null; // index into foods list, or null for no food
  setFood: (index: number | null) => void;
  portion: string; // user's portion (grams or ml, depending on food tags)
  setPortion: (size: string) => void;
  foods: Food[];
}
