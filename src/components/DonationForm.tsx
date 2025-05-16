
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
  name: z.string().min(2, { message: "El nombre es requerido" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(5, { message: "Teléfono inválido" }),
  amount: z.string().min(1, { message: "La cantidad es requerida" }),
  foodType: z.string().min(1, { message: "El tipo de comida es requerido" }),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DonationForm({ onClose }: { onClose: () => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      amount: "",
      foodType: "",
      message: "",
    },
  });

  function onSubmit(data: FormValues) {
    toast.success("¡Gracias por tu donación!", {
      description: `Nos pondremos en contacto contigo pronto sobre tu donación de ${data.amount} de ${data.foodType}.`,
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
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} />
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
                <Input placeholder="tu@email.com" {...field} />
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
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Tu número de teléfono" {...field} />
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
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <Input placeholder="¿Cuánta comida puedes donar?" {...field} />
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
              <FormLabel>Tipo de comida</FormLabel>
              <FormControl>
                <Input placeholder="Tipo de comida que quieres donar" {...field} />
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
              <FormLabel>Mensaje adicional (opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Información adicional sobre tu donación" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Enviar</Button>
        </div>
      </form>
    </Form>
  );
}
