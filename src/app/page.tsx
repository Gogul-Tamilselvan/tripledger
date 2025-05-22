
"use client";

import type * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Briefcase, Users, HandCoins, Settings, Trash2, XIcon, AlertTriangle, LogOut, UserCircle } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation"; // For redirecting

import type { Expense } from "@/types/expense";
import type { Vendor } from "@/types/vendor";

import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { ExpenseForm } from "@/components/trip-ledger/ExpenseForm";
import { VendorForm } from "@/components/trip-ledger/VendorForm";
import { FilterControls } from "@/components/trip-ledger/FilterControls";
import { ExpenseTable } from "@/components/trip-ledger/ExpenseTable";
import { ExpenseSummary } from "@/components/trip-ledger/ExpenseSummary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


// Sample initial data (will be overridden by localStorage or start empty if localStorage is empty)
const initialExpensesData: Expense[] = [
  // { id: "1", vendorName: "Manali Travels", date: new Date("2024-07-15"), description: "Bus tickets for team", totalAmountOwed: 3000, amountPaid: 1000, outstandingBalance: 2000 },
  // { id: "2", vendorName: "Shimla Tours", date: new Date("2024-07-20"), description: "Hotel booking - 2 nights", totalAmountOwed: 5000, amountPaid: 5000, outstandingBalance: 0 },
];

const initialVendorsData: Vendor[] = [
  // { id: "v1", name: "Manali Travels" },
  // { id: "v2", name: "Shimla Tours" },
];


