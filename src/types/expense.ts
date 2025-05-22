export interface Expense {
  id: string;
  vendorName: string;
  date: Date;
  totalAmountOwed: number;
  amountPaid: number;
  outstandingBalance: number;
}
