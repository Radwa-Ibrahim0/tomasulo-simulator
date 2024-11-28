import React, { useState, useEffect } from 'react';
import RegisterFile from './RegisterFile';
import ReservationStations from './ReservationStations';
import BufferTable from './StoreLoadBranchBuffer';
import InstructionStatusTable from './ExecutionStatus';
import Cache from './Cache';
import Memory from './Memory';

export default function SimulationPage({ everything }) {
  const [cycle, setCycle] = useState(0); // Initialize clock cycle to start from 0
  const [instructions, setInstructions] = useState([]);
  const [splittedInstructions, setSplittedInstructions] = useState([]); // New state for split instructions
  const [registerFile, setRegisterFile] = useState({});
  const [reservationStations, setReservationStations] = useState({
    addStation: [],
    mulStation: [],
    branchStation: []
  });
  const [loadStoreBuffers, setLoadStoreBuffers] = useState({});
  const [updatedEverything, setUpdatedEverything] = useState(everything);

  useEffect(() => {
    // Initialize instructions and other states from 'everything'
    const initialInstructions = everything.filter(item => item.type === 'instruction');
    setInstructions(initialInstructions);
    // Initialize other states as needed
  }, [everything]);

  const incrementCycle = () => {
    setCycle(cycle + 1);
  };

  useEffect(() => {
    // Logic to handle cycle increment
  }, [cycle]);

  const addStation = updatedEverything.find(item => item.key === 'addStation')?.value || 0;
  const mulStation = updatedEverything.find(item => item.key === 'mulStation')?.value || 0;
  const loadBuffer = updatedEverything.find(item => item.key === 'loadBuffer')?.value || 0;
  const storeBuffer = updatedEverything.find(item => item.key === 'storeBuffer')?.value || 0;
  const branchBuffer = updatedEverything.find(item => item.key === 'branchBuffer')?.value || 0;

  const cacheSize = updatedEverything.find(item => item.key === 'cacheSize')?.value || 0;
  const blockSize = updatedEverything.find(item => item.key === 'cacheBlockSize')?.value || 0;

  const integerRegisters = updatedEverything.filter(item => item.registerType === 'integer').map(item => item.value);
  const floatRegisters = updatedEverything.filter(item => item.registerType === 'float').map(item => item.value);

  const instructionsData = updatedEverything.filter(item => item.type === 'instruction');
  const memoryValues = updatedEverything.filter(item => item.type === 'memory');

  const preprocessInstructions = (instructions) => {
    return instructions.map((instruction) => {
      let content = instruction.content;
      if (content.includes(':')) {
        content = content.split(':')[1].trim();
      }
      const parts = content.split(' ').map(part => part.replace(',', ''));
      const splitInstruction = {
        iteration: '',
        instruction: parts[0] || '',
        dest: parts[1] || '',
        j: parts[2] || '',
        k: parts[3] || '',
        issue: '',
        executionComplete: '',
        writeResult: ''
      };
      // console.log(splitInstruction); // Log the split instruction
      return splitInstruction;
    });
  };

  useEffect(() => {
    const processedInstructions = preprocessInstructions(everything.filter(item => item.type === 'instruction'));
    setSplittedInstructions(processedInstructions); // Set the split instructions
  }, [everything]); // Correct dependency array

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">MIPS Simulation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:col-span-1">
          {splittedInstructions && splittedInstructions.length > 0 && (
            <InstructionStatusTable instructions={splittedInstructions} />
          )}
        </div>
        <div className="md:col-span-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Cache cacheSize={cacheSize} blockSize={blockSize} />
          <Memory memoryValues={memoryValues} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <ReservationStations title="Addition Reservation Station" size={addStation} rows={reservationStations.addStation} />
          <ReservationStations title="Multiplication Reservation Station" size={mulStation} rows={reservationStations.mulStation} />
          <ReservationStations title="Branch Reservation Station" size={branchBuffer} rows={reservationStations.branchStation} />
          <BufferTable title="Load Buffer" size={loadBuffer} showVQ={false} />
          <BufferTable title="Store Buffer" size={storeBuffer} />
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <RegisterFile title="Floating Point Registers" size={32} values={floatRegisters} />
            <RegisterFile title="Integer Registers" size={32} values={integerRegisters} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4">
        <div className="text-2xl font-mono">
          Clock: <span className="font-bold">{cycle}</span>
        </div>
        <button 
          style={{
            backgroundColor: 'blue', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'background-color 0.3s ease'
          }} 
          onClick={incrementCycle}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'blue'}
        >
          Next Cycle
        </button>
      </div>
    </div>
  );
}

