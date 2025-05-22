
"use client";

import type * as React from "react";
import { Filter, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FilterControlsProps {
  vendors: string[];
  selectedVendor: string;
  onVendorChange: (vendor: string) => void;
  onPrint: () => void;
}

export function FilterControls({
  vendors,
  selectedVendor,
  onVendorChange,
  onPrint,
}: FilterControlsProps) {
  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Filter className="mr-2 h-5 w-5 text-primary" />
          Filters & Actions
        </CardTitle>
      </CardHeader>
      <CardContent> {/* Removed flex layout, relying on default CardContent padding and flow */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-grow md:max-w-xs">
            <Select value={selectedVendor} onValueChange={onVendorChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by vendor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onPrint} variant="outline" className="w-full md:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print Statement
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center md:text-right">
          Tip: Use your browser's "Save as PDF" option in the print dialog to export.
        </p>
      </CardContent>
    </Card>
  );
}
