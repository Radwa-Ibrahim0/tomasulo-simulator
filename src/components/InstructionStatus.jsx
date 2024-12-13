import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function InstructionStatusTable({ instructions }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium">Instruction Status</CardTitle>
      </CardHeader>
      <CardContent className="py-1 custom-scrollbar" style={{ maxHeight: '250px', overflowY: 'auto' }}> {/* Added custom-scrollbar class */}
        <Table className="text-xs table-sm"> {/* Added table-sm class */}
          <TableHeader>
            <TableRow className="h-4">
              <TableHead>Instr</TableHead>
              <TableHead>Dest</TableHead>
              <TableHead>j</TableHead>
              <TableHead>k</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Exec Start</TableHead>
              <TableHead>Exec End</TableHead>
              <TableHead>Write Back</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructions.length > 0 ? (
              instructions.map((instruction, index) => (
                <TableRow key={index} className="h-4 p-1"> {/* Added p-1 class */}
                  <TableCell className="font-mono">{instruction.instruction}</TableCell>
                  <TableCell>{instruction.dest}</TableCell>
                  <TableCell>{instruction.j}</TableCell>
                  <TableCell>{instruction.k}</TableCell>
                  <TableCell>{instruction.issue}</TableCell>
                  <TableCell>{instruction.executionStart}</TableCell>
                  <TableCell>{instruction.executionEnd}</TableCell>
                  <TableCell>{instruction.writeResult}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="h-4 p-1"> {/* Added p-1 class */}
                <TableCell colSpan="8" className="text-center">No instructions available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

