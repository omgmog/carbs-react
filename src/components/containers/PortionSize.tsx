import React from "react";
import { useFood } from "../../contexts/FoodContext";
import { displayUnit } from "../../utils/calculations";

const PortionSize: React.FC = () => {
  const { food, foods, portion, setPortion } = useFood();
  const selected = food !== null ? foods?.[food] : undefined;
  const unit = displayUnit(selected); // "g" or "ml"

  if (food === null) {
    return null; // Don't show portion input when no food is selected
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold mb-1" htmlFor="portion">
        Portion ({unit})
      </label>
      <input
        id="portion"
        type="number"
        step="1"
        value={portion}
        onChange={(e) => setPortion(e.target.value)}
        className="block w-full rounded border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 p-2"
        placeholder={`Enter amount in ${unit}`}
      />
    </div>
  );
};

export default PortionSize;
