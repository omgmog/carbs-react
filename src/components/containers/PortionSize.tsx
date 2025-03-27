import React, { useRef, useEffect } from 'react';
import { useFood } from '../../contexts/FoodContext';

const PortionSize: React.FC = () => {
    const { portion, setPortion } = useFood();
    const fieldRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fieldRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow empty string or numbers only
        if (value === '' || /^\d*$/.test(value)) {
            setPortion(value);
        }
    };

    return (
        <div className="field">
            <label className="label" htmlFor="portion">Portion size (g):</label>
            <div className="control is-expanded">
                <input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="input" 
                    value={portion} 
                    onChange={handleChange}
                    ref={fieldRef}
                    id="portion"
                    placeholder="Enter portion size"
                />
            </div>
        </div>
    );
};

export default PortionSize; 