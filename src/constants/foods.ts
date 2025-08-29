import { Food } from "../types/food";
export const DEFAULT_FOODS: Food[] = [
  // --- Staples (yours, kept at top) ---
  {
    label: "Potato (uncooked)",
    value: 17.0,
    tags: ["staple", "veg", "high_gi"],
  },
  {
    label: "Pasta (uncooked)",
    value: 75.0,
    tags: ["staple", "pasta", "grain", "low_gi"],
  },
  {
    label: "Whole wheat lasagne (uncooked)",
    value: 66.0,
    tags: ["staple", "pasta", "grain"],
  },
  {
    label: "Rice (white, uncooked)",
    value: 80.0,
    tags: ["staple", "rice", "grain", "high_gi"],
  },
  {
    label: "Sweet Potato (uncooked)",
    value: 20.0,
    tags: ["staple", "veg", "low_gi"],
  },
  { label: "Parsnips (uncooked)", value: 18.0, tags: ["staple", "veg"] },
  {
    label: "Butternut Squash (uncooked)",
    value: 12.0,
    tags: ["staple", "veg", "low_gi"],
  },
  {
    label: "Carrot (uncooked)",
    value: 10.0,
    tags: ["staple", "veg", "low_gi"],
  },
  { label: "Couscous (uncooked)", value: 77.43, tags: ["staple", "grain"] },
  { label: "Flour", value: 76.0, tags: ["staple", "grain", "high_gi"] },

  // --- Fruits (DAFNE examples) ---
  { label: "Apple (raw)", value: 10, tags: ["fruit", "low_gi"] },
  { label: "Grapes", value: 15, tags: ["fruit", "high_gi"] },
  { label: "Orange (whole)", value: 9, tags: ["fruit"] },
  { label: "Pear", value: 10, tags: ["fruit", "low_gi"] },

  // --- Breads / bakery ---
  { label: "Bread (average)", value: 45, tags: ["bread", "high_gi"] },
  { label: "French stick (baguette)", value: 50, tags: ["bread", "high_gi"] },
  { label: "Crumpet", value: 50, tags: ["bread"] },

  // --- Cereals ---
  { label: "Porridge oats (dry)", value: 70, tags: ["cereal", "low_gi"] },
  { label: "Weetabix", value: 100, tags: ["cereal"] },

  // --- Desserts ---
  {
    label: "Ice cream",
    value: 20,
    tags: ["dessert", "high_fat_protein"],
    addonPct: 0.15,
    stagger: { pct: 0.3, delayMin: 90 },
  },
  { label: "Sorbet", value: 25, tags: ["dessert"] },

  // --- Grains & flours ---
  {
    label: "Cornmeal (maize flour/polenta, dry)",
    value: 80,
    tags: ["grain", "high_gi"],
  },
  { label: "Rice flour", value: 75, tags: ["grain", "high_gi"] },
  { label: "Semolina (uncooked)", value: 75, tags: ["grain"] },
  { label: "Polenta (ready made)", value: 15, tags: ["grain"] },
  { label: "Yam (boiled)", value: 30, tags: ["veg", "grain"] },

  // --- Alcohols (per 100ml, DAFNE) ---
  { label: "Beer / Lager", value: 1.76, tags: ["alcohol"] },
  { label: "Ale (strong)", value: 6.16, tags: ["alcohol"] },
  { label: "Cider (dry)", value: 1.76, tags: ["alcohol"] },
  { label: "Cider (sweet)", value: 3.52, tags: ["alcohol"] },
  {
    label: "Baileys / cream liqueur",
    value: 20.0,
    tags: ["alcohol", "high_fat_protein"],
  },
];
