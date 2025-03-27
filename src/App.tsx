import React from 'react';
import './styles/main.css';

import { FoodProvider } from './contexts/FoodContext';

import NavBar from './components/presentational/NavBar';
import FoodSelector from './components/containers/FoodSelector';
import PortionSize from './components/containers/PortionSize';
import TotalCarbs from './components/containers/TotalCarbs';

const App: React.FC = () => {
  return (
    <FoodProvider>
      <div className='main'>
        <NavBar />
        <div className='section'>
          <div className='container'>
            <FoodSelector />
            <PortionSize />
            <TotalCarbs />
          </div>
        </div>
      </div>
    </FoodProvider>
  );
};

export default App; 