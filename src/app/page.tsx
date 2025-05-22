"use client";

import type * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { FileSpreadsheet, HandCoins } from "lucide-react";

import type { Expense } from "@/types/expense";
import { ExpenseForm } from "@/components/trip-ledger/ExpenseForm";
import { FilterControls } from "@/components/trip-ledger/FilterControls";
import { ExpenseTable } from "@/components/trip-ledger/ExpenseTable";
import { ExpenseSummary } from "@/components/trip-ledger/ExpenseSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Sample initial data
const initialExpensesData: Expense[] = [
  { id: "1", vendorName: "Manali Travels", date: new Date("2024-07-15"), totalAmountOwed: 3000, amountPaid: 1000, outstandingBalance: 2000 },
  { id: "2", vendorName: "Shimla Tours", date: new Date("2024-07-20"), totalAmountOwed: 5000, amountPaid: 5000, outstandingBalance: 0 },
  { id: "3", vendorName: "Manali Travels", date: new Date("2024-07-22"), totalAmountOwed: 1500, amountPaid: 500, outstandingBalance: 1000 },
  { id: "4", vendorName: "Goa Getaways", date: new Date("2024-07-25"), totalAmountOwed: 8000, amountPaid: 2000, outstandingBalance: 6000 },
];


export default function TripLedgerPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load expenses from localStorage if available, otherwise use initial data
    const storedExpenses = localStorage.getItem("tripLedgerExpenses");
    if (storedExpenses) {
      try {
        const parsedExpenses = JSON.parse(storedExpenses).map((exp: any) => ({
          ...exp,
          date: new Date(exp.date), // Ensure date is a Date object
        }));
        setExpenses(parsedExpenses);
      } catch (error) {
        console.error("Failed to parse expenses from localStorage", error);
        setExpenses(initialExpensesData); // Fallback to initial data
      }
    } else {
      setExpenses(initialExpensesData); // Load initial data if nothing in localStorage
    }
  }, []);

  useEffect(() => {
    if (isClient) { // Only run on client after initial mount and expenses load
        localStorage.setItem("tripLedgerExpenses", JSON.stringify(expenses));
    }
  }, [expenses, isClient]);


  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((prevExpenses) => [...prevExpenses, newExpense].sort((a,b) => b.date.getTime() - a.date.getTime()));
  };

  const uniqueVendors = useMemo(() => {
    const vendorSet = new Set(expenses.map((exp) => exp.vendorName));
    return Array.from(vendorSet).sort();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (selectedVendor === "all") {
      return expenses;
    }
    return expenses.filter((exp) => exp.vendorName === selectedVendor);
  }, [expenses, selectedVendor]);

  const summary = useMemo(() => {
    return filteredExpenses.reduce(
      (acc, exp) => {
        acc.totalPaid += exp.amountPaid;
        acc.totalOutstanding += exp.outstandingBalance;
        return acc;
      },
      { totalPaid: 0, totalOutstanding: 0 }
    );
  }, [filteredExpenses]);

  const handlePrint = () => {
    if (isClient) {
      window.print();
    }
  };
  
  if (!isClient) {
    // Render a loading state or null during SSR to avoid hydration mismatches related to localStorage
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <FileSpreadsheet className="h-16 w-16 text-primary animate-pulse" />
        <p className="mt-4 text-lg text-muted-foreground">Loading Trip Ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 text-center no-print">
        <div className="inline-flex items-center">
           <FileSpreadsheet className="h-10 w-10 text-primary mr-3" />
           <h1 className="text-4xl font-bold tracking-tight">Trip Ledger</h1>
        </div>
        <p className="text-muted-foreground mt-2">Track your travel expenses with ease.</p>
      </header>

      <div className="max-w-5xl mx-auto space-y-8">
        <Card className="no-print">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <HandCoins className="mr-2 h-5 w-5 text-primary" />
              Add New Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm onAddExpense={handleAddExpense} />
          </CardContent>
        </Card>

        <FilterControls
          vendors={uniqueVendors}
          selectedVendor={selectedVendor}
          onVendorChange={setSelectedVendor}
          onPrint={handlePrint}
        />
        
        <div className="printable-area">
          <div className="print-header hidden print:block text-center mb-4">
            Trip Ledger Statement
            {selectedVendor !== "all" && ` for ${selectedVendor}`}
          </div>
          <ExpenseSummary
            totalPaid={summary.totalPaid}
            totalOutstanding={summary.totalOutstanding}
          />
          <div className="mt-8"> {/* Add margin for print layout */}
            <ExpenseTable expenses={filteredExpenses} />
          </div>
        </div>
      </div>
    </div>
  );
}
