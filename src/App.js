// App.js
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

  const simulateCycle = () => {
    // 1. Instruction issue
    if (instructions.length > 0) {
      const instruction = instructions[0];
      if (canIssueInstruction(instruction)) {
        issueInstruction(instruction);
        setInstructions(instructions.slice(1));
      }
    }

    // 2. Execution
    executeInstructions();

    // 3. Write result
    writeResults();

    // Update states
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
    // Check for structural hazards
    // Return true if the instruction can be issued
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
      <div className="App">
        <h1>Tomasulo Algorithm Simulator</h1>
        <InstructionInput everything={everything} setEverything={setEverything} />
        <Link to="/simulation">
          <button>Open Simulation Page</button>
        </Link>
        {/* <ConfigurationPanel config={config} setConfig={setConfig} />
        <RegisterFile registerFile={registerFile} />
        <ReservationStations stations={reservationStations} />
        <LoadStoreBuffers buffers={loadStoreBuffers} />
        <CacheStatus cacheStatus={cacheStatus} />
        <ExecutionStatus status={executionStatus} />
        <CommonDataBus data={commonDataBus} /> */}
        {/* <button onClick={simulateCycle}>Next Cycle</button>
        <div>Current Cycle: {cycle}</div> */}
      </div>
      <Routes>
        <Route path="/simulation" element={<SimulationPage everything={everything} />} />
      </Routes>
    </Router>
  );
}

export default App;