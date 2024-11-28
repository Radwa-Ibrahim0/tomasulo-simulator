import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function RegisterFileTable({ title, registers }) {
  // console.log(registers);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reg</TableHead>
              <TableHead>Qi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registers.map((register) => (
              <TableRow key={register.index}>
                <TableCell>{title.includes('Integer') ? `R${register.index}` : `F${register.index}`}</TableCell>
                <TableCell>{register.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

