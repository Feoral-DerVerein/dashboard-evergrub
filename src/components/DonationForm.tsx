
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email" }),
  phone: z.string().min(5, { message: "Invalid phone number" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  foodType: z.string().min(1, { message: "Food type is required" }),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DonationFormProps {
  onClose: () => void;
  product?: {
    id: number;
    name: string;
    quantity: number;
    expirationDate: string;
    category: string;
    price: number;
    image: string;
  } | null;
}

export function DonationForm({ onClose, product }: DonationFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      amount: product ? product.quantity.toString() : "",
      foodType: product ? product.name : "",
      message: product ? `Donating ${product.name} (${product.category}) - Expires: ${new Date(product.expirationDate).toLocaleDateString()}` : "",
    },
  });

  function onSubmit(data: FormValues) {
    toast.success("Thank you for your donation!", {
      description: `We will contact you soon about your donation of ${data.amount} of ${data.foodType}.`,
      duration: 5000,
    });
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="How much food can you donate?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="foodType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food Type</FormLabel>
              <FormControl>
                <Input placeholder="Type of food you want to donate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Message (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional information about your donation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
