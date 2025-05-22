
"use client";

import type * as React from "react";
import { Filter, Printer, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterControlsProps {
  vendors: string[]; // Expecting array of vendor names
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

  const handleResetFilter = () => {
    onVendorChange("all");
  };

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between p-1 no-print">
        <div className="flex items-center space-x-2 flex-grow md:max-w-sm">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedVendor} onValueChange={onVendorChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by vendor..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendorName) => (
                <SelectItem key={vendorName} value={vendorName}>
                    {vendorName}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
             {selectedVendor !== "all" && (
                <Button onClick={handleResetFilter} variant="ghost" size="icon" aria-label="Reset filter">
                    <RotateCcw className="h-4 w-4" />
                </Button>
            )}
        </div>
        
        <div className="flex flex-col items-center md:items-end space-y-2 md:space-y-0 md:space-x-2 md:flex-row">
            <Button onClick={onPrint} variant="outline" className="w-full md:w-auto">
                <Printer className="mr-2 h-4 w-4" /> Print Statement
            </Button>
            <p className="text-xs text-muted-foreground text-center md:text-right w-full md:w-auto">
                Tip: Use "Save as PDF" in print dialog.
            </p>
        </div>
    </div>
  );
}
