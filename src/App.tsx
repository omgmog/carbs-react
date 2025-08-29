import React from "react";
import "./styles/main.css";

import { FoodProvider } from "./contexts/FoodContext";

import FoodSelector from "./components/containers/FoodSelector";
import PortionSize from "./components/containers/PortionSize";
import TotalCarbs from "./components/containers/TotalCarbs";
import DoseRecommendation from "./components/containers/DoseRecommendation";

const App: React.FC = () => {
  return (
    <FoodProvider>
      <div className="main flex flex-col min-h-screen bg-gray-100">
        <div className="section flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-xl px-4 mb-auto mt-8">
            <FoodSelector />
            <PortionSize />
            <TotalCarbs />
            <DoseRecommendation />
          </div>
        </div>
      </div>
    </FoodProvider>
  );
};

export default App;
