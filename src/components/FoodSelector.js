function FoodSelector({food, setFood, focusPortion, foods}) {
    return (
        <div className="field">
            <label className="label" for="food">Food:</label>
            <div className="control">
                <div className="select is-fullwidth">
                    <select 
                        onChange={e=>{setFood(e.target.value); focusPortion()}} 
                        value={food}
                        id="food"
                    >
                        {foods.map((foodObj, index) => <option key={index} value={index}>{foodObj.label}</option>)}
                    </select>
                </div>
            </div>
            <p className="help">
                <b>{foods[food].label}</b> has <span>{foods[food].value}</span> carbohydrates per 100g <a className="button is-small is-light is-pulled-right" href="https://github.com/omgmog/carbs-react/edit/main/src/foods.js">Add another food type?</a>
            </p>
        </div>
    )
}

export default FoodSelector;