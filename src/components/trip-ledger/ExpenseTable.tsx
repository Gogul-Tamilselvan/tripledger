
"use client";

import type * as React from "react";
import { format } from "date-fns";
import { IndianRupee, ListChecks, Info } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Expense } from "@/types/expense";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";

interface ExpenseTableProps {
  expenses: Expense[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (expense: Expense) => {
    if (expense.outstandingBalance === 0) {
      if (expense.totalAmountOwed === 0) {
        // Case: No initial amount owed for this transaction, and balance is zero.
        return <Badge variant="outline" className="text-muted-foreground">No Due</Badge>;
      } else {
        // Case: Initial amount owed for this transaction was > 0, and outstanding balance is now zero.
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Paid</Badge>;
      }
    } else if (expense.outstandingBalance < 0) {
      // Case: Net credit for THIS transaction
      if (expense.totalAmountOwed === 0) {
        // This transaction was a payment/advance not against a new debt on this line, creating a credit specific to this line.
        // e.g. Total Owed = 0, Amount Paid = 1000 => Outstanding = -1000
        return <Badge variant="default" className="bg-sky-500 hover:bg-sky-600 text-white">Credit</Badge>;
      } else {
        // Total Owed on this line was > 0, and Amount Paid exceeded it.
        // e.g. Total Owed = 1000, Amount Paid = 1500 => Outstanding = -500
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">Overpaid</Badge>;
      }
    } else { // outstandingBalance > 0
      if (expense.amountPaid > 0) {
        // Case: Partially paid, positive outstanding balance remains for this transaction.
        return <Badge variant="secondary" className="bg-yellow-400 hover:bg-yellow-500 text-black">Partial</Badge>;
      } else {
        // Case: Unpaid (amountPaid is 0 or less), positive outstanding balance remains for this transaction.
        return <Badge variant="destructive">Unpaid</Badge>;
      }
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="no-print pb-4">
        <CardTitle className="flex items-center text-xl md:text-2xl">
          <ListChecks className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />
          Expense Records
        </CardTitle>
         <CardDescription className="no-print">Detailed list of all recorded expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <IndianRupee className="mx-auto h-16 w-16 mb-3 text-gray-400" />
            <p className="text-lg">No expenses recorded yet.</p>
            <p className="text-sm mt-1">Add an expense using the form above to see it here.</p>
          </div>
        ) : (
          <ScrollArea className="h-[450px] w-full print:h-auto print:overflow-visible">
            <TooltipProvider>
            <Table className="print-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Vendor Name</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right w-[130px]">Total Owed</TableHead>
                  <TableHead className="text-right w-[130px]">Amount Paid</TableHead>
                  <TableHead className="text-right w-[130px]">Outstanding</TableHead>
                  <TableHead className="text-center w-[100px] no-print">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{expense.vendorName}</TableCell>
                    <TableCell>{format(expense.date, "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      {expense.description ? (
                        expense.description.length > 40 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-default">
                                {expense.description.substring(0, 40)}...
                                <Info className="inline-block ml-1 h-3 w-3 text-muted-foreground" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start">
                              <p className="max-w-xs">{expense.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          expense.description
                        )
                      ) : (
                        <span className="text-muted-foreground italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right print:text-right">{formatCurrency(expense.totalAmountOwed)}</TableCell>
                    <TableCell className="text-right print:text-right text-green-600 dark:text-green-500">{formatCurrency(expense.amountPaid)}</TableCell>
                    <TableCell className={cn(
                        "text-right print:text-right font-semibold",
                        expense.outstandingBalance > 0 && "text-red-600 dark:text-red-500",
                        expense.outstandingBalance < 0 && "text-green-600 dark:text-green-500"
                        // If 0, it will use default text color
                      )}>
                      {formatCurrency(expense.outstandingBalance)}
                    </TableCell>
                    <TableCell className="text-center no-print">
                      {getStatusBadge(expense)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TooltipProvider>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

