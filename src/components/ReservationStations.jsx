import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function ReservationStationTable({ title, size, rows = [] }) {
  const stations = rows.length > 0 ? rows : Array.from({ length: size }, (_, index) => ({
    id: `${title[0]}${index + 1}`,
    time: 0,
    busy: 0,
    op: "",
    vj: "",
    vk: "",
    qj: "",
    qk: "",
    a: ""
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
              <TableHead>Op</TableHead>
              <TableHead>Vj</TableHead>
              <TableHead>Vk</TableHead>
              <TableHead>Qj</TableHead>
              <TableHead>Qk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations.map((station, index) => (
              <TableRow key={station.id || index} className="h-4 p-1"> {/* Added p-1 class */}
                <TableCell>{station.id}</TableCell>
                <TableCell>{station.busy}</TableCell>
                <TableCell>{station.op}</TableCell>
                <TableCell>{station.vj}</TableCell>
                <TableCell>{station.vk}</TableCell>
                <TableCell>{station.qj}</TableCell>
                <TableCell>{station.qk}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

