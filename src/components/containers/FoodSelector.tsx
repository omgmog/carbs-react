import React from "react";
import { useFood } from "../../contexts/FoodContext";
import { displayUnit } from "../../utils/calculations";

const FoodSelector: React.FC = () => {
  const { food, setFood, foods } = useFood();

  return (
    <>
      <label className="block text-sm font-bold mb-1" htmlFor="food">
        Food type
      </label>
      <select
        onChange={(e) => setFood(Number(e.target.value))}
        value={food}
        id="food"
        className="block w-full rounded border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 p-2 mb-2"
      >
        {(() => {
          // Group foods by their first tag
          const groups: { [tag: string]: { index: number; label: string }[] } =
            {};
          foods.forEach((foodObj, index) => {
            const tag =
              foodObj.tags && foodObj.tags.length > 0
                ? foodObj.tags[0]
                : "Other";
            if (!groups[tag]) groups[tag] = [];
            groups[tag].push({ index, label: foodObj.label });
          });
          return Object.entries(groups).map(([tag, items]) => (
            <optgroup
              key={tag}
              label={tag.charAt(0).toUpperCase() + tag.slice(1)}
            >
              {items.map(({ index, label }) => (
                <option key={index} value={index}>
                  {label}
                </option>
              ))}
            </optgroup>
          ));
        })()}
      </select>
      <p className="text-xs text-gray-600 mx-1">
        <span>{foods[food]?.value}g</span> carbs per 100{" "}
        {displayUnit(foods[food])}
        <a
          className="ml-2 text-blue-600 hover:underline text-xs float-right"
          href="https://github.com/omgmog/carbs-react/edit/main/src/constants/foods.ts"
          target="_blank"
          rel="noopener noreferrer"
        >
          Add another food type?
        </a>
      </p>
    </>
  );
};

export default FoodSelector;
