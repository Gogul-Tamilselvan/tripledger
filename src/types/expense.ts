
export interface Expense {
  id: string;
  vendorName: string; // This will be selected from the list of managed Vendors
  date: Date;
  description?: string; // Optional description for the expense
  totalAmountOwed: number;
  amountPaid: number;
  outstandingBalance: number;
}
