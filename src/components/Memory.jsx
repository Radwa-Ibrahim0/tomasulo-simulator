import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const Memory = ({ memoryArray }) => {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium">Memory</CardTitle>
      </CardHeader>
      <CardContent className="py-1 custom-scrollbar" style={{ maxHeight: '250px', overflowY: 'auto' }}> {/* Added custom-scrollbar class */}
        <Table className="text-xs table-sm"> {/* Added table-sm class */}
          <TableHeader>
            <TableRow className="h-4">
              <TableHead className="w-12">Address</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memoryArray.map((mem, index) => (
              <TableRow key={index} className="h-4 p-1"> {/* Added p-1 class */}
                <TableCell>{mem.address}</TableCell>
                <TableCell>{mem.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Memory;
