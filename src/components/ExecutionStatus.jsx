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
              <TableHead>Iteration #</TableHead>
              <TableHead>Instruction</TableHead>
              <TableHead>Dest</TableHead>
              <TableHead>j</TableHead>
              <TableHead>k</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Execution Complete</TableHead>
              <TableHead>Write Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructions.map((instruction, index) => (
              <TableRow key={index}>
                <TableCell>{instruction.iteration}</TableCell>
                <TableCell className="font-mono">{instruction.instruction}</TableCell>
                <TableCell>{instruction.dest}</TableCell>
                <TableCell>{instruction.j}</TableCell>
                <TableCell>{instruction.k}</TableCell>
                <TableCell>{instruction.issue}</TableCell>
                <TableCell>{instruction.executionComplete}</TableCell>
                <TableCell>{instruction.writeResult}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

