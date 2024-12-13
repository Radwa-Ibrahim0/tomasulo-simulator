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
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium">Cache</CardTitle>
      </CardHeader>
      <CardContent className="py-1 custom-scrollbar" style={{ maxHeight: '250px', overflowY: 'auto' }}> {/* Added custom-scrollbar class */}
        <Table className="text-xs table-sm"> {/* Added table-sm class */}
          <TableHeader>
            <TableRow className="h-4">
              <TableHead className="w-12">B#</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cacheArray.map(block => (
              <React.Fragment key={block.blockNumber}>
                {block.addresses.map((addr, index) => (
                  <TableRow key={index} className="h-4 p-1"> {/* Added p-1 class */}
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
