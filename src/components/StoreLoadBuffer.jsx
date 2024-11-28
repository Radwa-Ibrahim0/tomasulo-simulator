import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function BufferTable({ title, size, rows = [], showVQ = true }) {
  const buffers = rows.length > 0 ? rows : Array.from({ length: size }, (_, index) => ({
    id: `${title[0]}${index + 1}`,
    busy: 0,
    address: '',
    v: showVQ ? '' : undefined,
    q: showVQ ? '' : undefined
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
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Busy</TableHead>
              <TableHead>Address</TableHead>
              {showVQ && <TableHead>V</TableHead>}
              {showVQ && <TableHead>Q</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {buffers.map((buffer, index) => (
              <TableRow key={buffer.id || index}>
                <TableCell>{buffer.id}</TableCell>
                <TableCell>{buffer.busy}</TableCell>
                <TableCell>{buffer.address}</TableCell>
                {showVQ && <TableCell>{buffer.v}</TableCell>}
                {showVQ && <TableCell>{buffer.q}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

