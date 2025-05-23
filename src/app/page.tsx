
"use client";

import type * as React from "react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Briefcase, Users, HandCoins, Settings, Trash2, XIcon, AlertTriangle, LogOut, UserCircle } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, Timestamp, orderBy } from "firebase/firestore";

import type { Expense, ExpenseData } from "@/types/expense";
import type { Vendor, VendorData } from "@/types/vendor";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
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

export default function TripLedgerPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>("all");
  const [printDate, setPrintDate] = useState<string>("");
  const { toast } = useToast();
  const [dataLoading, setDataLoading] = useState<boolean>(false); // Changed initial state to false

  // Auth check and redirect effect
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("Auth effect: Not loading, no user. Redirecting to /login");
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchAllData = useCallback(async () => {
    if (!user) {
      console.log("fetchAllData: User not available, clearing data and stopping fetch.");
      setDataLoading(false);
      setExpenses([]);
      setVendors([]);
      return;
    }

    console.log("fetchAllData: Attempting to fetch data for user:", user.uid);
    setDataLoading(true);
    try {
      // Fetch Expenses for the current user
      const expensesQuery = query(
        collection(db, "expenses"),
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const fetchedExpenses = expensesSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          date: (data.date as Timestamp).toDate(), 
        } as Expense;
      });
      console.log("fetchAllData: Fetched expenses:", fetchedExpenses.length > 0 ? fetchedExpenses : "None");
      setExpenses(fetchedExpenses);

      // Fetch Vendors for the current user
      const vendorsQuery = query(
        collection(db, "vendors"),
        where("userId", "==", user.uid),
        orderBy("name", "asc")
      );
      const vendorsSnapshot = await getDocs(vendorsQuery);
      const fetchedVendors = vendorsSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as Vendor));
      console.log("fetchAllData: Fetched vendors:", fetchedVendors.length > 0 ? fetchedVendors : "None");
      setVendors(fetchedVendors);

    } catch (error: any) {
      console.error("fetchAllData: Error fetching data from Firestore. Full error object:", error);
      let description = "Could not fetch records. Please check your internet connection.";
      if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        description = "Permission denied. Please check Firestore security rules and ensure they are published.";
      } else if (error.message && (error.message.toLowerCase().includes("index") || error.message.toLowerCase().includes("requires an index"))) {
        description = "Firestore query requires an index. Please check the browser's developer console (F12) for a link to create the missing index in your Firebase project.";
      } else if (error.message) {
        description = `Error: ${error.message}`;
      }
      toast({
        title: "Error Loading Data",
        description: description,
        variant: "destructive",
      });
      setExpenses([]); 
      setVendors([]);
    } finally {
      setDataLoading(false);
      console.log("fetchAllData: Fetch complete, dataLoading set to false.");
    }
  }, [user, toast]); 

  useEffect(() => {
    if (user && !authLoading) {
      console.log("User/Auth effect: User present and auth not loading. Calling fetchAllData.");
      fetchAllData();
    } else if (!authLoading && !user) {
      console.log("User/Auth effect: Auth not loading, no user. Clearing local data states.");
      setExpenses([]);
      setVendors([]);
      setDataLoading(false); // Ensure dataLoading is false if no user
    }
  }, [user, authLoading, fetchAllData]);


  const handleAddExpense = async (newExpenseData: ExpenseData) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "Please log in to add expenses.", variant: "destructive" });
      return;
    }
    console.log("handleAddExpense: Attempting to add expense for user:", user.uid, "Data:", newExpenseData);
    try {
      const expenseToSave = {
        ...newExpenseData,
        userId: user.uid,
        date: Timestamp.fromDate(newExpenseData.date), 
        outstandingBalance: newExpenseData.totalAmountOwed - newExpenseData.amountPaid,
      };
      const docRef = await addDoc(collection(db, "expenses"), expenseToSave);
      console.log("handleAddExpense: Expense added with ID:", docRef.id);
      // Optimistically update UI or refetch
      // For simplicity, refetching all to ensure consistency, but can be optimized
      // fetchAllData(); // Or:
      const addedExpense = { id: docRef.id, ...expenseToSave, date: newExpenseData.date } as Expense; 
      setExpenses(prevExpenses => [...prevExpenses, addedExpense].sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime()));

      toast({
        title: "Expense Added",
        description: `${newExpenseData.vendorName} expense recorded successfully.`,
      });
    } catch (error: any) {
      console.error("handleAddExpense: Error adding expense to Firestore. Full error object:", error);
      let description = "Could not save the expense.";
      if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        description = "Permission denied. Please check Firestore security rules for 'expenses' collection (create operation).";
      } else if (error.message) {
        description = `Error: ${error.message}`;
      }
      toast({
        title: "Error Adding Expense",
        description: description,
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "Please log in to delete expenses.", variant: "destructive" });
      return;
    }
    console.log("handleDeleteExpense: Attempting to delete expense with ID:", expenseId, "for user:", user.uid);
    try {
      await deleteDoc(doc(db, "expenses", expenseId));
      console.log("handleDeleteExpense: Expense deleted successfully from Firestore:", expenseId);
      setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseId));
      toast({
        title: "Expense Deleted",
        description: "The expense record has been removed.",
      });
    } catch (error: any) {
      console.error("handleDeleteExpense: Error deleting expense from Firestore. Full error object:", error);
      let description = "Could not remove the expense.";
       if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        description = "Permission denied. Please check Firestore security rules for 'expenses' collection (delete operation).";
      } else if (error.message) {
        description = `Error: ${error.message}`;
      }
      toast({
        title: "Error Deleting Expense",
        description: description,
        variant: "destructive",
      });
    }
  };

  const handleAddVendor = async (newVendorData: VendorData) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "Please log in to add vendors.", variant: "destructive" });
      return;
    }
    console.log("handleAddVendor: Attempting to add vendor for user:", user.uid, "Data:", newVendorData);
    try {
      // Check if vendor already exists for this user
      const q = query(collection(db, "vendors"), where("userId", "==", user.uid), where("name", "==", newVendorData.name));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        console.log("handleAddVendor: Vendor already exists for this user:", newVendorData.name);
        toast({
          title: "Vendor Exists",
          description: `Vendor "${newVendorData.name}" already exists for you.`,
          variant: "destructive",
        });
        return;
      }

      const vendorToSave = { ...newVendorData, userId: user.uid };
      const docRef = await addDoc(collection(db, "vendors"), vendorToSave);
      console.log("handleAddVendor: Vendor added with ID:", docRef.id, "for user:", user.uid);
      // Optimistically update UI or refetch
      // fetchAllData(); // Or:
      setVendors(prevVendors => [...prevVendors, { id: docRef.id, ...vendorToSave }].sort((a,b) => a.name.localeCompare(b.name)));
      toast({
        title: "Vendor Added",
        description: `Vendor "${newVendorData.name}" has been successfully added.`,
      });
    } catch (error: any) {
      console.error("handleAddVendor: Error adding vendor to Firestore. Full error object:", error);
      let description = "Could not save the vendor.";
      if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        description = "Permission denied. Please check Firestore security rules for 'vendors' collection (create operation).";
      } else if (error.message && (error.message.toLowerCase().includes("index") || error.message.toLowerCase().includes("requires an index"))) {
        description = "Firestore query requires an index. Please check the browser's developer console for a link to create the missing index in Firebase.";
      } else if (error.message) {
        description = `Error: ${error.message}`;
      }
      toast({
        title: "Error Adding Vendor",
        description: description,
        variant: "destructive",
      });
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "Please log in to delete vendors.", variant: "destructive" });
      return;
    }
    const vendorToDelete = vendors.find(v => v.id === vendorId);
    if (!vendorToDelete) {
      console.warn("handleDeleteVendor: Vendor with ID", vendorId, "not found in local state.");
      return;
    }

    console.log("handleDeleteVendor: Attempting to delete vendor:", vendorToDelete.name, "ID:", vendorId, "for user:", user.uid);

    try {
      // Check if vendor is associated with any expenses for this user
      const expensesQuery = query(collection(db, "expenses"), where("userId", "==", user.uid), where("vendorName", "==", vendorToDelete.name));
      const expensesSnapshot = await getDocs(expensesQuery);
      if (!expensesSnapshot.empty) {
        console.log("handleDeleteVendor: Deletion prevented for vendor:", vendorToDelete.name, "Reason: Associated with user's expenses.");
        toast({
          title: "Deletion Prevented",
          description: `Vendor "${vendorToDelete.name}" cannot be deleted as it is associated with your existing expenses.`,
          variant: "destructive",
        });
        return;
      }

      await deleteDoc(doc(db, "vendors", vendorId));
      console.log("handleDeleteVendor: Vendor deleted successfully from Firestore:", vendorToDelete.name);
      setVendors(prevVendors => prevVendors.filter(v => v.id !== vendorId));
      toast({
        title: "Vendor Deleted",
        description: `Vendor "${vendorToDelete.name}" has been removed.`,
      });
    } catch (error: any)      {
      console.error("handleDeleteVendor: Error deleting vendor from Firestore. Full error object:", error);
      let description = "Could not remove the vendor.";
      if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        description = "Permission denied. Please check Firestore security rules for 'vendors' collection (delete operation).";
      } else if (error.message && (error.message.toLowerCase().includes("index") || error.message.toLowerCase().includes("requires an index"))) {
        description = "Firestore query requires an index. Please check the browser's developer console for a link to create the missing index in Firebase.";
      } else if (error.message) {
        description = `Error: ${error.message}`;
      }
      toast({
        title: "Error Deleting Vendor",
        description: description,
        variant: "destructive",
      });
    }
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
    if (user) {
      setPrintDate(format(new Date(), "PPPp"));
      setTimeout(() => window.print(), 100);
    }
  };
  
  // Loading state condition:
  // Show loader if:
  // 1. Auth is still loading (authLoading is true)
  // OR
  // 2. Auth is complete (user is present, authLoading is false), 
  //    AND initial data fetch is in progress (dataLoading is true),
  //    AND we don't have any expenses or vendors loaded yet (to avoid flicker if data loads very fast)
  if (authLoading || (user && !authLoading && dataLoading && expenses.length === 0 && vendors.length === 0)) {
     console.log("Main loading state: authLoading", authLoading, "user", !!user, "dataLoading", dataLoading, "expensesEmpty", expenses.length === 0, "vendorsEmpty", vendors.length === 0);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
        <Briefcase className="h-16 w-16 text-primary animate-pulse" />
        <p className="mt-4 text-lg text-muted-foreground">Loading ProLedger...</p>
      </div>
    );
  }

  // Fallback for redirection if useEffect hasn't kicked in or if user is somehow on this page without being authenticated
  if (!user && !authLoading) { 
     console.log("Redirecting to login (fallback render condition)...");
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
        <Briefcase className="h-16 w-16 text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  if (!user) { // Should be covered by the above, but as a final failsafe.
      console.log("No user and not auth loading - returning null (should not happen if redirect works)");
      return null; 
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 md:p-8">
      <header className="mb-10 text-center no-print">
        <div className="flex justify-between items-center">
            <div></div> 
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
            Generated on: {printDate} by {user?.displayName || user?.email}
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

