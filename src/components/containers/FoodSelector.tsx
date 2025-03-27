import React from 'react';
import { useFood } from '../../contexts/FoodContext';

const FoodSelector: React.FC = () => {
    const { food, setFood, foods } = useFood();

    return (
        <div className="field">
            <label className="label" htmlFor="food">Food:</label>
            <div className="control">
                <div className="select is-fullwidth">
                    <select 
                        onChange={(e) => {
                            setFood(Number(e.target.value));
                        }} 
                        value={food}
                        id="food"
                    >
                        {foods.map((foodObj, index) => (
                            <option key={index} value={index}>{foodObj.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="help">
                <b>{foods[food].label}</b> has <span>{foods[food].value}</span> carbohydrates per 100g 
                <a className="button is-small is-light is-pulled-right" href="https://github.com/omgmog/carbs-react/edit/main/src/constants/foods.ts">Add another food type?</a>
            </p>
        </div>
    );
};

export default FoodSelector; 