
"use client";

import type * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus } from "lucide-react"; // Removed PlusCircle

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
import type { VendorData } from "@/types/vendor"; // Use VendorData for form
// Removed useToast as it's handled in page.tsx

const formSchema = z.object({
  name: z.string().min(2, { message: "Vendor name must be at least 2 characters." }).max(50, { message: "Vendor name must be 50 characters or less." }),
});

type VendorFormValues = z.infer<typeof formSchema>;

interface VendorFormProps {
  onAddVendor: (vendor: VendorData) => Promise<void>; // Now async
}

export function VendorForm({ onAddVendor }: VendorFormProps) {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: VendorFormValues) { // Mark as async
    await onAddVendor(values); // Await the async operation
    // Toast is handled in page.tsx after successful Firestore operation
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Vendor Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Himalayan Adventures" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" variant="outline" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Adding..." : <><UserPlus className="mr-2 h-4 w-4" /> Add Vendor</>}
        </Button>
      </form>
    </Form>
  );
}
