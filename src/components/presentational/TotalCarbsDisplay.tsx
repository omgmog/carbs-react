import React from 'react';

interface TotalCarbsDisplayProps {
  totalCarbs: number;
  portion: string;
}

const TotalCarbsDisplay: React.FC<TotalCarbsDisplayProps> = ({ totalCarbs, portion }) => {
  return (
    <div className="notification is-success has-text-light has-text-centered">
      <div className="title is-1">{totalCarbs}g</div>
      <div className="title is-4">Carbohydrates per {portion || '0'}g</div>
    </div>
  );
};

export default TotalCarbsDisplay; 