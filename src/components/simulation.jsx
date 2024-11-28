import React, { useState, useEffect } from 'react';
import RegisterFile from './RegisterFile';
import ReservationStations from './ReservationStations';
import BufferTable from './StoreLoadBuffer';
import InstructionStatusTable from './InstructionStatus';
import Cache from './Cache';
import Memory from './Memory';

export default function SimulationPage({ everything }) {
  const [cycle, setCycle] = useState(0); // Initialize clock cycle to start from 0
  const [instructions, setInstructions] = useState([]); // State for processed instructions
  const [originalInstructions, setOriginalInstructions] = useState([]); // State for original instructions
  const [registerFile, setRegisterFile] = useState({});
  const [reservationStations, setReservationStations] = useState({
    addStation: [],
    mulStation: [],
    branchStation: []
  });
  const [loadStoreBuffers, setLoadStoreBuffers] = useState({});
  const [updatedEverything, setUpdatedEverything] = useState(everything);
  const [integerRegistersArray, setIntegerRegistersArray] = useState([]);
  const [floatRegistersArray, setFloatRegistersArray] = useState([]);

  const [additionStationArray, setAdditionStationArray] = useState([]);
  const [multiplicationStationArray, setMultiplicationStationArray] = useState([]);
  const [branchBufferArray, setBranchBufferArray] = useState([]);
  const [loadBufferArray, setLoadBufferArray] = useState([]);
  const [storeBufferArray, setStoreBufferArray] = useState([]);
  const [shownInstructions, setShownInstructions] = useState([]); // New state for shown instructions

  useEffect(() => {
    // Initialize instructions and other states from 'everything'
    const initialInstructions = everything.filter(item => item.type === 'instruction');
    const splitInstructions = preprocessInstructions(initialInstructions);
    setInstructions(splitInstructions);
    setOriginalInstructions(splitInstructions);
    setShownInstructions(splitInstructions.slice(0, 1)); // Set the first instruction initially

    const addStation = everything.find(item => item.key === 'addStation')?.value || 0;
    const initialAdditionStationArray = Array.from({ length: addStation }, (_, index) => ({
      type: 'addStationRow',
      id: `A${index + 1}`,
      busy: 0,
      op: '',
      vj: '',
      vk: '',
      qj: '',
      qk: ''
    }));
    setAdditionStationArray(initialAdditionStationArray);

    const mulStation = everything.find(item => item.key === 'mulStation')?.value || 0;
    const initialMultiplicationStationArray = Array.from({ length: mulStation }, (_, index) => ({
      type: 'mulStationRow',
      id: `M${index + 1}`,
      busy: 0,
      op: '',
      vj: '',
      vk: '',
      qj: '',
      qk: ''
    }));
    setMultiplicationStationArray(initialMultiplicationStationArray);

    const branchBuffer = everything.find(item => item.key === 'branchBuffer')?.value || 0;
    const initialBranchBufferArray = Array.from({ length: branchBuffer }, (_, index) => ({
      type: 'branchBufferRow',
      id: `B${index + 1}`,
      busy: 0,
      op: '',
      vj: '',
      vk: '',
      qj: '',
      qk: ''
    }));
    setBranchBufferArray(initialBranchBufferArray);

    const loadBuffer = everything.find(item => item.key === 'loadBuffer')?.value || 0;
    const initialLoadBufferArray = Array.from({ length: loadBuffer }, (_, index) => ({
      type: 'loadBufferRow',
      id: `L${index + 1}`,
      busy: 0,
      address: ''
    }));
    setLoadBufferArray(initialLoadBufferArray);

    const storeBuffer = everything.find(item => item.key === 'storeBuffer')?.value || 0;
    const initialStoreBufferArray = Array.from({ length: storeBuffer }, (_, index) => ({
      type: 'storeBufferRow',
      id: `S${index + 1}`,
      busy: 0,
      address: '',
      v: '',
      q: ''
    }));
    setStoreBufferArray(initialStoreBufferArray);

    const initialIntegerRegistersArray = everything.filter(item => item.type === 'register' && item.registerType === 'integer')
      .map(reg => ({ ...reg, value: reg.value === '' ? 0 : reg.value }));
    setIntegerRegistersArray(initialIntegerRegistersArray);

    const initialFloatRegistersArray = everything.filter(item => item.type === 'register' && item.registerType === 'float')
      .map(reg => ({ ...reg, value: reg.value === '' ? 0 : reg.value }));
    setFloatRegistersArray(initialFloatRegistersArray);

    // Initialize other states as needed
    // console.log(initialAdditionStationArray);
    // console.log(initialMultiplicationStationArray);
    // console.log(initialBranchBufferArray);
    // console.log(initialLoadBufferArray);
    // console.log(initialStoreBufferArray);
    // console.log(initialIntegerRegistersArray);
    // console.log(initialFloatRegistersArray);
    // console.log(splitInstructions); // Log instructions after initialization
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

  const memoryValues = updatedEverything.filter(item => item.type === 'memory');

  const preprocessInstructions = (instructions) => {
    return instructions.map((instruction) => {
      let content = instruction.content;
      let label = instruction.label || '';
      if (content.includes(':')) {
        content = content.split(':')[1].trim();
      }
      const parts = content.split(' ').map(part => part.replace(',', ''));
      const splitInstruction = {
        iteration: '',
        instruction: parts[0] || '',
        dest: '',
        j: '',
        k: '',
        issue: '',
        executionStart: '',
        executionEnd: '',
        writeResult: '',
        label: label
      };
      if (['BEQ', 'BNE'].includes(parts[0])) {
        splitInstruction.j = parts[1] || '';
        splitInstruction.k = parts[2] || '';
        splitInstruction.dest = parts[3] || '';
      } else {
        splitInstruction.dest = parts[1] || '';
        splitInstruction.j = parts[2] || '';
        splitInstruction.k = parts[3] || '';
      }
      return splitInstruction;
    });
  };

  const issue = () => {
    const lastInstruction = shownInstructions[shownInstructions.length - 1];
    if (!lastInstruction || lastInstruction.issue) return; // Check if the instruction already has an issue value

    const isAdditionInstruction = ['ADDI', 'SUBI', 'ADD.D', 'SUB.D'].includes(lastInstruction.instruction);
    const isMultiplicationInstruction = ['MUL.D', 'DIV.D', 'MUL', 'DIV'].includes(lastInstruction.instruction);
    const isLoadInstruction = ['LD', 'LW', 'L.D', 'L.S'].includes(lastInstruction.instruction);
    const isStoreInstruction = ['SD', 'SW', 'S.D', 'S.S'].includes(lastInstruction.instruction);
    const isBranchInstruction = ['BNE', 'BEQ'].includes(lastInstruction.instruction);

    if (isAdditionInstruction) {
      const availableRow = additionStationArray.find(row => row.busy === 0);
      if (availableRow) {
        availableRow.busy = 1;
        availableRow.op = lastInstruction.instruction;

        const setRegisterValues = (register, value, vField, qField) => {
          if (register.startsWith('R')) {
            const regValue = integerRegistersArray.find(reg => reg.index === parseInt(register.slice(1)))?.value ?? 0;
            if (typeof regValue === 'number') {
              availableRow[vField] = regValue;
            } else {
              availableRow[qField] = regValue;
            }
          } else if (register.startsWith('F')) {
            const regValue = floatRegistersArray.find(reg => reg.index === parseInt(register.slice(1)))?.value ?? 0;
            if (typeof regValue === 'number') {
              availableRow[vField] = regValue;
            } else {
              availableRow[qField] = regValue;
            }
          } else if (!isNaN(register)) {
            availableRow[vField] = parseFloat(register);
          }
        };

        setRegisterValues(lastInstruction.j, lastInstruction.j, 'vj', 'qj');
        setRegisterValues(lastInstruction.k, lastInstruction.k, 'vk', 'qk');

        if (lastInstruction.dest.startsWith('R')) {
          const regIndex = parseInt(lastInstruction.dest.slice(1));
          integerRegistersArray[regIndex].value = availableRow.id;
        } else if (lastInstruction.dest.startsWith('F')) {
          const regIndex = parseInt(lastInstruction.dest.slice(1));
          floatRegistersArray[regIndex].value = availableRow.id;
        }

        setAdditionStationArray([...additionStationArray]);
        setIntegerRegistersArray([...integerRegistersArray]);
        setFloatRegistersArray([...floatRegistersArray]);

        // Update the issue field with the current clock cycle number
        const updatedInstructions = shownInstructions.map((instr, index) => 
          index === shownInstructions.length - 1 ? { ...instr, issue: cycle } : instr
        );
        setShownInstructions(updatedInstructions);

        // Add a new instruction from the instructions array to shownInstructions
        if (instructions.length > shownInstructions.length && !isBranchInstruction) {
          setShownInstructions(prev => [...prev, instructions[shownInstructions.length]]);
        }
      }
    } else if (isMultiplicationInstruction) {
      const availableRow = multiplicationStationArray.find(row => row.busy === 0);
      if (availableRow) {
        availableRow.busy = 1;
        availableRow.op = lastInstruction.instruction;

        const setRegisterValues = (register, value, vField, qField) => {
          if (register.startsWith('R')) {
            const regValue = integerRegistersArray.find(reg => reg.index === parseInt(register.slice(1)))?.value ?? 0;
            if (typeof regValue === 'number') {
              availableRow[vField] = regValue;
            } else {
              availableRow[qField] = regValue;
            }
          } else if (register.startsWith('F')) {
            const regValue = floatRegistersArray.find(reg => reg.index === parseInt(register.slice(1)))?.value ?? 0;
            if (typeof regValue === 'number') {
              availableRow[vField] = regValue;
            } else {
              availableRow[qField] = regValue;
            }
          } else if (!isNaN(register)) {
            availableRow[vField] = parseFloat(register);
          }
        };

        setRegisterValues(lastInstruction.j, lastInstruction.j, 'vj', 'qj');
        setRegisterValues(lastInstruction.k, lastInstruction.k, 'vk', 'qk');

        if (lastInstruction.dest.startsWith('R')) {
          const regIndex = parseInt(lastInstruction.dest.slice(1));
          integerRegistersArray[regIndex].value = availableRow.id;
        } else if (lastInstruction.dest.startsWith('F')) {
          const regIndex = parseInt(lastInstruction.dest.slice(1));
          floatRegistersArray[regIndex].value = availableRow.id;
        }

        setMultiplicationStationArray([...multiplicationStationArray]);
        setIntegerRegistersArray([...integerRegistersArray]);
        setFloatRegistersArray([...floatRegistersArray]);

        // Update the issue field with the current clock cycle number
        const updatedInstructions = shownInstructions.map((instr, index) => 
          index === shownInstructions.length - 1 ? { ...instr, issue: cycle } : instr
        );
        setShownInstructions(updatedInstructions);

        // Add a new instruction from the instructions array to shownInstructions
        if (instructions.length > shownInstructions.length && !isBranchInstruction) {
          setShownInstructions(prev => [...prev, instructions[shownInstructions.length]]);
        }
      }
    } else if (isLoadInstruction) {
      const availableRow = loadBufferArray.find(row => row.busy === 0);
      if (availableRow) {
        availableRow.busy = 1;
        availableRow.address = lastInstruction.j;

        if (lastInstruction.dest.startsWith('R')) {
          const regIndex = parseInt(lastInstruction.dest.slice(1));
          integerRegistersArray[regIndex].value = availableRow.id;
        } else if (lastInstruction.dest.startsWith('F')) {
          const regIndex = parseInt(lastInstruction.dest.slice(1));
          floatRegistersArray[regIndex].value = availableRow.id;
        }

        setLoadBufferArray([...loadBufferArray]);
        setIntegerRegistersArray([...integerRegistersArray]);
        setFloatRegistersArray([...floatRegistersArray]);

        // Update the issue field with the current clock cycle number
        const updatedInstructions = shownInstructions.map((instr, index) => 
          index === shownInstructions.length - 1 ? { ...instr, issue: cycle } : instr
        );
        setShownInstructions(updatedInstructions);

        // Add a new instruction from the instructions array to shownInstructions
        if (instructions.length > shownInstructions.length && !isBranchInstruction) {
          setShownInstructions(prev => [...prev, instructions[shownInstructions.length]]);
        }
      }
    } else if (isStoreInstruction) {
      const availableRow = storeBufferArray.find(row => row.busy === 0);
      if (availableRow) {
        availableRow.busy = 1;
        availableRow.address = lastInstruction.j;

        const destRegister = lastInstruction.dest;
        if (destRegister.startsWith('R')) {
          const regValue = integerRegistersArray.find(reg => reg.index === parseInt(destRegister.slice(1)))?.value ?? 0;
          if (typeof regValue === 'number') {
            availableRow.v = regValue;
          } else {
            availableRow.q = regValue;
          }
        } else if (destRegister.startsWith('F')) {
          const regValue = floatRegistersArray.find(reg => reg.index === parseInt(destRegister.slice(1)))?.value ?? 0;
          if (typeof regValue === 'number') {
            availableRow.v = regValue;
          } else {
            availableRow.q = regValue;
          }
        }

        setStoreBufferArray([...storeBufferArray]);
        setIntegerRegistersArray([...integerRegistersArray]);
        setFloatRegistersArray([...floatRegistersArray]);

        // Update the issue field with the current clock cycle number
        const updatedInstructions = shownInstructions.map((instr, index) => 
          index === shownInstructions.length - 1 ? { ...instr, issue: cycle } : instr
        );
        setShownInstructions(updatedInstructions);

        // Add a new instruction from the instructions array to shownInstructions
        if (instructions.length > shownInstructions.length && !isBranchInstruction) {
          setShownInstructions(prev => [...prev, instructions[shownInstructions.length]]);
        }
      }
    } else if (isBranchInstruction) {
      const availableRow = branchBufferArray.find(row => row.busy === 0);
      if (availableRow) {
        availableRow.busy = 1;
        availableRow.op = lastInstruction.instruction;

        const setRegisterValues = (register, value, vField, qField) => {
          if (register.startsWith('R')) {
            const regValue = integerRegistersArray.find(reg => reg.index === parseInt(register.slice(1)))?.value ?? 0;
            if (typeof regValue === 'number') {
              availableRow[vField] = regValue;
            } else {
              availableRow[qField] = regValue;
            }
          } else if (register.startsWith('F')) {
            const regValue = floatRegistersArray.find(reg => reg.index === parseInt(register.slice(1)))?.value ?? 0;
            if (typeof regValue === 'number') {
              availableRow[vField] = regValue;
            } else {
              availableRow[qField] = regValue;
            }
          } else if (!isNaN(register)) {
            availableRow[vField] = parseFloat(register);
          }
        };

        setRegisterValues(lastInstruction.j, lastInstruction.j, 'vj', 'qj');
        setRegisterValues(lastInstruction.k, lastInstruction.k, 'vk', 'qk');

        setBranchBufferArray([...branchBufferArray]);
        setIntegerRegistersArray([...integerRegistersArray]);
        setFloatRegistersArray([...floatRegistersArray]);

        // Update the issue field with the current clock cycle number
        const updatedInstructions = shownInstructions.map((instr, index) => 
          index === shownInstructions.length - 1 ? { ...instr, issue: cycle } : instr
        );
        setShownInstructions(updatedInstructions);

        // Add a new instruction from the instructions array to shownInstructions
        if (instructions.length > shownInstructions.length && !isBranchInstruction) {
          setShownInstructions(prev => [...prev, instructions[shownInstructions.length]]);
        }
      }
    }
  };

  useEffect(() => {
    // Logic to handle cycle increment
    const lastInstruction = shownInstructions[shownInstructions.length - 1];
    const isBranchInstruction = ['BNE', 'BEQ'].includes(lastInstruction?.instruction);
    if (lastInstruction) {
      console.log(lastInstruction.issue);
      if (!(isBranchInstruction && lastInstruction.executionEnd == null && lastInstruction.issue == null)) {
        if (!(instructions.length === shownInstructions.length && shownInstructions[shownInstructions.length - 1]?.issue != null)) {
          issue();
        }
      }
    }
  }, [cycle]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">MIPS Simulation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:col-span-1">
            <InstructionStatusTable instructions={shownInstructions} />
        </div>
        <div className="md:col-span-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Cache cacheSize={cacheSize} blockSize={blockSize} />
          <Memory memoryValues={memoryValues} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <ReservationStations title="Addition Reservation Station" size={addStation} rows={additionStationArray} />
          <ReservationStations title="Multiplication Reservation Station" size={mulStation} rows={multiplicationStationArray} />
          <ReservationStations title="Branch Reservation Station" size={branchBuffer} rows={branchBufferArray} />
          <BufferTable title="Load Buffer" size={loadBuffer} rows={loadBufferArray} showVQ={false} />
          <BufferTable title="Store Buffer" size={storeBuffer} rows={storeBufferArray} />
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <RegisterFile title="Integer Registers" registers={integerRegistersArray} />
            <RegisterFile title="Floating Point Registers" registers={floatRegistersArray} />
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

