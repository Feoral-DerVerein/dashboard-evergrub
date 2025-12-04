import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useDonations } from "@/hooks/useDonations";

const ngoSchema = z.object({
    name: z.string().min(2, "El nombre es requerido"),
    contact_email: z.string().email("Email inválido").optional().or(z.literal("")),
    contact_phone: z.string().min(5, "Teléfono inválido").optional().or(z.literal("")),
    address: z.string().optional(),
    tax_id: z.string().optional(),
});

type NgoFormData = z.infer<typeof ngoSchema>;

interface RegisterNgoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RegisterNgoDialog({ open, onOpenChange }: RegisterNgoDialogProps) {
    const { createNgo, loading } = useDonations();
    const form = useForm<NgoFormData>({
        resolver: zodResolver(ngoSchema),
        defaultValues: {
            name: "",
            contact_email: "",
            contact_phone: "",
            address: "",
            tax_id: "",
        },
    });

    const onSubmit = async (data: NgoFormData) => {
        const success = await createNgo(data);
        if (success) {
            form.reset();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Nueva ONG</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Organización *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Banco de Alimentos Madrid" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact_email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email de Contacto</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="contacto@ong.org" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono de Contacto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+34 600 000 000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Calle Principal 123, Madrid" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tax_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CIF/NIF</FormLabel>
                                    <FormControl>
                                        <Input placeholder="G12345678" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Registrando..." : "Registrar ONG"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
