"use client";

import type * as React from "react";
import { format } from "date-fns";
import { IndianRupee, ListChecks } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/types/expense";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  return (
    <Card>
      <CardHeader className="no-print">
        <CardTitle className="flex items-center text-xl">
          <ListChecks className="mr-2 h-5 w-5 text-primary" />
          Expense Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <IndianRupee className="mx-auto h-12 w-12 mb-2" />
            <p>No expenses recorded yet.</p>
            <p className="text-sm">Add an expense using the form above to see it here.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full print:h-auto print:overflow-visible">
            <Table className="print-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total Owed</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.vendorName}</TableCell>
                    <TableCell>{format(expense.date, "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.totalAmountOwed)}</TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-500">{formatCurrency(expense.amountPaid)}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600 dark:text-red-500">
                      {formatCurrency(expense.outstandingBalance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
