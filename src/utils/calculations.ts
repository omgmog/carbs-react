import { Food } from "../types/food";

export const calculateTotalCarbs = (food: Food, portion: string): number => {
  const portionNumber = portion ? Number(portion) : 0;
  // value is g/100g for normal foods, or g/100ml for alcohols.
  return Number(((food.value / 100) * portionNumber).toFixed(1));
};

export const isAlcohol = (food?: Food) => !!food?.tags?.includes("alcohol");

export const displayUnit = (food?: Food) => (isAlcohol(food) ? "ml" : "g");
