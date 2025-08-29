export const tooltipDefinitions = {
  // Blood glucose and monitoring
  BG: "Blood Glucose - Your current blood sugar level, measured in mmol/L (or mg/dL). Target range is usually 4-7 mmol/L for most people.",
  
  "Target BG": "Target Blood Glucose - Your desired blood sugar level. Insulin corrections are calculated to bring your BG to this target.",
  
  "Current BG": "Current Blood Glucose - Your blood sugar level right now, before taking insulin. Used to calculate if you need a correction dose.",

  // Insulin measurements and ratios
  IOB: "Insulin On Board - The amount of rapid-acting insulin still working in your body from previous injections. Affects correction dose calculations to prevent 'stacking' insulin.",
  
  ICR: "Insulin-to-Carb Ratio - How many grams of carbohydrates are covered by 1 unit of insulin. For example, 1:8 means 1 unit covers 8 grams of carbs.",
  
  ISF: "Insulin Sensitivity Factor - How much your blood glucose drops per 1 unit of insulin. For example, if your ISF is 2.0, then 1 unit of insulin will lower your BG by 2.0 mmol/L.",

  // Dose calculations and breakdowns
  "Carb bolus": "Carb Bolus - The insulin dose calculated specifically for the carbohydrates you're eating, based on your insulin-to-carb ratio.",
  
  "Correction bolus": "Correction Bolus - Additional insulin to bring high blood glucose back down to your target range, calculated using your insulin sensitivity factor.",
  
  "Dinner add-on": "High Fat/Protein Add-on - Extra insulin (usually 15%) added for meals high in fat and protein, which can cause delayed blood sugar rises.",

  // Advanced features
  TDD: "Total Daily Dose - The total amount of insulin you use in a typical day. Used to estimate insulin sensitivity and other parameters.",
  
  GI: "Glycemic Index - A measure of how quickly a food raises blood sugar. High-GI foods cause rapid spikes, low-GI foods cause slower, more sustained rises.",
  
  "Low-GI": "Low Glycemic Index - Foods that raise blood sugar slowly and steadily. May benefit from delayed insulin timing to match the gradual glucose rise.",
  
  "High-GI": "High Glycemic Index - Foods that raise blood sugar quickly. May benefit from pre-bolusing (taking insulin 10-15 minutes before eating) to match the rapid glucose rise.",

  // Injection planning
  "Max per shot": "Maximum Per Injection - The highest dose you can reliably inject at one site. Large doses may be split across multiple injection sites for better absorption.",
  
  "Injection plan": "Injection Plan - Detailed instructions for when and how much insulin to inject, including any delayed doses for fat/protein meals.",

  // Units and measurements
  "units": "Units of insulin - The standard measurement for insulin doses. Often abbreviated as 'u'.",
  
  "mmol/L": "Millimoles per liter - The standard unit for measuring blood glucose in most countries (except the US, which uses mg/dL).",
} as const;

export type TooltipKey = keyof typeof tooltipDefinitions;