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

const Cache = ({ cacheArray }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Cache</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Block#</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cacheArray.map(block => (
              <React.Fragment key={block.blockNumber}>
                {block.addresses.map((addr, index) => (
                  <TableRow key={index}>
                    {index === 0 && (
                      <TableCell rowSpan={block.addresses.length} className="text-center">
                        {block.blockNumber}
                      </TableCell>
                    )}
                    <TableCell>{addr.address}</TableCell>
                    <TableCell>{addr.value}</TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Cache;
