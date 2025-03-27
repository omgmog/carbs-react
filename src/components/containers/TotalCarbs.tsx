import React from 'react';
import { useFood } from '../../contexts/FoodContext';
import { calculateTotalCarbs } from '../../utils/calculations';
import TotalCarbsDisplay from '../presentational/TotalCarbsDisplay';

const TotalCarbs: React.FC = () => {
    const { food, foods, portion } = useFood();
    const totalCarbs = calculateTotalCarbs(foods[food], portion);

    return <TotalCarbsDisplay totalCarbs={totalCarbs} portion={portion} />;
};

export default TotalCarbs; 