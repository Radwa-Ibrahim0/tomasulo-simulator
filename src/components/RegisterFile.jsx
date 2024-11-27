import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function RegisterFileTable({ title, size, values }) {
  const registers = Array.from({ length: size }, (_, index) => ({
    id: `${title[0]}${index}`,
    qi: values[index] || 0,
  }));

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
              <TableRow key={register.id}>
                <TableCell>{register.id}</TableCell>
                <TableCell>{register.qi}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

