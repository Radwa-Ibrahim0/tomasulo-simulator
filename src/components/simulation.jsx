import RegisterFile from './RegisterFile';
import ReservationStations from './ReservationStations';
import BufferTable from './StoreLoadBranchBuffer';
import InstructionStatusTable from './ExecutionStatus';

export default function SimulationPage({ everything }) {
  // Use the 'everything' prop as needed in your component
  console.log(everything);

  const addStation = everything.find(item => item.key === 'addStation')?.value || 0;
  const mulStation = everything.find(item => item.key === 'mulStation')?.value || 0;
  const loadBuffer = everything.find(item => item.key === 'loadBuffer')?.value || 0;
  const storeBuffer = everything.find(item => item.key === 'storeBuffer')?.value || 0;
  const branchBuffer = everything.find(item => item.key === 'branchBuffer')?.value || 0;

  const integerRegisters = everything.filter(item => item.registerType === 'integer').map(item => item.value);
  const floatRegisters = everything.filter(item => item.registerType === 'float').map(item => item.value);

  const instructions = everything.filter(item => item.type === 'instruction');

  const preprocessInstructions = (instructions) => {
    return instructions.map((instruction) => {
      let content = instruction.content;
      if (content.includes(':')) {
        content = content.split(':')[1].trim();
      }
      const parts = content.split(' ').map(part => part.replace(',', ''));
      return {
        iteration: '',
        instruction: parts[0] || '',
        dest: parts[1] || '',
        j: parts[2] || '',
        k: parts[3] || '',
        issue: '',
        executionComplete: '',
        writeResult: ''
      };
    });
  };

  const processedInstructions = preprocessInstructions(instructions);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">MIPS Simulation</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {processedInstructions && processedInstructions.length > 0 && (
          <InstructionStatusTable instructions={processedInstructions} />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <ReservationStations title="Addition Reservation Stations" size={addStation} />
            <ReservationStations title="Multiplication Reservation Stations" size={mulStation} />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <BufferTable title="Load Buffers" size={loadBuffer} showVQ={false} />
              <BufferTable title="Store Buffers" size={storeBuffer} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <RegisterFile title="Floating Point Registers" size={32} values={floatRegisters} />
              <RegisterFile title="Integer Registers" size={32} values={integerRegisters} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4">
        <div className="text-2xl font-mono">
          Clock: <span className="font-bold">0</span>
        </div>
      </div>
    </div>
  );
}

