import React from "react";

interface TotalCarbsDisplayProps {
  totalCarbs: number;
  portion: string;
}

const TotalCarbsDisplay: React.FC<TotalCarbsDisplayProps> = ({
  totalCarbs,
  portion,
}) => {
  return (
    <div className="bg-green-500 text-white text-center rounded-lg p-3 mt-4 shadow">
      <div className="text-4xl font-bold">{totalCarbs}g</div>
      <div className="text-lg">carbs per {portion || "0"}g</div>
    </div>
  );
};

export default TotalCarbsDisplay;
