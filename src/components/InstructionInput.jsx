import React, { useState, useEffect , useRef} from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const InstructionInput = ({ everything, setEverything }) => {
  const [currentInstruction, setCurrentInstruction] = useState({
    operation: '',
    registers: ['', '', ''],
    label: '',
    immediate: '',
  });

  const [config, setConfig] = useState({
    cacheBlockSize: 64,
    cacheSize: 128,
    hitTime: 1,
    missPenalty: 4,
    memorySize: 2048,
    latencies: {
      addD: 1, subD: 1, mulD: 1, divD: 1,
      daddi: 1, dsubi: 1,
      loadWord: 1, loadDouble: 1, loadSingle: 1, loadDfloat:1,
      storeWord: 1, storeDouble: 1, storeSingle: 1,storeDfloat:1,
      beq: 1, bne: 1, addS: 1, subS: 1, mulS: 1, divS: 1 
    },
    stations: {
      mulStation: 2, 
      addStation: 3, 
      loadBuffer: 3, storeBuffer: 3, branchBuffer: 2
    }
  });

  const [memoryValues, setMemoryValues] = useState([]);
  const [memoryInput, setMemoryInput] = useState({ address: '', value: '' });

  const [registerValues, setRegisterValues] = useState({
    integer: Array(32).fill(''),
    float: Array(32).fill(''),
  });

  const [labels, setLabels] = useState([]);
  const selectRef = useRef(null);

  const operations = [
    "ADD.D", "SUB.D", "MUL.D", "DIV.D",
    "LW", "LD", "L.S", "L.D",
    "SW", "SD", "S.S", "S.D",
    "BEQ", "BNE",
    "DADDI", "DSUBI", "ADD.S", "SUB.S", "MUL.S", "DIV.S" // new operations
  ].filter(op => !['BEQ', 'BNE'].includes(op) || labels.length > 0);

  const generateRegisters = (prefix, count) => {
    return Array.from({ length: count }, (_, i) => `${prefix}${i}`);
  };

  const isAddInstructionDisabled = () => {
    if (!currentInstruction.operation) return true;

    if (['BEQ', 'BNE'].includes(currentInstruction.operation)) {
      return !currentInstruction.registers[0] || !currentInstruction.registers[1] || !currentInstruction.immediate;
    } else if (['DADDI', 'DSUBI'].includes(currentInstruction.operation)) {
      return !currentInstruction.registers[0] || !currentInstruction.registers[1] || currentInstruction.immediate === '';
    } else if (['LW', 'LD', 'SW', 'SD', 'L.S', 'L.D', 'S.S', 'S.D'].includes(currentInstruction.operation)) {
      return !currentInstruction.registers[0] || currentInstruction.immediate === '';
    } else if (['ADD.D', 'SUB.D', 'MUL.D', 'DIV.D','ADD.S','SUB.S', 'MUL.S', 'DIV.S'].includes(currentInstruction.operation)) {
      return currentInstruction.registers.slice(0, 3).some(reg => !reg);
    } else {
      return currentInstruction.registers.slice(0, 2).some(reg => !reg);
    }
  };

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentInstruction.operation]);

  const integerRegisters = generateRegisters("R", 32);
  const floatingRegisters = generateRegisters("F", 32);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const instructions = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            const [labelPart, instructionPart] = line.includes(':') ? line.split(':') : ['', line];
            return {
              type: 'instruction',
              label: labelPart.trim(),
              content: instructionPart.trim()
            };
          });

        let loopLabel = '';
        const updatedInstructions = instructions.map(instruction => {
          if (instruction.label) {
            loopLabel = instruction.label;
          }
          if (['BEQ', 'BNE'].includes(instruction.content.split(' ')[0]) && loopLabel) {
            instruction.label = loopLabel;
            loopLabel = '';
          }
          return instruction;
        });

        setEverything(prev => [...prev, ...updatedInstructions]);
      };
      reader.readAsText(file);
    }
  };

  const handleAddInstruction = () => {
    if (currentInstruction.operation) {
      let content = '';
      let loopLabel = '';

      if (currentInstruction.label) {
        content += `${currentInstruction.label}: `;
        loopLabel = currentInstruction.label;
        setLabels(prev => [...prev, currentInstruction.label]);
      }
      content += currentInstruction.operation;

      if (['BEQ', 'BNE'].includes(currentInstruction.operation)) {
        content += ` ${currentInstruction.registers[0]}, ${currentInstruction.registers[1]}, ${currentInstruction.immediate}`;
      } else if (['DADDI', 'DSUBI'].includes(currentInstruction.operation)) {
        content += ` ${currentInstruction.registers[0]}, ${currentInstruction.registers[1]}, ${currentInstruction.immediate}`;
      } else if (['LW', 'LD', 'SW', 'SD', 'L.S', 'L.D', 'S.S', 'S.D'].includes(currentInstruction.operation)) {
        content += ` ${currentInstruction.registers[0]}, ${currentInstruction.immediate}`;
      } else {
        content += ` ${currentInstruction.registers.filter(Boolean).join(', ')}`;
      }

      const instruction = {
        type: 'instruction',
        content: content.trim()
      };

      setEverything(prev => {
        const newEverything = [...prev, instruction];

        if (loopLabel) {
          for (let i = newEverything.length - 1; i >= 0; i--) {
            if (['BEQ', 'BNE'].includes(newEverything[i].content.split(' ')[0])) {
              newEverything[i].label = loopLabel;
              break;
            }
          }
        }

        return newEverything;
      });

      setCurrentInstruction({
        operation: '',
        registers: ['', '', ''],
        label: '',
        immediate: '',
      });
    }
  };

  const handleConfigChange = (category, key, value) => {
    const newValue = parseInt(value);
    if (category === 'cacheBlockSize' || category === 'cacheSize' || category === 'hitTime' || category === 'missPenalty' || category === 'memorySize') {
      setConfig(prev => ({
        ...prev,
        [category]: newValue
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: newValue
        }
      }));
    }
    setEverything(prev => prev.map(item => 
      item.key === key ? { ...item, value: newValue } : item
    ));
  };

  const handleMemoryValueChange = (key, value) => {
    setMemoryInput(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddMemoryValue = () => {
    const { address, value } = memoryInput;
    if (address && value) {
      const newMemoryValue = { address: parseInt(address), value: parseInt(value) };
      setMemoryValues(prev => {
        const updatedMemoryValues = [...prev, newMemoryValue].sort((a, b) => a.address - b.address);
        setEverything(prevEverything => [...prevEverything.filter(item => item.type !== 'memory'), ...updatedMemoryValues.map(item => ({ type: 'memory', ...item }))]);
        return updatedMemoryValues;
      });
      setMemoryInput({ address: '', value: '' });
    }
  };

  const handleRegisterValueChange = (type, index, value) => {
    const newValue = type === 'integer' ? parseInt(value) : parseFloat(value);
    setRegisterValues(prev => ({
      ...prev,
      [type]: prev[type].map((v, i) => i === index ? newValue : v)
    }));
    setEverything(prev => prev.map(item => 
      item.type === 'register' && item.registerType === type && item.index === index 
        ? { ...item, value: newValue } 
        : item
    ));
  };

  useEffect(() => {
    const initialEverything = [
      { type: 'config', key: 'cacheBlockSize', value: config.cacheBlockSize },
      { type: 'config', key: 'cacheSize', value: config.cacheSize },
      { type: 'config', key: 'hitTime', value: config.hitTime },
      { type: 'config', key: 'missPenalty', value: config.missPenalty },
      ...Object.entries(config.latencies).map(([key, value]) => ({
        type: 'latency',
        key,
        value
      })),
      ...Object.entries(config.stations).map(([key, value]) => ({
        type: 'station',
        key,
        value
      })),
      ...registerValues.integer.map((value, index) => ({
        type: 'register',
        registerType: 'integer',
        index,
        value
      })),
      ...registerValues.float.map((value, index) => ({
        type: 'register',
        registerType: 'float',
        index,
        value
      }))
    ];
    setEverything(initialEverything);
  }, []); // Empty dependency array to run only once

  return (
    <div>
    <h1 className="text-lg font-bold mb-1">MIPS Input</h1>
    <div className="grid grid-cols-8 gap-4">
      
    <div className="col-span-5 grid grid-rows-2 gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Tabs defaultValue="file-upload" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="file-upload">File Upload</TabsTrigger>
              <TabsTrigger value="instruction-builder">Instruction Builder</TabsTrigger>
            </TabsList>

            <TabsContent value="file-upload">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-xs">File Upload</CardTitle>
                  <CardDescription>Upload a text file with MIPS instructions</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <Input type="file" accept=".txt" onChange={handleFileUpload} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instruction-builder">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-xs">Instruction Builder</CardTitle>
                  <CardDescription>Build instructions interactively</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Label (optional)</Label>
                      <Input
                        value={currentInstruction.label}
                        onChange={(e) => setCurrentInstruction(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="Enter label"
                      />
                    </div>
                    <div ref={selectRef}>
                      <Label>Operation</Label>
                      <Select
                        value={currentInstruction.operation}
                        onValueChange={(value) => setCurrentInstruction(prev => ({
                          ...prev,
                          operation: value,
                          registers: ['', '', ''],
                          immediate: '',
                        }))}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select operation" />
                        </SelectTrigger>
                        <SelectContent className="bg-white shadow-md rounded-md border border-gray-300">                          {operations.map((op) => (
                            <SelectItem key={op} value={op}>{op}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {['BEQ', 'BNE'].includes(currentInstruction.operation) && labels.length > 0 ? (
                      <>
                        <div>
                          <Label>Register 1</Label>
                          <Select
                            value={currentInstruction.registers[0]}
                            onValueChange={(value) => {
                              const newRegisters = [...currentInstruction.registers];
                              newRegisters[0] = value;
                              setCurrentInstruction(prev => ({
                                ...prev,
                                registers: newRegisters
                              }));
                            }}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select R1" />
                            </SelectTrigger>
                            <SelectContent className="bg-white shadow-md rounded-md border border-gray-300">                              {integerRegisters.map((reg) => (
                                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Register 2</Label>
                          <Select
                            value={currentInstruction.registers[1]}
                            onValueChange={(value) => {
                              const newRegisters = [...currentInstruction.registers];
                              newRegisters[1] = value;
                              setCurrentInstruction(prev => ({
                                ...prev,
                                registers: newRegisters
                              }));
                            }}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select R2" />
                            </SelectTrigger>
                            <SelectContent className="bg-white shadow-md rounded-md border border-gray-300">                                {integerRegisters.map((reg) => (
                                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Label</Label>
                          <Select
                            value={currentInstruction.immediate}
                            onValueChange={(value) => setCurrentInstruction(prev => ({
                              ...prev,
                              immediate: value
                            }))}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select label" />
                            </SelectTrigger>
                            <SelectContent className="bg-white shadow-md rounded-md border border-gray-300">                              {labels.map((label) => (
                                <SelectItem key={label} value={label}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : ['DADDI', 'DSUBI'].includes(currentInstruction.operation) ? (
                      <>
                        <div>
                          <Label>Register 1</Label>
                          <Select
                            value={currentInstruction.registers[0]}
                            onValueChange={(value) => {
                              const newRegisters = [...currentInstruction.registers];
                              newRegisters[0] = value;
                              setCurrentInstruction(prev => ({
                                ...prev,
                                registers: newRegisters
                              }));
                            }}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select R1" />
                            </SelectTrigger>
                            <SelectContent className="bg-white shadow-md rounded-md border border-gray-300">                              {integerRegisters.map((reg) => (
                                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Register 2</Label>
                          <Select
                            value={currentInstruction.registers[1]}
                            onValueChange={(value) => {
                              const newRegisters = [...currentInstruction.registers];
                              newRegisters[1] = value;
                              setCurrentInstruction(prev => ({
                                ...prev,
                                registers: newRegisters
                              }));
                            }}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select R2" />
                            </SelectTrigger>
                            <SelectContent className="bg-white shadow-md rounded-md border border-gray-300">                              {integerRegisters.map((reg) => (
                                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Immediate</Label>
                          <Input
                            type="number"
                            value={currentInstruction.immediate}
                            onChange={(e) => setCurrentInstruction(prev => ({
                              ...prev,
                              immediate: e.target.value
                            }))}
                            placeholder="Enter immediate value"
                          />
                        </div>
                      </>
                    ) : ['LW', 'LD', 'SW', 'SD', 'L.S', 'S.S'].includes(currentInstruction.operation) ? (
                      <>
                        <div>
                          <Label>Register 1</Label>
                          <Select
                            value={currentInstruction.registers[0]}
                            onValueChange={(value) => {
                              const newRegisters = [...currentInstruction.registers];
                              newRegisters[0] = value;
                              setCurrentInstruction(prev => ({
                                ...prev,
                                registers: newRegisters
                              }));
                            }}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select R1" />
                            </SelectTrigger>
                            <SelectContent className="bg-white shadow-md rounded-md border border-gray-300">                              {integerRegisters.map((reg) => (
                                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input
                            type="number"
                            value={currentInstruction.immediate}
                            onChange={(e) => setCurrentInstruction(prev => ({
                              ...prev,
                              immediate: e.target.value
                            }))}
                            placeholder="Enter address"
                            min="0"
                          />
                        </div>
                      </>
                    ) : ['L.D', 'S.D'].includes(currentInstruction.operation) ? (
                      <>
                        <div>
                          <Label>Register 1</Label>
                          <Select
                            value={currentInstruction.registers[0]}
                            onValueChange={(value) => {
                              const newRegisters = [...currentInstruction.registers];
                              newRegisters[0] = value;
                              setCurrentInstruction(prev => ({
                                ...prev,
                                registers: newRegisters
                              }));
                            }}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select F1" />
                            </SelectTrigger>
                            <SelectContent className="bg-white shadow-md rounded-md border border-gray-300">                              {floatingRegisters.map((reg) => (
                                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input
                            type="number"
                            value={currentInstruction.immediate}
                            onChange={(e) => setCurrentInstruction(prev => ({
                              ...prev,
                              immediate: e.target.value
                            }))}
                            placeholder="Enter address"
                            min="0"
                          />
                        </div>
                      </>
                    ) : ['ADD.D', 'SUB.D', 'MUL.D', 'DIV.D'].includes(currentInstruction.operation) ? (
                      currentInstruction.registers.map((_, i) => (
                        <div key={i}>
                          <Label>Register {i + 1}</Label>
                          <Select
                            value={currentInstruction.registers[i]}
                            onValueChange={(value) => {
                              const newRegisters = [...currentInstruction.registers];
                              newRegisters[i] = value;
                              setCurrentInstruction(prev => ({
                                ...prev,
                                registers: newRegisters
                              }));
                            }}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder={`Select F${i + 1}`} />
                            </SelectTrigger>
                            <SelectContent className="bg-white shadow-md rounded-md border border-gray-300">                              {floatingRegisters.map((reg) => (
                                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))
                    ) : (
                      currentInstruction.registers.map((_, i) => (
                        <div key={i}>
                          <Label>Register {i + 1}</Label>
                          <Select
                            value={currentInstruction.registers[i]}
                            onValueChange={(value) => {
                              const newRegisters = [...currentInstruction.registers];
                              newRegisters[i] = value;
                              setCurrentInstruction(prev => ({
                                ...prev,
                                registers: newRegisters
                              }));
                            }}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder={`Select R${i + 1}`} />
                            </SelectTrigger>
                            <SelectContent className="bg-white shadow-md rounded-md border border-gray-300">                              {(currentInstruction.operation.includes('.D') ? floatingRegisters : integerRegisters)
                                .map((reg) => (
                                  <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))
                    )}
                  </div>
                  <Button 
                    className="w-full mt-4 bg-black text-white hover:bg-gray-800" 
                    onClick={handleAddInstruction}
                    disabled={isAddInstructionDisabled()}
                  >
                    Add Instruction
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-xs">Current Instructions</CardTitle>
              <CardDescription>List of all added instructions</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="bg-gray-100 p-2 rounded-md space-y-1 min-h-[150px] max-h-[300px] overflow-y-auto">
                {everything.filter(item => item.type === 'instruction').map((item, index) => (
                  <div key={index} className="text-xs font-mono">
                    {item.content}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-xs">Memory Parameters</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="memoryAddress">Memory Address</Label>
                  <Input
                    id="memoryAddress"
                    type="number"
                    value={memoryInput.address}
                    onChange={(e) => handleMemoryValueChange('address', e.target.value)}
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="memoryValue">Memory Value</Label>
                  <Input
                    id="memoryValue"
                    type="number"
                    value={memoryInput.value}
                    onChange={(e) => handleMemoryValueChange('value', e.target.value)}
                  />
                </div>
              </div>
              <Button 
                className="w-full mt-4 bg-black text-white hover:bg-gray-800" 
                onClick={handleAddMemoryValue}
              >
                Add Memory Value
              </Button>
              <div>
                <h3 className="text-sm font-semibold mb-2">Memory Values</h3>
                <div className="bg-gray-100 p-2 rounded-md space-y-1 min-h-[80px] max-h-[160px] overflow-y-auto">
                  {memoryValues.map((item, index) => (
                    <div key={index} className="text-xs font-mono">
                      Address: {item.address}, Value: {item.value}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cacheBlockSize">Cache Block Size</Label>
                  <Input
                    id="cacheBlockSize"
                    type="number"
                    value={config.cacheBlockSize}
                    onChange={(e) => handleConfigChange('cacheBlockSize', 'cacheBlockSize', e.target.value)}
                    min={16}
                    step={8}
                  />
                </div>
                <div>
                  <Label htmlFor="cacheSize">Cache Size</Label>
                  <Input
                    id="cacheSize"
                    type="number"
                    value={config.cacheSize}
                    onChange={(e) => handleConfigChange('cacheSize', 'cacheSize', e.target.value)}
                    min={64}
                    step={8}
                  />
                </div>
                <div>
                  <Label htmlFor="hitTime">Hit Time</Label>
                  <Input
                    id="hitTime"
                    type="number"
                    value={config.hitTime}
                    onChange={(e) => handleConfigChange('hitTime', 'hitTime', e.target.value)}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="missPenalty">Miss Penalty</Label>
                  <Input
                    id="missPenalty"
                    type="number"
                    value={config.missPenalty}
                    onChange={(e) => handleConfigChange('missPenalty', 'missPenalty', e.target.value)}
                    min={1}
                  />
                </div>
                {/* <div>
                  <Label htmlFor="memorySize">Memory Size (words)</Label>
                  <Input
                    id="memorySize"
                    type="number"
                    value={config.memorySize}
                    onChange={(e) => handleConfigChange('memorySize', 'memorySize', e.target.value)}
                    min={config.cacheSize + 1}
                  />
                </div> */}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Latencies</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(config.latencies).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <Input
                        id={key}
                        type="number"
                        value={value}
                        onChange={(e) => handleConfigChange('latencies', key, e.target.value)}
                        min={1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-xs">Station and Buffer Sizes</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(config.stations).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  <Input
                    id={key}
                    type="number"
                    value={value}
                    onChange={(e) => handleConfigChange('stations', key, e.target.value)}
                    min={1}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <div className="col-span-3 grid grid-cols-2 gap-4"> {/* Adjusted column span */}
      <Card className="w-full"> {/* Adjusted width */}
        <CardHeader>
          <CardTitle className="text-xs">Integer Registers</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-2 gap-4"> {/* Split into two columns */}
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>Reg</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registerValues.integer.slice(0, 16).map((value, index) => (
                  <TableRow key={`int-${index}`}>
                    <TableCell>R{index}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleRegisterValueChange('integer', index, e.target.value)}
                        className="w-20 h-6" // Adjust width and height
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>Reg</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registerValues.integer.slice(16).map((value, index) => (
                  <TableRow key={`int-${index + 16}`}>
                    <TableCell>R{index + 16}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleRegisterValueChange('integer', index + 16, e.target.value)}
                        className="w-20 h-6" // Adjust width and height
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full"> {/* Adjusted width */}
        <CardHeader>
          <CardTitle className="text-xs">Floating-Point Registers</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-2 gap-4"> {/* Split into two columns */}
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>Reg</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registerValues.float.slice(0, 16).map((value, index) => (
                  <TableRow key={`float-${index}`}>
                    <TableCell>F{index}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => handleRegisterValueChange('float', index, e.target.value)}
                        className="w-20 h-6" // Adjust width and height
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>Reg</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registerValues.float.slice(16).map((value, index) => (
                  <TableRow key={`float-${index + 16}`}>
                    <TableCell>F{index + 16}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => handleRegisterValueChange('float', index + 16, e.target.value)}
                        className="w-20 h-6" // Adjust width and height
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  </div>
  );
};

export default InstructionInput;

