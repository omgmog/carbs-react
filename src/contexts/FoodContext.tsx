import React, { createContext, useContext, useState, ReactNode } from "react";
import { FoodContextType } from "../types/food";
import { DEFAULT_FOODS } from "../constants/foods";

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export const useFood = () => {
  const context = useContext(FoodContext);
  if (context === undefined) {
    throw new Error("useFood must be used within a FoodProvider");
  }
  return context;
};

interface FoodProviderProps {
  children: ReactNode;
}

export const FoodProvider: React.FC<FoodProviderProps> = ({ children }) => {
  const [food, setFood] = useState<number>(0);
  const [portion, setPortion] = useState<string>("");

  return (
    <FoodContext.Provider
      value={{ food, setFood, portion, setPortion, foods: DEFAULT_FOODS }}
    >
      {children}
    </FoodContext.Provider>
  );
};
