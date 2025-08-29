import React from "react";
import { useFood } from "../../contexts/FoodContext";
import { displayUnit } from "../../utils/calculations";

const PortionSize: React.FC = () => {
  const { food, foods, portion, setPortion } = useFood();
  const selected = foods?.[food];
  const unit = displayUnit(selected); // "g" or "ml"

  return (
    <div>
      <label className="block text-sm font-bold mb-1" htmlFor="portion">
        Portion ({unit})
      </label>
      <input
        id="portion"
        type="number"
        step="1"
        value={portion}
        onChange={(e) => setPortion(e.target.value)}
        className="block w-full rounded border p-2"
        placeholder={`Enter amount in ${unit}`}
      />
    </div>
  );
};

export default PortionSize;
