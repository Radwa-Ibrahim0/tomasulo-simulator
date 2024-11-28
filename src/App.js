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
  const [cycle, setCycle] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false); // New state to toggle visibility

  const simulateCycle = () => {
    if (instructions.length > 0) {
      const instruction = instructions[0];
      if (canIssueInstruction(instruction)) {
        issueInstruction(instruction);
        setInstructions(instructions.slice(1));
      }
    }
    executeInstructions();
    writeResults();
    setRegisterFile({ ...registerFile });
    setReservationStations({ ...reservationStations });
    setLoadStoreBuffers({ ...loadStoreBuffers });
    setCacheStatus({ ...cacheStatus });
    setExecutionStatus({ ...executionStatus });
  };

  useEffect(() => {  
    simulateCycle();
  }, [cycle]);

  useEffect(() => {  
    console.log(everything);
  }, [everything]);

  const canIssueInstruction = (instruction) => {
    return true; // Placeholder for actual implementation
  };
  
  const issueInstruction = (instruction) => {
    // Issue the instruction to the appropriate reservation station or buffer
  };
  
  const executeInstructions = () => {
    // Execute instructions in reservation stations and load/store buffers
  };
  
  const writeResults = () => {
    // Write results to the CDB and update the register file
  };

  return (
    <Router>
      <div className="App" style={{ margin: '0 auto', maxWidth: '1200px', padding: '20px' }}>
        {/* Header Section */}
        <h1 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '20px' }}>
          Tomasulo Algorithm Simulator
        </h1>
        
        {/* Buttons Section: Flexbox container for alignment */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '30px' }}>
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
