function PortionSize({portion, setPortion, fieldRef}) {
    return (
        <div className="field">
            <label className="label" for="portion">Portion size (g):</label>
            <div className="control is-expanded">
                <input 
                    type="number" 
                    inputMode="numeric" 
                    className="input" 
                    value={portion} 
                    onChange={e=>{setPortion(e.target.value)}}
                    ref={fieldRef}
                    id="portion"
                />
            </div>
        </div>
    )
}

export default PortionSize;