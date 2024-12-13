import React, { useState, useEffect, useRef } from 'react';
import RegisterFile from './RegisterFile';
import ReservationStations from './ReservationStations';
import BufferTable from './StoreLoadBuffer';
import InstructionStatusTable from './InstructionStatus';
import Cache from './Cache';
import Memory from './Memory';

export default function SimulationPage({ everything }) {
  // Global variables for hit rate and miss penalty
  const hitRate = everything.find(item => item.key === 'hitTime')?.value || 0;
  const missPenalty = everything.find(item => item.key === 'missPenalty')?.value || 0;

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
  const [cacheArray, setCacheArray] = useState([]);
  const [memoryArray, setMemoryArray] = useState([]);
  const [firstTimeCache, setFirstTimeCache] = useState(false);
  const [firstloadend, setfirstloadend] = useState(false);
  const [loadid,setloadid]=useState(0);
  const skipAddition = useRef(false);
  

  useEffect(() => {
    // Initialize instructions and other states from 'everything'
    const initialInstructions = everything.filter(item => item.type === 'instruction');
    // console.log(initialInstructions); // Log instructions before initialization 
    const splitInstructions = preprocessInstructions(initialInstructions);
    // console.log(splitInstructions); // Log instructions after initialization
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
      qk: '',
      latency: '',
      instructionId: ''
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
      qk: '',
      latency: '',
      instructionId: ''

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
      qk: '',
      latency: '',
      instructionId: ''
    }));
    setBranchBufferArray(initialBranchBufferArray);

    const loadBuffer = everything.find(item => item.key === 'loadBuffer')?.value || 0;
    const initialLoadBufferArray = Array.from({ length: loadBuffer }, (_, index) => ({
      type: 'loadBufferRow',
      id: `L${index + 1}`,
      busy: 0,
      address: '',
      latency: '',
      instructionId: ''
    }));
    setLoadBufferArray(initialLoadBufferArray);

    const storeBuffer = everything.find(item => item.key === 'storeBuffer')?.value || 0;
    const initialStoreBufferArray = Array.from({ length: storeBuffer }, (_, index) => ({
      type: 'storeBufferRow',
      id: `S${index + 1}`,
      busy: 0,
      address: '',
      v: '',
      q: '',
      latency: '',
      instructionId: ''
    }));
    setStoreBufferArray(initialStoreBufferArray);

    const initialIntegerRegistersArray = everything.filter(item => item.type === 'register' && item.registerType === 'integer')
      .map(reg => ({ ...reg, value: reg.value === '' ? 0 : reg.value }));
    setIntegerRegistersArray(initialIntegerRegistersArray);

    const initialFloatRegistersArray = everything.filter(item => item.type === 'register' && item.registerType === 'float')
      .map(reg => ({ ...reg, value: reg.value === '' ? 0 : reg.value }));
    setFloatRegistersArray(initialFloatRegistersArray);

    const cacheSize = everything.find(item => item.key === 'cacheSize')?.value || 0;
    const blockSize = everything.find(item => item.key === 'cacheBlockSize')?.value || 0;
    const numBlocks = Math.floor(cacheSize / blockSize);
    const rowsPerBlock = Math.floor(blockSize / 8);
    const initialCacheArray = Array.from({ length: numBlocks }, (_, i) => ({
      blockNumber: `B${i + 1}`,
      addresses: Array.from({ length: rowsPerBlock }, () => ({
        address: '',
        value: ''
      }))
    }));
    setCacheArray(initialCacheArray);

    const initialMemoryArray = everything.filter(item => item.type === 'memory')
      .sort((a, b) => a.address - b.address);
    setMemoryArray(initialMemoryArray);

    // Initialize other states as needed
    // console.log(initialAdditionStationArray);
    // console.log(initialMultiplicationStationArray);
    // console.log(initialBranchBufferArray);
    // console.log(initialLoadBufferArray);
    // console.log(initialStoreBufferArray);
    // console.log(initialIntegerRegistersArray);
    // console.log(initialFloatRegistersArray);
    // console.log(splitInstructions); // Log instructions after initialization
    // console.log(initialCacheArray); 
    // console.log(initialMemoryArray);
  }, [everything]);

  const isCacheEmpty = () => {
    return cacheArray.every(block => block.addresses.every(address => address.value === ''));
  };

  const checkCache = (startAddress, blockSize) => {
    const updatedCacheArray = cacheArray.map((block) => {
      if (block.blockNumber === 'B1') {
        const memoryBlock = memoryArray.filter(mem => 
          mem.address >= startAddress && mem.address < startAddress + blockSize
        );
        return {
          ...block,
          addresses: block.addresses.map((address, addressIndex) => {
            const memAddress = startAddress + addressIndex;
            const memoryValue = memoryBlock.find(mem => mem.address === memAddress)?.value || 0;
            return {
              ...address,
              address: memAddress,
              value: memoryValue
            };
          })
        };
      }
      return block;
    });
    setCacheArray(updatedCacheArray);
  };

  const incrementCycle = () => {

    setCycle(cycle + 1);
    if (cycle > 0) {

      const allBusyAddition = additionStationArray.every(item => item.busy === 1); 
      // && multiplicationStationArray.every(item => item.busy === 1) && loadBufferArray.every(item => item.busy === 1)
      let isAdditionInstruction;
      if((instructions[shownInstructions.length]))
        isAdditionInstruction = ['DADDI', 'DSUBI', 'ADD.D', 'SUB.D','ADD.S', 'SUB.S'].includes(JSON.stringify((instructions[shownInstructions.length -1]).instruction).trim().replace(/['"]+/g, ''));
      else 
        isAdditionInstruction = false;
      console.log(isAdditionInstruction);

      if (allBusyAddition && isAdditionInstruction)  {
        skipAddition.current=true;
      }
      writeback();
      execute();
      if (skipAddition.current===true) {
        skipAddition.current=false;
        return;
      }
      issue();
      // Add the next instruction from the instructions array to shownInstructions
      if (instructions.length > shownInstructions.length) {
        const lastShownInstruction = shownInstructions[shownInstructions.length - 1];
        const isLastBranchInstruction = ['BNE', 'BEQ'].includes(lastShownInstruction?.instruction);
        if (!isLastBranchInstruction || (isLastBranchInstruction && lastShownInstruction.executionEnd !== '')) {
          console.log("instruction array",instructions);
          console.log("instruction shown",shownInstructions);
          setShownInstructions(prev => [...prev, instructions[shownInstructions.length]]);
        }
      }
    }
    //add console.log for all my reservation stations
    // console.log("Add",additionStationArray);
    // console.log(multiplicationStationArray);
    // console.log(branchBufferArray);
    // console.log("Load",loadBufferArray);
    // console.log(storeBufferArray);
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
    return instructions.map((instruction, index) => {
      let content = instruction.content;
      let label = instruction.label || '';
      if (content.includes(':')) {
        content = content.split(':')[1].trim();
      }
      const parts = content.split(' ').map(part => part.replace(',', ''));
      const splitInstruction = {
        id: `I${index + 1}`, // Add unique ID
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

  const getLatency = (instruction) => {
    
    switch (instruction) {
    
      case 'ADD.D':
        return everything.find(item => item.key === 'addD')?.value || 0;
      case 'ADD.S':
        return everything.find(item => item.key === 'addS')?.value || 0;  
      case 'SUB.D':
        return everything.find(item => item.key === 'subD')?.value || 0;
      case 'SUB.S':
        return everything.find(item => item.key === 'subS')?.value || 0;  
      case 'MUL.D':
        return everything.find(item => item.key === 'mulD')?.value || 0;
      case 'MUL.S':
        return everything.find(item => item.key === 'mulS')?.value || 0;
      case 'DIV.D':
        return everything.find(item => item.key === 'divD')?.value || 0;
      case 'DIV.S':
        return everything.find(item => item.key === 'divS')?.value || 0;
      case 'DADDI':
        return everything.find(item => item.key === 'daddi')?.value || 0;
      case 'DSUBI':
        return everything.find(item => item.key === 'dsubi')?.value || 0;
      case 'LD':
        return everything.find(item => item.key === 'loadDouble')?.value || 0;
      case 'LW':
        return everything.find(item => item.key === 'loadWord')?.value || 0;
      case 'L.D':
        return everything.find(item => item.key === 'loadDfloat')?.value|| 0;
      case 'L.S':
        return everything.find(item => item.key === 'loadSingle')?.value || 0;
      case 'SD':
        return everything.find(item => item.key === 'storeDouble')?.value || 0;
      case 'SW':
        return everything.find(item => item.key === 'storeWord')?.value || 0;
      case 'S.D':
        return everything.find(item => item.key === 'storeDfloat')?.value || 0;
      case 'S.S':
        return everything.find(item => item.key === 'storeSingle')?.value || 0;
      case 'BEQ':
        return everything.find(item => item.key === 'beq')?.value || 0;
      case 'BNE':
        return everything.find(item => item.key === 'bne')?.value || 0;
      default:
        return 0;
    }
  };

  const issue = () => {
    const lastInstruction = shownInstructions[shownInstructions.length - 1];
    
    if (!lastInstruction || lastInstruction.issue) return; // Check if the instruction already has an issue value

    const isAdditionInstruction = ['DADDI', 'DSUBI', 'ADD.D', 'SUB.D','ADD.S', 'SUB.S'].includes(lastInstruction.instruction);
    const isMultiplicationInstruction = ['MUL.D', 'DIV.D','MUL.S','DIV.S'].includes(lastInstruction.instruction);
    const isLoadInstruction = ['LD', 'LW', 'L.D', 'L.S'].includes(lastInstruction.instruction);
    const isStoreInstruction = ['SD', 'SW', 'S.D', 'S.S'].includes(lastInstruction.instruction);
    const isBranchInstruction = ['BNE', 'BEQ'].includes(lastInstruction.instruction);

    if (isAdditionInstruction) {
      const availableRow = additionStationArray.find(row => row.busy === 0);
      if (availableRow) {
        availableRow.busy = 1;
        availableRow.op = lastInstruction.instruction;
        availableRow.latency = getLatency(lastInstruction.instruction);
        availableRow.instructionId = lastInstruction.id; // Pass unique ID

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
      }
    } else if (isMultiplicationInstruction) {
      const availableRow = multiplicationStationArray.find(row => row.busy === 0);
      if (availableRow) {
        availableRow.busy = 1;
        availableRow.op = lastInstruction.instruction;
        availableRow.latency = getLatency(lastInstruction.instruction);
        availableRow.instructionId = lastInstruction.id; // Pass unique ID

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
      }
    } else if (isLoadInstruction) {
      const availableRow = loadBufferArray.find(row => row.busy === 0);
      if (availableRow) {
        availableRow.busy = 1;
        availableRow.address = lastInstruction.j;
        availableRow.latency = getLatency(lastInstruction.instruction);
        availableRow.instructionId = lastInstruction.id; // Pass unique ID

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
      }
    } else if (isStoreInstruction) {
      const availableRow = storeBufferArray.find(row => row.busy === 0);
      if (availableRow) {
        availableRow.busy = 1;
        availableRow.address = lastInstruction.j;
        availableRow.latency = getLatency(lastInstruction.instruction);
        availableRow.instructionId = lastInstruction.id; // Pass unique ID

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
      }
    } else if (isBranchInstruction) {
      const availableRow = branchBufferArray.find(row => row.busy === 0);
      console.log("hereeeeeee");
      if (availableRow) {
        availableRow.busy = 1;
        availableRow.op = lastInstruction.instruction;
        availableRow.latency = getLatency(lastInstruction.instruction);
        availableRow.instructionId = lastInstruction.id; // Pass unique ID

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
          // if (instructions.length > shownInstructions.length) {
          //   setShownInstructions(prev => [...prev, instructions[shownInstructions.length]]);
          // }
        
    }
  }
    
  };

  const execute = () => {
    const updateExecutionStart = (stationArray, setStationArray, stationName) => {
      const updatedStationArray = stationArray.map(row => {
        if (row.busy === 1 && row.vj !== '' && row.vk !== '') {
          const instruction = shownInstructions.find(instr => instr.id === row.instructionId);
          if (instruction && row.latency === getLatency(instruction.instruction)) {
            instruction.executionStart = cycle;
            setShownInstructions([...shownInstructions]);
          }
          if(row.latency===0)
            instruction.executionEnd=cycle; 
          row.latency -= 1;
          const instructionToUpdate = shownInstructions.find(instr => instr.id === row.instructionId);
          // Check for loop simulation
          if (['BNE', 'BEQ'].includes(instructionToUpdate.instruction)) {
            const loopLabel = instructionToUpdate.dest;
            const loopStartIndex = instructions.findIndex(instr => instr.label === loopLabel);
            const loopEndIndex = instructions.findIndex(instr => instr.id === instructionToUpdate.id);

            if (loopStartIndex !== -1 && loopEndIndex !== -1) {
              const loopInstructions = instructions.slice(loopStartIndex, loopEndIndex + 1).map((instr, index) => ({
                ...instr,
                id: `I${instructions.length + index + 1}`, // Assign a new unique ID
                issue: '',
                executionStart: '',
                executionEnd: '',
                writeResult: ''
              }));

              if ((instructionToUpdate.instruction === 'BNE' && row.vj !== row.vk) ||
                  (instructionToUpdate.instruction === 'BEQ' && row.vj === row.vk)) {
                const updatedInstructions = [
                  ...instructions.slice(0, loopEndIndex + 1),
                  ...loopInstructions,
                  ...instructions.slice(loopEndIndex + 1)
                ];
                      // Remove the last line from shownInstructions
                // if (shownInstructions.length > 1) {
                //   setShownInstructions(prev => prev.slice(0, -1));
                // }
                console.log("updatedddddddddddd",updatedInstructions);
                setInstructions(updatedInstructions);
              }
            }
          }
        
        }
        return row;
      });
      setStationArray(updatedStationArray);
    };

    const updateExecutionStartLoad = (stationArray, setStationArray, stationName) => {
      const updatedStationArray = stationArray.map(row => {
        if (row.busy === 1) {
          const instruction = shownInstructions.find(instr => instr.id === row.instructionId);
          if (instruction && row.latency === getLatency(instruction.instruction) && !firstTimeCache) {
            instruction.executionStart = cycle;
            setShownInstructions([...shownInstructions]);
            
            if(isCacheEmpty()){
              checkCache(parseInt(row.address), blockSize);
              row.latency += missPenalty-1;
              setFirstTimeCache(true);
              setloadid(row.id);
            }
          }
          if(row.latency === 1 && loadid===row.id  ){
            setfirstloadend(true);
          }
          if(row.latency===0 && firstloadend ){
            instruction.executionEnd=cycle;  
          // if instruction is BEQ i want to check if the values of vj and vk are equal or not  

          }
          if (firstloadend && instruction.executionStart===''){
           console.log("executio start awel ", row.latency, instruction);
            row.latency += hitRate;
            instruction.executionStart=cycle;
          }
          

        if(loadid===row.id ){
          row.latency -= 1;
        }
        if(loadid!==row.id && firstloadend){
          row.latency -= 1;
        }
      }
        return row;
      });
      setStationArray(updatedStationArray);
    };

    const updateExecutionStartStore = (stationArray, setStationArray, stationName) => {
        const updatedStationArray = stationArray.map(row => {
          if (row.busy === 1 && row.v !== '' ) {
            const instruction = shownInstructions.find(instr => instr.id === row.instructionId);
            if (instruction && row.latency === getLatency(instruction.instruction) && !firstTimeCache) {
              instruction.executionStart = cycle;
              setShownInstructions([...shownInstructions]);
              if(isCacheEmpty()){
                checkCache(parseInt(row.address), blockSize);
                row.latency += missPenalty-1;
                setFirstTimeCache(true);
                setloadid(row.id);
              }
            }
            if(row.latency === 1 && loadid===row.id  ){
              setfirstloadend(true);
            }
            if(row.latency===0 && firstloadend ){
              instruction.executionEnd=cycle;  
            // console.log("el end bta3 both ", row.latency);        
            }
            if (firstloadend && instruction.executionStart===''){
            // console.log("executio start awel wahda el latency b t3ha", row.latency);
              row.latency += hitRate;
              instruction.executionStart=cycle;
            }
          if(loadid===row.id ){
            row.latency -= 1;
          }
          if(loadid!==row.id && firstloadend){
            row.latency -= 1;
          }

          }
          return row;
        });
        setStationArray(updatedStationArray);
    }

    updateExecutionStart(additionStationArray, setAdditionStationArray, 'Addition Station');
    updateExecutionStart(multiplicationStationArray, setMultiplicationStationArray, 'Multiplication Station');
    updateExecutionStart(branchBufferArray, setBranchBufferArray, 'Branch Buffer');
    updateExecutionStartLoad(loadBufferArray, setLoadBufferArray, 'Load Buffer');
    updateExecutionStartStore(storeBufferArray, setStoreBufferArray, 'Store Buffer');
    
  };
  
  const writeback = () => {
  let writebackDone = false; // Define writebackDone outside the function

  const processWriteback = (stationArray, setStationArray, stationName) => {
    const updatedStationArray = stationArray.map(row => {
      if (writebackDone) return row; // Skip further processing if writeback is done

      if (row.busy === 1 && row.latency <= -1) {
        let result;
        if (stationName === 'Addition Station') {
          if (row.op.startsWith('ADD') || row.op.startsWith('DADD')) {
            result = parseFloat(row.vj) + parseFloat(row.vk);
          } else if (row.op.startsWith('SUB') || row.op.startsWith('DSUB')) {
            result = parseFloat(row.vj) - parseFloat(row.vk);
          }
        }

        if (stationName === 'Multiplication Station') {
          if (row.op.startsWith('MUL')) {
            result = parseFloat(row.vj) * parseFloat(row.vk);
          } else if (row.op.startsWith('DIV')) {
            result = parseFloat(row.vj) / parseFloat(row.vk);
          }
        }
        
        if (stationName === 'Load Buffer') {
          const cacheBlock = cacheArray.find(block => block.blockNumber === 'B1');
          const cacheRow = cacheBlock.addresses.find(address => address.address === parseInt(row.address));
          result = cacheRow.value || 0;
        }

        if (stationName === 'Store Buffer') {
          const cacheBlock = cacheArray.find(block => block.blockNumber === 'B1');
          const cacheRow = cacheBlock.addresses.find(address => address.address === parseInt(row.address));
          cacheRow.value = row.v;
        }

        // Directly update the register files
        const updateRegisterFile = (registerArray, setRegisterArray) => {
          const updatedArray = [...registerArray];
          for (let i = 0; i < updatedArray.length; i++) {
            if (updatedArray[i].value === row.id) {
              updatedArray[i].value = result;
            }
          }
          setRegisterArray(updatedArray);
        };

        updateRegisterFile(integerRegistersArray, setIntegerRegistersArray);
        updateRegisterFile(floatRegistersArray, setFloatRegistersArray);

        // Loop over all reservation station rows to update Vj or Vk
        const updateReservationStations = (stations) => {
          stations.forEach(station => {
            station.forEach(stationRow => {
              if (stationRow.qj === row.id) {
                stationRow.vj = result;
                stationRow.qj = '';
              }
              if (stationRow.qk === row.id) {
                stationRow.vk = result;
                stationRow.qk = '';
              }
              if (station === storeBufferArray && stationRow.q === row.id) {
                stationRow.v = result;
                stationRow.q = '';
              }
            });
          });
        };

        updateReservationStations([additionStationArray, multiplicationStationArray, branchBufferArray, loadBufferArray, storeBufferArray]);

        // Directly update the writeResult field of the shownInstructions array
        const instructionToUpdate = shownInstructions.find(instr => instr.id === row.instructionId);
        if (instructionToUpdate && !['BEQ', 'BNE'].includes(instructionToUpdate.instruction)) {
          instructionToUpdate.writeResult = cycle;
          writebackDone = true;
        }

        const allBusyAddition = additionStationArray.every(item => item.busy === 1);
        // if (allBusyAddition) 
        //   skipAddition.current=true;
        // console.log(allBusy);
        // console.log(skip);
        row.busy = 0;
        row.op = '';
        row.v = '';
        row.q = '';
        row.address = '';
        row.vj = '';
        row.vk = '';
        row.qj = '';
        row.qk = '';
        row.latency = '';
        row.instructionId = '';
      }
      return row;
    });
    setStationArray(updatedStationArray);
  };

  processWriteback(additionStationArray, setAdditionStationArray, 'Addition Station');
  if (!writebackDone) processWriteback(multiplicationStationArray, setMultiplicationStationArray, 'Multiplication Station');
  if (!writebackDone) processWriteback(branchBufferArray, setBranchBufferArray, 'Branch Buffer');
  if (!writebackDone) processWriteback(loadBufferArray, setLoadBufferArray, 'Load Buffer');
  if (!writebackDone) processWriteback(storeBufferArray, setStoreBufferArray, 'Store Buffer');
};

  return (
    <div className="container mx-auto p-1 text-xs">
  <h1 className="text-lg font-bold mb-1">MIPS Simulation</h1>
  <div className="grid grid-cols-6 gap-4"> {/* Removed fixed height */}
    <div className="col-span-4 grid grid-rows-auto gap-1"> {/* Rows adjust dynamically */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2">
          <InstructionStatusTable instructions={shownInstructions} />
        </div>
        <div>
          <Cache cacheArray={cacheArray} />
        </div>
        <div>
          <Memory memoryArray={memoryArray} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <ReservationStations title="Addition RS" size={addStation} rows={additionStationArray} />
        <ReservationStations title="Multiplication RS" size={mulStation} rows={multiplicationStationArray} />
        <ReservationStations title="Branch RS" size={branchBuffer} rows={branchBufferArray} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <BufferTable title="Load Buffer" size={loadBuffer} rows={loadBufferArray} showVQ={false} />
        <BufferTable title="Store Buffer" size={storeBuffer} rows={storeBufferArray} />
      </div>
    </div>
    <div className="col-span-2 grid grid-cols-2 gap-4">
      <div>
        <RegisterFile title="Integer Registers" registers={integerRegistersArray} />
      </div>
      <div>
        <RegisterFile title="FP Registers" registers={floatRegistersArray} />
      </div>
    </div>
  </div>
  <div className="w-36 h-24 fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-2 text-sm flex flex-col justify-center items-center">
  <div className="font-mono mb-2 text-center">
    Clock: <span className="font-bold">{cycle}</span>
  </div>
  <button 
    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm transition duration-300 ease-in-out"
    onClick={incrementCycle}
  >
    Next Cycle
  </button>
</div>

</div>

  );
}
