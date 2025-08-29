import React from "react";
import { useFood } from "../../contexts/FoodContext";
import { calculateTotalCarbs } from "../../utils/calculations";
import TotalCarbsDisplay from "../presentational/TotalCarbsDisplay";

const TotalCarbs: React.FC = () => {
  const { food, foods, portion } = useFood();
  
  if (food === null) {
    return null; // Don't show total carbs when no food is selected
  }
  
  const totalCarbs = calculateTotalCarbs(foods[food], portion);

  return <TotalCarbsDisplay totalCarbs={totalCarbs} portion={portion} />;
};

export default TotalCarbs;
