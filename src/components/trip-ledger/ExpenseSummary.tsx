
"use client";

import type * as React from "react";
import { Landmark, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ExpenseSummaryProps {
  totalPaid: number;
  totalOutstanding: number;
}

export function ExpenseSummary({ totalPaid, totalOutstanding }: ExpenseSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0, // Changed to 0 for cleaner look, can be 2 if cents are needed
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="print-summary shadow-md">
      <CardHeader className="no-print pb-2">
        <CardTitle className="flex items-center text-xl md:text-2xl">
           <Landmark className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />
           Financial Overview
        </CardTitle>
        <CardDescription className="no-print">A quick look at your total payments and dues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 md:pt-2">
        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-green-600 dark:text-green-500" />
            <span className="text-muted-foreground">Total Amount Paid:</span>
          </div>
          <span className="font-semibold text-lg text-green-600 dark:text-green-500">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
          <div className="flex items-center">
            <TrendingDown className="mr-2 h-5 w-5 text-red-600 dark:text-red-500" />
            <span className="text-muted-foreground">Total Outstanding Balance:</span>
          </div>
          <span className="font-semibold text-lg text-red-600 dark:text-red-500">{formatCurrency(totalOutstanding)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
