import React, { useState, useEffect } from 'react';
import InstructionInput from './components/InstructionInput';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SimulationPage from './components/simulation';

function App() {
  const [instructions, setInstructions] = useState([]);
  const [everything, setEverything] = useState([]);
  const [config, setConfig] = useState({
    fpAddLatency: 2,
    fpMultLatency: 10,
    fpDivLatency: 40,
    loadLatency: 2,
    cacheSize: 1024,
    blockSize: 64,
  });
  const [registerFile, setRegisterFile] = useState({});
  const [reservationStations, setReservationStations] = useState({});
  const [loadStoreBuffers, setLoadStoreBuffers] = useState({});
  const [cacheStatus, setCacheStatus] = useState({});
  const [executionStatus, setExecutionStatus] = useState({});
  const [commonDataBus, setCommonDataBus] = useState(null);
  const [cycle, setCycle] = useState(0); // Initialize clock cycle to start from 0
  const [showSimulation, setShowSimulation] = useState(false); // New state to toggle visibility

  // useEffect(() => {  
  //   console.log(everything);
  // }, [everything]);

  return (
    <Router>
      <div className="App" style={{ margin: '0 auto', padding: '5px' }}>
        {/* Header Section: Flexbox container for alignment */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',}}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>
            Tomasulo Algorithm Simulator
          </h1>
          
          {/* Buttons Section */}
          <div style={{ display: 'flex', gap: '15px' }}>
            {/* Display Simulation Button */}
            {!showSimulation && (
              <button 
                style={{
                  backgroundColor: 'black', 
                  color: 'white', 
                  padding: '12px 24px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.3s ease'
                }} 
                onClick={() => setShowSimulation(true)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'black'}
              >
                Display Simulation
              </button>
            )}

            {/* Back Button */}
            {showSimulation && (
              <button 
                style={{
                  backgroundColor: 'black', 
                  color: 'white', 
                  padding: '12px 24px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.3s ease'
                }} 
                onClick={() => setShowSimulation(false)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'black'}
              >
                Back
              </button>
            )}
          </div>
        </div>

        {/* Conditionally render InstructionInput or SimulationPage */}
        {!showSimulation && (
          <div style={{ marginBottom: '40px' }}>
            <InstructionInput everything={everything} setEverything={setEverything} />
          </div>
        )}

        {showSimulation && (
          <SimulationPage everything={everything} />
        )}
      </div>
    </Router>
  );
}

export default App;
