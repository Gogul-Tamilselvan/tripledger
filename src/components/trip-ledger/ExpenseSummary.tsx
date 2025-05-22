"use client";

import type * as React from "react";
import { Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseSummaryProps {
  totalPaid: number;
  totalOutstanding: number;
}

export function ExpenseSummary({ totalPaid, totalOutstanding }: ExpenseSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="print-summary">
      <CardHeader className="no-print">
        <CardTitle className="flex items-center text-xl">
           <Landmark className="mr-2 h-5 w-5 text-primary" />
           Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Amount Paid:</span>
          <span className="font-semibold text-lg text-green-600 dark:text-green-500">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Outstanding Balance:</span>
          <span className="font-semibold text-lg text-red-600 dark:text-red-500">{formatCurrency(totalOutstanding)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
