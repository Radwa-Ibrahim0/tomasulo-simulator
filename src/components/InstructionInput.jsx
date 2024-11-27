import React, { useState, useEffect } from 'react';
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
    cacheSize: 1024,
    latencies: {
      addD: 1, subD: 1, mulD: 1, divD: 1,
      addi: 1, subi: 1,
      loadWord: 1, loadDouble: 1, loadSingle: 1,
      storeWord: 1, storeDouble: 1, storeSingle: 1,
      beq: 1, bne: 1, bnez: 1
    },
    stations: {
      mulStation: 2, 
      addStation: 3, 
      loadBuffer: 3, storeBuffer: 3, branchBuffer: 2
    }
  });

  const [registerValues, setRegisterValues] = useState({
    integer: Array(32).fill(''),
    float: Array(32).fill(''),
  });

  const [labels, setLabels] = useState([]);

  const operations = [
    "ADD.D", "SUB.D", "MUL.D", "DIV.D",
    "ADDI", "SUBI",
    "LW", "LD", "L.S", "L.D",
    "SW", "SD", "S.S", "S.D",
    "BEQ", "BNE", "BNEZ"
  ].filter(op => !['BEQ', 'BNE', 'BNEZ'].includes(op) || labels.length > 0);

  const generateRegisters = (prefix, count) => {
    return Array.from({ length: count }, (_, i) => `${prefix}${i}`);
  };

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
          .map(line => ({
            type: 'instruction',
            content: line
          }));
        setEverything(prev => [...prev, ...instructions]);
      };
      reader.readAsText(file);
    }
  };

  const handleAddInstruction = () => {
    if (currentInstruction.operation) {
      let content = '';
      if (currentInstruction.label) {
        content += `${currentInstruction.label}: `;
        setLabels(prev => [...prev, currentInstruction.label]);
      }
      content += currentInstruction.operation;

      if (['BEQ', 'BNE', 'BNEZ'].includes(currentInstruction.operation)) {
        content += ` ${currentInstruction.registers[0]}, ${currentInstruction.registers[1] || ''}, ${currentInstruction.immediate}`;
      } else if (['ADDI', 'SUBI'].includes(currentInstruction.operation)) {
        content += ` ${currentInstruction.registers[0]}, ${currentInstruction.registers[1]}, ${currentInstruction.immediate}`;
      } else if (['LW', 'LD', 'SW', 'SD'].includes(currentInstruction.operation)) {
        content += ` ${currentInstruction.registers[0]}, ${currentInstruction.immediate}`;
      } else if (['L.S', 'L.D', 'S.S', 'S.D'].includes(currentInstruction.operation)) {
        content += ` ${currentInstruction.registers[0]}, ${currentInstruction.immediate}`;
      } else {
        content += ` ${currentInstruction.registers.filter(Boolean).join(', ')}`;
      }

      const instruction = {
        type: 'instruction',
        content: content.trim()
      };
      setEverything(prev => [...prev, instruction]);
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
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: newValue
      }
    }));
    setEverything(prev => prev.map(item => 
      item.key === key ? { ...item, value: newValue } : item
    ));
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
    setEverything([
      { type: 'config', key: 'cacheBlockSize', value: config.cacheBlockSize },
      { type: 'config', key: 'cacheSize', value: config.cacheSize },
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
    ]);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">MIPS Instruction Input</h1>

      <Tabs defaultValue="file-upload" className="w-full">
        <TabsList>
          <TabsTrigger value="file-upload">File Upload</TabsTrigger>
          <TabsTrigger value="instruction-builder">Instruction Builder</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="register-values">Register Values</TabsTrigger>
          <TabsTrigger value="current-instructions">Current Instructions</TabsTrigger>
        </TabsList>

        <TabsContent value="file-upload">
          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>Upload a text file with MIPS instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <Input type="file" accept=".txt" onChange={handleFileUpload} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instruction-builder">
          <Card>
            <CardHeader>
              <CardTitle>Instruction Builder</CardTitle>
              <CardDescription>Build instructions interactively</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Label (optional)</Label>
                  <Input
                    value={currentInstruction.label}
                    onChange={(e) => setCurrentInstruction(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Enter label"
                  />
                </div>
                <div>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation" />
                    </SelectTrigger>
                    <SelectContent>
                      {operations.map((op) => (
                        <SelectItem key={op} value={op}>{op}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {['BEQ', 'BNE', 'BNEZ'].includes(currentInstruction.operation) && labels.length > 0 ? (
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select R1" />
                        </SelectTrigger>
                        <SelectContent>
                          {integerRegisters.map((reg) => (
                            <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {currentInstruction.operation !== 'BNEZ' && (
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select R2" />
                          </SelectTrigger>
                          <SelectContent>
                            {integerRegisters.map((reg) => (
                              <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label>Label</Label>
                      <Select
                        value={currentInstruction.immediate}
                        onValueChange={(value) => setCurrentInstruction(prev => ({
                          ...prev,
                          immediate: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select label" />
                        </SelectTrigger>
                        <SelectContent>
                          {labels.map((label) => (
                            <SelectItem key={label} value={label}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : ['ADDI', 'SUBI'].includes(currentInstruction.operation) ? (
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select R1" />
                        </SelectTrigger>
                        <SelectContent>
                          {integerRegisters.map((reg) => (
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select R2" />
                        </SelectTrigger>
                        <SelectContent>
                          {integerRegisters.map((reg) => (
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
                ) : ['LW', 'LD', 'SW', 'SD'].includes(currentInstruction.operation) ? (
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select R1" />
                        </SelectTrigger>
                        <SelectContent>
                          {integerRegisters.map((reg) => (
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
                ) : ['L.S', 'L.D', 'S.S', 'S.D'].includes(currentInstruction.operation) ? (
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select F1" />
                        </SelectTrigger>
                        <SelectContent>
                          {floatingRegisters.map((reg) => (
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
                        <SelectTrigger>
                          <SelectValue placeholder={`Select F${i + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {floatingRegisters.map((reg) => (
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
                        <SelectTrigger>
                          <SelectValue placeholder={`Select R${i + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(currentInstruction.operation.includes('.D') ? floatingRegisters : integerRegisters)
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
                className="w-full mt-4" 
                onClick={handleAddInstruction}
              >
                Add Instruction
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
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
                      value={config.cacheBlockSize}
                      onChange={(e) => handleConfigChange('config', 'cacheBlockSize', e.target.value)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cacheSize">Cache Size</Label>
                    <Input
                      id="cacheSize"
                      type="number"
                      value={config.cacheSize}
                      onChange={(e) => handleConfigChange('config', 'cacheSize', e.target.value)}
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
                          value={value}
                          onChange={(e) => handleConfigChange('latencies', key, e.target.value)}
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
                          value={value}
                          onChange={(e) => handleConfigChange('stations', key, e.target.value)}
                          min="1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register-values">
          <Card>
            <CardHeader>
              <CardTitle>Register Values</CardTitle>
              <CardDescription>Set initial values for registers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Integer Registers</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Register</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registerValues.integer.map((value, index) => (
                        <TableRow key={`int-${index}`}>
                          <TableCell>R{index}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={value}
                              onChange={(e) => handleRegisterValueChange('integer', index, e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Floating-Point Registers</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Register</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registerValues.float.map((value, index) => (
                        <TableRow key={`float-${index}`}>
                          <TableCell>F{index}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={value}
                              onChange={(e) => handleRegisterValueChange('float', index, e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current-instructions">
          <Card>
            <CardHeader>
              <CardTitle>Current Instructions</CardTitle>
              <CardDescription>List of all added instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md space-y-1 min-h-[200px] max-h-[400px] overflow-y-auto">
                {everything.filter(item => item.type === 'instruction').map((item, index) => (
                  <div key={index} className="text-sm font-mono">
                    {item.content}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructionInput;

