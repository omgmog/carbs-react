import { Food } from '../types/food';

export const calculateTotalCarbs = (food: Food, portion: string): number => {
  const portionNumber = portion ? Number(portion) : 0;
  return Number(((food.value / 100) * portionNumber).toFixed(1));
}; 