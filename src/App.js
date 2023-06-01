import { useRef, useState } from 'react';
import 'bulma/css/bulma.min.css';

import { foods } from './foods';

import NavBar from './components/NavBar';
import FoodSelector from './components/FoodSelector';
import PortionSize from './components/PortionSize';
import TotalCarbs from './components/TotalCarbs';


function App() {
  const [food,setFood] = useState(0);
  const [portion,setPortion] = useState(0);

  const portionRef = useRef(null);

  return (
    <div className='main'>
      <NavBar />
      <div className='section'>
        <div className='container'>
          <FoodSelector food={food} setFood={setFood} focusPortion={() => portionRef.current.focus()} foods={foods} />
          <PortionSize portion={portion} setPortion={setPortion} fieldRef={portionRef}/>
          <TotalCarbs food={food} foods={foods} portion={portion} />
        </div>
      </div>
    
    </div>
  );
}

export default App;
