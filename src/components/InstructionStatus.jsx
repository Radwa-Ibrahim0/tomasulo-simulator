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
      <CardHeader>
        <CardTitle className="text-sm font-medium">Instruction Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instruction</TableHead>
              <TableHead>Dest</TableHead>
              <TableHead>j</TableHead>
              <TableHead>k</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Execution Start</TableHead>
              <TableHead>Execution End</TableHead>

              <TableHead>Write Back</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructions.length > 0 ? (
              instructions.map((instruction, index) => (
                <TableRow key={index}>
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
              <TableRow>
                <TableCell colSpan="8" className="text-center">No instructions available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

