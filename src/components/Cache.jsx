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

const Cache = ({ cacheSize, blockSize }) => {
  const numBlocks = Math.floor(cacheSize / blockSize);
  const rowsPerBlock = Math.floor(blockSize / 8);
  const cacheBlocks = Array.from({ length: numBlocks }, (_, i) => ({
    blockNumber: `B${i + 1}`,
    addresses: Array.from({ length: rowsPerBlock }, () => ({
      address: '',
      value: ''
    }))
  }));

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
            {cacheBlocks.map(block => (
              <React.Fragment key={block.blockNumber}>
                {block.addresses.map((addr, index) => (
                  <TableRow key={index}>
                    {index === 0 && (
                      <TableCell rowSpan={rowsPerBlock} className="text-center">
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
