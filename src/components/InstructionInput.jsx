import React, { useState } from 'react';
import { Button } from "./ui/button.jsx"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

const InstructionInput = () => {
  const [instructions, setInstructions] = useState([]);
  const [loops, setLoops] = useState([]);
  const [config, setConfig] = useState({
    cacheBlockSize: 64,
    cacheSize: 1024,
    latencies: {
      addD: 1,
      subD: 1,
      mulD: 1,
      divD: 1,
      addi: 1,
      subi: 1,
      loadWord: 1,
      loadDouble: 1,
      loadSingle: 1,
      storeWord: 1,
      storeDouble: 1,
      storeSingle: 1,
      beq: 1,
      bne: 1,
      bnez: 1
    },
    stations: {
      mulIntStation: 2,
      mulFloatStation: 2,
      addIntStation: 3,
      addFloatStation: 3,
      loadBuffer: 3,
      storeBuffer: 3,
      branchBuffer: 2
    }
  });
  
  const [currentInstruction, setCurrentInstruction] = useState({
    operation: '',
    registers: ['', '', ''],
    immediate: '',
    address: '',
    loopName: '',
  });

  const [currentLoop, setCurrentLoop] = useState('');
  const [selectedIntRegister, setSelectedIntRegister] = useState('');
  const [selectedFloatRegister, setSelectedFloatRegister] = useState('');
  const [integerValue, setIntegerValue] = useState('');
  const [floatValue, setFloatValue] = useState('');
  const [registerValues, setRegisterValues] = useState({
    integer: Array(32).fill(''),
    float: Array(32).fill(''),
  });

  const baseOperations = [
    "ADD.D", "SUB.D", "MUL.D", "DIV.D",
    "ADDI", "SUBI",
    "LW", "LD", "L.S", "L.D",
    "SW", "SD", "S.S", "S.D"
  ];

  const branchOperations = ["BEQ", "BNE", "BNEZ"];
  const operations = loops.length > 0 ? [...baseOperations, ...branchOperations] : baseOperations;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const parsedInstructions = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            if (line.endsWith(':')) {
              return { operation: 'LOOP_LABEL', args: [line.slice(0, -1)] };
            }
            const [operation, ...args] = line.split(/[,\s]+/);
            return { operation, args };
          });
        setInstructions(parsedInstructions);
      };
      reader.readAsText(file);
    }
  };

  const handleAddInstruction = () => {
    const { operation, registers, immediate, address, loopName } = currentInstruction;
    let isValid = false;
    let args = [];

    if (['ADDI', 'SUBI'].includes(operation)) {
      isValid = registers[0] && registers[1] && immediate !== '';
      args = [registers[0], registers[1], immediate];
    } else if (['LW', 'LD', 'SW', 'SD'].includes(operation)) {
      isValid = registers[0] && address !== '';
      args = [registers[0], address];
    } else if (['L.S', 'L.D', 'S.S', 'S.D'].includes(operation)) {
      isValid = registers[0] && address !== '';
      args = [registers[0], address];
    } else if (['ADD.D', 'SUB.D', 'MUL.D', 'DIV.D'].includes(operation)) {
      isValid = registers[0] && registers[1] && registers[2];
      args = [registers[0], registers[1], registers[2]];
    } else if (['BEQ', 'BNE', 'BNEZ'].includes(operation)) {
      isValid = registers[0] && (operation === 'BNEZ' ? true : registers[1]) && loopName;
      args = operation === 'BNEZ' ? [registers[0], loopName.toUpperCase()] : [registers[0], registers[1], loopName.toUpperCase()];
    }

    if (isValid) {
      setInstructions([...instructions, { operation, args }]);
      setCurrentInstruction({
        operation: '',
        registers: ['', '', ''],
        immediate: '',
        address: '',
        loopName: '',
      });
    } else {
      alert('Please fill in all required fields for the selected operation.');
    }
  };

  const handleAddLoop = () => {
    if (currentLoop && !loops.includes(currentLoop.toUpperCase())) {
      const newLoop = currentLoop.toUpperCase();
      setLoops([...loops, newLoop]);
      setInstructions([...instructions, { operation: 'LOOP_LABEL', args: [newLoop] }]);
      setCurrentLoop('');
    } else {
      alert('Please enter a unique loop name.');
    }
  };

  const handleAddRegisterValue = (type) => {
    if (type === 'integer' && selectedIntRegister && integerValue !== '') {
      const index = parseInt(selectedIntRegister.substring(1));
      const newValues = [...registerValues.integer];
      newValues[index] = parseInt(integerValue);
      setRegisterValues({ ...registerValues, integer: newValues });
      setSelectedIntRegister('');
      setIntegerValue('');
    } else if (type === 'float' && selectedFloatRegister && floatValue !== '') {
      const index = parseInt(selectedFloatRegister.substring(1));
      const newValues = [...registerValues.float];
      newValues[index] = parseFloat(floatValue);
      setRegisterValues({ ...registerValues, float: newValues });
      setSelectedFloatRegister('');
      setFloatValue('');
    }
  };

  const generateRegisters = (prefix, count) => {
    return Array.from({ length: count }, (_, i) => `${prefix}${i}`);
  };

  const integerRegisters = generateRegisters("R", 32);
  const floatingRegisters = generateRegisters("F", 32);

  const handleConfigChange = (e, category = null) => {
    const { name, value } = e.target;
    const numValue = Math.max(parseInt(value), 1);

    if (category) {
      setConfig(prevConfig => ({
        ...prevConfig,
        [category]: {
          ...prevConfig[category],
          [name]: numValue
        }
      }));
    } else if (name in config.latencies) {
      setConfig(prevConfig => ({
        ...prevConfig,
        latencies: {
          ...prevConfig.latencies,
          [name]: numValue
        }
      }));
    } else {
      setConfig(prevConfig => ({
        ...prevConfig,
        [name]: numValue
      }));
    }
  };

  const renderInstructionInputs = () => {
    const { operation } = currentInstruction;
    
    if (['ADDI', 'SUBI'].includes(operation)) {
      return (
        <>
          <Select
            value={currentInstruction.registers[0]}
            onValueChange={(value) => setCurrentInstruction({ ...currentInstruction, registers: [value, currentInstruction.registers[1], ''] })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select R1" />
            </SelectTrigger>
            <SelectContent>
              {integerRegisters.map((reg) => (
                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currentInstruction.registers[1]}
            onValueChange={(value) => setCurrentInstruction({ ...currentInstruction, registers: [currentInstruction.registers[0], value, ''] })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select R2" />
            </SelectTrigger>
            <SelectContent>
              {integerRegisters.map((reg) => (
                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={currentInstruction.immediate}
            onChange={(e) => setCurrentInstruction({ ...currentInstruction, immediate: e.target.value })}
            placeholder="Immediate value"
          />
        </>
      );
    } else if (['LW', 'LD', 'SW', 'SD'].includes(operation)) {
      return (
        <>
          <Select
            value={currentInstruction.registers[0]}
            onValueChange={(value) => setCurrentInstruction({ ...currentInstruction, registers: [value, '', ''] })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select R1" />
            </SelectTrigger>
            <SelectContent>
              {integerRegisters.map((reg) => (
                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={currentInstruction.address}
            onChange={(e) => setCurrentInstruction({ ...currentInstruction, address: e.target.value })}
            placeholder="Address"
          />
        </>
      );
    } else if (['L.S', 'L.D', 'S.S', 'S.D'].includes(operation)) {
      return (
        <>
          <Select
            value={currentInstruction.registers[0]}
            onValueChange={(value) => setCurrentInstruction({ ...currentInstruction, registers: [value, '', ''] })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select F1" />
            </SelectTrigger>
            <SelectContent>
              {floatingRegisters.map((reg) => (
                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={currentInstruction.address}
            onChange={(e) => setCurrentInstruction({ ...currentInstruction, address: e.target.value })}
            placeholder="Address"
          />
        </>
      );
    } else if (['ADD.D', 'SUB.D', 'MUL.D', 'DIV.D'].includes(operation)) {
      return (
        <>
          {[0, 1, 2].map((i) => (
            <Select
              key={i}
              value={currentInstruction.registers[i]}
              onValueChange={(value) => {
                const newRegisters = [...currentInstruction.registers];
                newRegisters[i] = value;
                setCurrentInstruction({ ...currentInstruction, registers: newRegisters });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={`Select F${i + 1}`} />
              </SelectTrigger>
              <SelectContent>
                {floatingRegisters.map((reg) => (
                  <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </>
      );
    } else if (['BEQ', 'BNE', 'BNEZ'].includes(operation)) {
      return (
        <>
          <Select
            value={currentInstruction.registers[0]}
            onValueChange={(value) => setCurrentInstruction({ ...currentInstruction, registers: [value, currentInstruction.registers[1], ''] })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select R1" />
            </SelectTrigger>
            <SelectContent>
              {integerRegisters.map((reg) => (
                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {operation !== 'BNEZ' && (
            <Select
              value={currentInstruction.registers[1]}
              onValueChange={(value) => setCurrentInstruction({ ...currentInstruction, registers: [currentInstruction.registers[0], value, ''] })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select R2" />
              </SelectTrigger>
              <SelectContent>
                {integerRegisters.map((reg) => (
                  <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={currentInstruction.loopName}
            onValueChange={(value) => setCurrentInstruction({ ...currentInstruction, loopName: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Loop" />
            </SelectTrigger>
            <SelectContent>
              {loops.map((loop) => (
                <SelectItem key={loop} value={loop}>{loop}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      );
    }
    
    return null;
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">MIPS Instruction Input</h1>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>Upload a text file with MIPS instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <Input type="file" accept=".txt" onChange={handleFileUpload} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Loop Management</CardTitle>
          <CardDescription>Add and manage loops for your instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={currentInstruction.operation}
              onValueChange={(value) => {
                setCurrentInstruction({
                  ...currentInstruction,
                  operation: value,
                  registers: ['', '', ''],
                  immediate: '',
                  address: '',
                  loopName: '',
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                {operations.map((op) => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {renderInstructionInputs()}
            </div>
            <Button onClick={handleAddInstruction}>Add Instruction</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Set cache and latency parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cacheBlockSize">Cache Block Size</Label>
                <Input
                  id="cacheBlockSize"
                  type="number"
                  name="cacheBlockSize"
                  value={config.cacheBlockSize}
                  onChange={handleConfigChange}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="cacheSize">Cache Size</Label>
                <Input
                  id="cacheSize"
                  type="number"
                  name="cacheSize"
                  value={config.cacheSize}
                  onChange={handleConfigChange}
                  min="1"
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Latencies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(config.latencies).map(([key, value]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <Input
                      id={key}
                      type="number"
                      name={key}
                      value={value}
                      onChange={handleConfigChange}
                      min="1"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Station and Buffer Sizes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(config.stations).map(([key, value]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <Input
                      id={key}
                      type="number"
                      name={key}
                      value={value}
                      onChange={(e) => handleConfigChange(e, 'stations')}
                      min="1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Initial Register Values</CardTitle>
          <CardDescription>Set initial values for registers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Integer Registers</h3>
              <div className="flex items-end space-x-2">
                <div>
                  <Label htmlFor="intRegister">Register</Label>
                  <Select
                    value={selectedIntRegister}
                    onValueChange={setSelectedIntRegister}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Register" />
                    </SelectTrigger>
                    <SelectContent>
                      {integerRegisters.map((reg) => (
                        <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="intValue">Value</Label>
                  <Input
                    id="intValue"
                    type="number"
                    value={integerValue}
                    onChange={(e) => setIntegerValue(e.target.value)}
                    placeholder="Enter integer value"
                  />
                </div>
                <Button onClick={() => handleAddRegisterValue('integer')}>Set Value</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Floating-Point Registers</h3>
              <div className="flex items-end space-x-2">
                <div>
                  <Label htmlFor="floatRegister">Register</Label>
                  <Select
                    value={selectedFloatRegister}
                    onValueChange={setSelectedFloatRegister}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Register" />
                    </SelectTrigger>
                    <SelectContent>
                      {floatingRegisters.map((reg) => (
                        <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="floatValue">Value</Label>
                  <Input
                    id="floatValue"
                    type="number"
                    step="0.01"
                    value={floatValue}
                    onChange={(e) => setFloatValue(e.target.value)}
                    placeholder="Enter float value"
                  />
                </div>
                <Button onClick={() => handleAddRegisterValue('float')}>Set Value</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Current Integer Register Values:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Register</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registerValues.integer.map((value, index) => 
                      value !== '' && (
                        <TableRow key={`int-${index}`}>
                          <TableCell>R{index}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Current Float Register Values:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Register</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registerValues.float.map((value, index) => 
                      value !== '' && (
                        <TableRow key={`float-${index}`}>
                          <TableCell>F{index}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Instructions</CardTitle>
          <CardDescription>List of all added instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md">
            {instructions.map((inst, index) => (
              <div 
                key={index} 
                className={`${
                  inst.operation === 'LOOP_LABEL' ? 'text-green-600 font-semibold' : 'text-blue-600 ml-4'
                } mb-1`}
              >
                {inst.operation === 'LOOP_LABEL' ? (
                  `${inst.args[0]}:`
                ) : (
                  `${inst.operation} ${inst.args.join(', ')}`
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
          <CardDescription>Final configuration and instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="font-mono"
            readOnly
            value={`Cache Block Size: ${config.cacheBlockSize}
Cache Size: ${config.cacheSize}

Latencies:
${Object.entries(config.latencies).map(([key, value]) => `${key}: ${value}`).join('\n')}

Station and Buffer Sizes:
${Object.entries(config.stations).map(([key, value]) => `${key}: ${value}`).join('\n')}

Register Values:
Integer Registers:
${registerValues.integer.map((value, index) => value !== '' ? `R${index}: ${value}` : '').filter(Boolean).join('\n')}

Float Registers:
${registerValues.float.map((value, index) => value !== '' ? `F${index}: ${value}` : '').filter(Boolean).join('\n')}

Instructions:
${instructions.map(inst => 
  inst.operation === 'LOOP_LABEL' 
    ? `${inst.args[0]}:` 
    : `${inst.operation} ${inst.args.join(', ')}`).join('\n')}`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructionInput;

