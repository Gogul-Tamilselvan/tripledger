
"use client";

import type * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, UserPlus } from "lucide-react";

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
import type { Vendor } from "@/types/vendor";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Vendor name must be at least 2 characters." }).max(50, { message: "Vendor name must be 50 characters or less." }),
});

type VendorFormValues = z.infer<typeof formSchema>;

interface VendorFormProps {
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
}

export function VendorForm({ onAddVendor }: VendorFormProps) {
  const { toast } = useToast();
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: VendorFormValues) {
    onAddVendor({ name: values.name });
    toast({
      title: "Vendor Added",
      description: `Vendor "${values.name}" has been successfully added.`,
      variant: "default",
    });
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
        <Button type="submit" className="w-full" variant="outline">
          <UserPlus className="mr-2 h-4 w-4" /> Add Vendor
        </Button>
      </form>
    </Form>
  );
}
