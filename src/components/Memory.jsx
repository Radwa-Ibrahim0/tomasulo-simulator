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
      <CardHeader>
        <CardTitle className="text-sm font-medium">Memory</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Address</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memoryArray.map((mem, index) => (
              <TableRow key={index}>
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
