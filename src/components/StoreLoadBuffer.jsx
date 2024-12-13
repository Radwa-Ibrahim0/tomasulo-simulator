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
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-1 custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}> {/* Added custom-scrollbar class */}
        <Table className="text-xs table-sm"> {/* Added table-sm class */}
          <TableHeader>
            <TableRow className="h-4">
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Busy</TableHead>
              <TableHead>Addr</TableHead>
              {showVQ && <TableHead>V</TableHead>}
              {showVQ && <TableHead>Q</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {buffers.map((buffer, index) => (
              <TableRow key={buffer.id || index} className="h-4 p-1"> {/* Added p-1 class */}
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