export default function TripLedgerPage() {
  const { user, loading, logout } = useAuth(); // Get auth state
  const router = useRouter(); // For redirecting

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>("all");
  const [isClient, setIsClient] = useState(false);
  const [printDate, setPrintDate] = useState<string>("");
  const { toast } = useToast();

  // Auth check and redirect effect
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load data from localStorage once authenticated and client-side
  useEffect(() => {
    if (user && typeof window !== 'undefined') { // Ensure user is logged in and on client
      setIsClient(true); // Set isClient only after auth check
      const storedExpenses = localStorage.getItem(`tripLedgerExpenses_${user.uid}`);
      if (storedExpenses) {
        try {
          const parsedExpenses = JSON.parse(storedExpenses).map((exp: any) => ({
            ...exp,
            date: new Date(exp.date),
          }));
          setExpenses(parsedExpenses);
        } catch (error) {
          console.error("Failed to parse expenses from localStorage", error);
          setExpenses(initialExpensesData); // Fallback to initial if parsing fails
        }
      } else {
        setExpenses(initialExpensesData); // Start with initial if nothing in localStorage
      }

      const storedVendors = localStorage.getItem(`tripLedgerVendors_${user.uid}`);
      if (storedVendors) {
        try {
          setVendors(JSON.parse(storedVendors));
        } catch (error) {
          console.error("Failed to parse vendors from localStorage", error);
          setVendors(initialVendorsData);
        }
      } else {
        setVendors(initialVendorsData);
      }
    }
  }, [user, loading]); // Depend on user and loading

  // Save expenses to localStorage
  useEffect(() => {
    if (isClient && user) {
        localStorage.setItem(`tripLedgerExpenses_${user.uid}`, JSON.stringify(expenses));
    }
  }, [expenses, isClient, user]);

  // Save vendors to localStorage
  useEffect(() => {
    if (isClient && user) {
        localStorage.setItem(`tripLedgerVendors_${user.uid}`, JSON.stringify(vendors));
    }
  }, [vendors, isClient, user]);


  const handleAddExpense = (newExpense: Omit<Expense, 'id' | 'outstandingBalance'>) => {
    const fullExpense: Expense = {
        ...newExpense,
        id: crypto.randomUUID(),
        outstandingBalance: newExpense.totalAmountOwed - newExpense.amountPaid,
    };
    setExpenses((prevExpenses) => [...prevExpenses, fullExpense].sort((a,b) => b.date.getTime() - a.date.getTime()));
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prevExpenses) => prevExpenses.filter(exp => exp.id !== expenseId));
    toast({
      title: "Expense Deleted",
      description: "The expense record has been removed.",
      variant: "default",
    });
  };

  const handleAddVendor = (newVendor: Omit<Vendor, 'id'>) => {
    const existingVendor = vendors.find(v => v.name.toLowerCase() === newVendor.name.toLowerCase());
    if (existingVendor) {
        toast({
            title: "Vendor Exists",
            description: `Vendor "${newVendor.name}" already exists.`,
            variant: "destructive",
        });
        return;
    }
    const fullVendor: Vendor = { ...newVendor, id: crypto.randomUUID() };
    setVendors((prevVendors) => [...prevVendors, fullVendor].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleDeleteVendor = (vendorId: string) => {
    const vendorToDelete = vendors.find(v => v.id === vendorId);
    if (!vendorToDelete) return;

    const isVendorUsed = expenses.some(exp => exp.vendorName === vendorToDelete.name);
    if (isVendorUsed) {
      toast({
        title: "Deletion Prevented",
        description: `Vendor "${vendorToDelete.name}" cannot be deleted as it is associated with existing expenses.`,
        variant: "destructive",
      });
      return;
    }

    setVendors((prevVendors) => prevVendors.filter(v => v.id !== vendorId));
    toast({
      title: "Vendor Deleted",
      description: `Vendor "${vendorToDelete.name}" has been removed.`,
      variant: "default",
    });
  };
  
  const sortedUniqueVendorNames = useMemo(() => {
    return vendors.map(v => v.name).sort();
  }, [vendors]);

  const filteredExpenses = useMemo(() => {
    if (selectedVendorFilter === "all") {
      return expenses;
    }
    return expenses.filter((exp) => exp.vendorName === selectedVendorFilter);
  }, [expenses, selectedVendorFilter]);

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
    if (isClient) { // isClient check already ensures user is present
      setPrintDate(format(new Date(), "PPPp"));
      setTimeout(() => window.print(), 100);
    }
  };
  
  // If loading or no user, show loading screen (or user will be redirected)
  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
        <Briefcase className="h-16 w-16 text-primary animate-pulse" />
        <p className="mt-4 text-lg text-muted-foreground">Loading ProLedger...</p>
      </div>
    );
  }

  // Main content once authenticated and data loaded
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 md:p-8">
      <header className="mb-10 text-center no-print">
        <div className="flex justify-between items-center">
            <div></div> {/* Spacer */}
            <div className="inline-flex items-center bg-card shadow-md rounded-lg p-3">
              <Briefcase className="h-10 w-10 text-primary mr-3" />
              <h1 className="text-4xl font-bold tracking-tight text-foreground">ProLedger</h1>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />}
                            <AvatarFallback>
                                {user.displayName ? user.displayName.substring(0,1).toUpperCase() : <UserCircle className="h-6 w-6" />}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <p className="text-muted-foreground mt-3 text-lg">Efficiently manage your travel expenses and vendor payments.</p>
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <HandCoins className="mr-2 h-6 w-6 text-primary" />
                  Add New Expense
                </CardTitle>
                <CardDescription>Record a new payment or amount owed to a vendor.</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseForm onAddExpense={handleAddExpense} vendors={vendors} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Users className="mr-2 h-6 w-6 text-primary" />
                  Manage Vendors
                </CardTitle>
                <CardDescription>Add new vendors or remove unused ones.</CardDescription>
              </CardHeader>
              <CardContent>
                <VendorForm onAddVendor={handleAddVendor} />
                {vendors.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Existing Vendors:</h3>
                     <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 bg-muted/30 rounded-md border border-input">
                      {vendors.map(vendor => (
                        <AlertDialog key={vendor.id}>
                          <div className="flex items-center bg-secondary rounded-full pr-1 group shadow-sm hover:shadow-md transition-shadow">
                            <Badge variant="secondary" className="py-1.5 px-3 text-sm rounded-r-none group-hover:bg-secondary/80 transition-colors">
                              {vendor.name}
                            </Badge>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-destructive/20 group-hover:opacity-100 opacity-70 transition-opacity">
                                <XIcon className="h-3.5 w-3.5 text-destructive/80 group-hover:text-destructive" />
                                <span className="sr-only">Delete {vendor.name}</span>
                              </Button>
                            </AlertDialogTrigger>
                          </div>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                                Confirm Deletion
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the vendor "{vendor.name}"? This action cannot be undone.
                                <br/>
                                <span className="text-xs text-muted-foreground"> (Note: Vendors associated with expenses cannot be deleted.)</span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteVendor(vendor.id)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Delete Vendor
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator className="my-8 no-print" />

        <Card className="shadow-lg no-print">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
                <Settings className="mr-2 h-6 w-6 text-primary" />
                View & Filter Records
            </CardTitle>
             <CardDescription>Filter your expense records by vendor or print a statement.</CardDescription>
          </CardHeader>
          <CardContent>
            <FilterControls
              vendors={sortedUniqueVendorNames}
              selectedVendor={selectedVendorFilter}
              onVendorChange={setSelectedVendorFilter}
              onPrint={handlePrint}
            />
          </CardContent>
        </Card>
        
        <div className="printable-area">
           <div className="print-header-logo hidden print:block">
              <svg viewBox="0 0 24 24" className="mx-auto" style={{width: '80px', height: 'auto'}} fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" />
                <path d="M8 14H16V12H8V14ZM8 18H13V16H8V18Z"/>
              </svg>
            </div>
          <div className="print-statement-title hidden print:block">
            Expense Statement
          </div>
          <div className="print-statement-subtitle hidden print:block">
            {selectedVendorFilter !== "all" ? `For Vendor: ${selectedVendorFilter}` : "All Vendors"}
            <br />
            Generated on: {printDate}
          </div>
          
          <ExpenseSummary
            totalPaid={summary.totalPaid}
            totalOutstanding={summary.totalOutstanding}
          />
          <div className="mt-6">
            <ExpenseTable expenses={filteredExpenses} onDeleteExpense={handleDeleteExpense} />
          </div>
          <div className="print-footer hidden print:block">
            ProLedger - Your Professional Expense Tracking Solution
          </div>
        </div>
      </div>
    </div>
  );
}
