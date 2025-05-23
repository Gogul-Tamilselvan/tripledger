
import type { Timestamp } from "firebase/firestore";

export interface Expense {
  id: string; // This will be the Firestore document ID
  userId: string; // To associate with the logged-in user
  vendorName: string;
  date: Date | Timestamp; // Stored as Timestamp, used as Date in app
  description?: string;
  totalAmountOwed: number;
  amountPaid: number;
  outstandingBalance: number;
}

export interface ExpenseData extends Omit<Expense, 'id' | 'date' | 'userId' | 'outstandingBalance'> {
  date: Date; // For form input
}
