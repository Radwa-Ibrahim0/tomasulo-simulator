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
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-1">
        <Table className="text-xs table-sm"> {/* Added table-sm class */}
          <TableHeader>
            <TableRow className="h-4">
              <TableHead>Reg</TableHead>
              <TableHead>Qi</TableHead>
              <TableHead className="border-l">Reg</TableHead> {/* Added border-l class */}
              <TableHead>Qi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registers.map((register, index) => (
              index % 2 === 0 && (
                <>
                  <TableRow key={register.index} className="h-4 p-1">
                    <TableCell>{title.includes('Integer') ? `R${register.index}` : `F${register.index}`}</TableCell>
                    <TableCell>{register.value}</TableCell>
                    {registers[index + 1] && (
                      <>
                        <TableCell className="border-l">{title.includes('Integer') ? `R${registers[index + 1].index}` : `F${registers[index + 1].index}`}</TableCell> {/* Added border-l class */}
                        <TableCell>{registers[index + 1].value}</TableCell>
                      </>
                    )}
                  </TableRow>
                </>
              )
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

