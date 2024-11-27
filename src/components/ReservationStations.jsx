import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function ReservationStationTable({ title, size }) {
  const stations = Array.from({ length: size }, (_, index) => ({
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
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Busy</TableHead>
              <TableHead>Op</TableHead>
              <TableHead>Vj</TableHead>
              <TableHead>Vk</TableHead>
              <TableHead>Qj</TableHead>
              <TableHead>Qk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations.map((station) => (
              <TableRow key={station.id}>
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

