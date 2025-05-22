
"use client";

import type * as React from "react";
import { Landmark, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

  const isCreditBalance = totalOutstanding < 0;
  const isZeroBalance = totalOutstanding === 0;

  let outstandingIcon = <TrendingDown className="mr-2 h-5 w-5 text-red-600 dark:text-red-500" />;
  let outstandingLabel = "Total Outstanding Balance:";
  let outstandingAmount = formatCurrency(totalOutstanding);
  let outstandingColorClass = "text-red-600 dark:text-red-500";

  if (isCreditBalance) {
    outstandingIcon = <TrendingUp className="mr-2 h-5 w-5 text-green-600 dark:text-green-500" />;
    outstandingLabel = "Total Credit Balance:";
    outstandingAmount = formatCurrency(Math.abs(totalOutstanding));
    outstandingColorClass = "text-green-600 dark:text-green-500";
  } else if (isZeroBalance) {
    outstandingIcon = <CheckCircle2 className="mr-2 h-5 w-5 text-muted-foreground" />; // Neutral color
    outstandingColorClass = "text-muted-foreground";
  }


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
            {outstandingIcon}
            <span className="text-muted-foreground">{outstandingLabel}</span>
          </div>
          <span className={cn("font-semibold text-lg", outstandingColorClass)}>{outstandingAmount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
