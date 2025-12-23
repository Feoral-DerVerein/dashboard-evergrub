
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, Settings } from "lucide-react";
import { toast } from "sonner";
import { Donation } from "@/services/types";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Schema based on "Registro de Tipo 1: Declarante"
const model182Schema = z.object({
    exercise: z.string().length(4, "Debe ser un año de 4 cifras"), // Pos 5-8
    nif: z.string().min(9, "NIF inválido").max(9, "NIF inválido"), // Pos 9-17
    companyName: z.string().max(40, "Máximo 40 caracteres"), // Pos 18-57
    contactPhone: z.string().length(9, "Debe tener 9 dígitos"), // Pos 59-67
    contactName: z.string().max(40, "Máximo 40 caracteres"), // Pos 68-107
    isComplementary: z.boolean().optional(),
    isSubstitute: z.boolean().optional(),
    previousDeclarationId: z.string().optional(), // Pos 123-135
});

type Model182FormData = z.infer<typeof model182Schema>;

interface Model182DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    donations: Donation[];
    user: any;
}

export const Model182Dialog = ({ open, onOpenChange, donations, user }: Model182DialogProps) => {
    const [step, setStep] = useState(1); // 1: Form, 2: Preview/Success

    const form = useForm<Model182FormData>({
        resolver: zodResolver(model182Schema),
        defaultValues: {
            exercise: new Date().getFullYear().toString(),
            nif: "",
            companyName: user?.name || "",
            contactPhone: "",
            contactName: user?.name || "",
            isComplementary: false,
            isSubstitute: false
        }
    });

    // Calculate totals for preview
    const totalAmount = donations.reduce((sum, d) => sum + (d.value_eur || 0), 0);
    const totalDonations = donations.length;

    // Helper to load logo
    const getLogoBase64 = (): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = '/negentropy-logo.png';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    resolve('');
                }
            };
            img.onerror = () => resolve('');
        });
    };

    const generatePDFReport = async () => {
        const data = form.getValues();
        const doc = new jsPDF();
        const logoData = await getLogoBase64();

        // Header
        // Blue background for header (optional, to match other docs)
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, 210, 35, 'F');

        // Logo
        if (logoData) {
            doc.addImage(logoData, 'PNG', 170, 5, 25, 25);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Informe de Donaciones - Modelo 182", 14, 18);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Ejercicio: ${data.exercise}`, 14, 26);
        doc.text(`Declarante: ${data.companyName} (${data.nif})`, 14, 31);

        // Reset text color for body
        doc.setTextColor(0, 0, 0);

        // Table
        const tableData = donations.map(d => [
            new Date(d.created_at).toLocaleDateString(),
            d.ngo,
            "G12345678", // Mock NIF
            `${(d.value_eur || 0).toFixed(2)} €`,
            d.status
        ]);

        autoTable(doc, {
            startY: 45,
            head: [['Fecha', 'Entidad Receptora', 'NIF Entidad', 'Importe', 'Estado']],
            body: tableData,
            foot: [['', 'TOTAL', '', `${totalAmount.toFixed(2)} €`, '']],
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`Informe_Donaciones_${data.exercise}.pdf`);
        toast.success("Informe PDF descargado con logo");
    };

    const onSubmit = (data: Model182FormData) => {
        // Just trigger the PDF report generation
        generatePDFReport();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <DialogTitle>Generar Modelo 182 (Hacienda)</DialogTitle>
                    </div>
                    <DialogDescription>
                        Genera el archivo oficial (.txt) para la AEAT o un informe legible (.pdf) para uso interno.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="exercise" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ejercicio Fiscal</FormLabel>
                                    <FormControl><Input {...field} maxLength={4} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="nif" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NIF Declarante</FormLabel>
                                    <FormControl><Input placeholder="B12345678" {...field} maxLength={9} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="companyName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Razón Social / Denominación</FormLabel>
                                <FormControl><Input placeholder="Mi Empresa S.L." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="contactName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Persona de Contacto</FormLabel>
                                    <FormControl><Input placeholder="Nombre Apellidos" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="contactPhone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl><Input placeholder="600123456" {...field} maxLength={9} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="p-3 bg-gray-50 rounded border border-gray-100 mt-2">
                            <h4 className="text-sm font-medium mb-2 text-gray-700">Resumen de Datos a Declarar</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">Total Donaciones</span>
                                    <span className="font-semibold">{totalDonations} registros</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Importe Total</span>
                                    <span className="font-semibold">{totalAmount.toFixed(2)} €</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-6 gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">Cancelar</Button>
                            <Button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700 gap-2"
                                onClick={form.handleSubmit(generatePDFReport)}
                            >
                                <Download className="h-4 w-4" /> Generar Informe PDF
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
