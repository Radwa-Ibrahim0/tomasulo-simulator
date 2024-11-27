import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "./ui/table"
  import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
  
  export default function BufferTable({ title, size, showVQ = true }) {
    const buffers = Array.from({ length: size }, (_, index) => ({
      id: `${title[0]}${index + 1}`,
      busy: 0,
      address: "",
      v: showVQ ? "" : undefined,
      q: showVQ ? "" : undefined
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
                <TableHead className="w-16"></TableHead>
                <TableHead>Busy</TableHead>
                <TableHead>Address</TableHead>
                {showVQ && (
                  <>
                    <TableHead>V</TableHead>
                    <TableHead>Q</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {buffers.map((buffer) => (
                <TableRow key={buffer.id}>
                  <TableCell>{buffer.id}</TableCell>
                  <TableCell>{buffer.busy}</TableCell>
                  <TableCell>{buffer.address}</TableCell>
                  {showVQ && (
                    <>
                      <TableCell>{buffer.v}</TableCell>
                      <TableCell>{buffer.q}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }
  
  