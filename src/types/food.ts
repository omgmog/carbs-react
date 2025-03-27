export interface Food {
  label: string;
  value: number;
}

export interface FoodContextType {
  food: number;
  setFood: (index: number) => void;
  portion: string;
  setPortion: (size: string) => void;
  foods: Food[];
} 