
"use client";

import type * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { ExpenseData } from "@/types/expense"; // Use ExpenseData for form
import type { Vendor } from "@/types/vendor";
// Removed useToast as it's handled in page.tsx

const formSchema = z.object({
  vendorName: z.string().min(1, { message: "Vendor selection is required." }),
  date: z.date({ required_error: "Expense date is required." }),
  description: z.string().max(100, "Description can be up to 100 characters.").optional(),
  totalAmountOwed: z.coerce.number().min(0, { message: "Total amount must be non-negative." }),
  amountPaid: z.coerce.number().min(0, { message: "Amount paid must be non-negative." }),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  onAddExpense: (expense: ExpenseData) => Promise<void>; // Now async
  vendors: Vendor[];
}

export function ExpenseForm({ onAddExpense, vendors }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorName: "",
      date: new Date(),
      description: "",
      totalAmountOwed: 0,
      amountPaid: 0,
    },
  });

  async function onSubmit(values: ExpenseFormValues) { // Mark as async
    await onAddExpense(values); // Await the async operation
    // Toast is handled in page.tsx after successful Firestore operation
    form.reset({ 
        vendorName: "", 
        date: new Date(), 
        description: "", 
        totalAmountOwed: 0, 
        amountPaid: 0
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="vendorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vendors.length === 0 ? (
                       <p className="p-2 text-sm text-muted-foreground text-center">No vendors. Add one first.</p>
                    ) : (
                      vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.name}>
                          {vendor.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expense Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Hotel booking, Flight tickets" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="totalAmountOwed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount Owed (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 3000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amountPaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount Paid (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full md:w-auto" variant="default" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Adding..." : <><PlusCircle className="mr-2 h-4 w-4" /> Add Expense</>}
        </Button>
      </form>
    </Form>
  );
}
