import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { complianceReportService } from '@/services/complianceReportService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ComplianceReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ComplianceReportDialog = ({ open, onOpenChange }: ComplianceReportDialogProps) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState<string>(new Date().getMonth().toString()); // Previous month usually, but current for demo
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());

    const handleGenerate = async () => {
        if (!user) return;

        setLoading(true);
        try {
            await complianceReportService.generateMonthlyReport(
                user.uid,
                parseInt(month) + 1, // 0-indexed to 1-indexed
                parseInt(year)
            );
            toast.success("Reporte de cumplimiento generado con éxito.");
            onOpenChange(false);
        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("Hubo un error al generar el PDF.");
        } finally {
            setLoading(false);
        }
    };

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const years = ["2024", "2025"];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <DialogTitle>Reporte de Cumplimiento</DialogTitle>
                    </div>
                    <DialogDescription>
                        Genera un informe oficial en PDF con tus donaciones y ahorro de excedentes para cumplir con la Ley 1/2025.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="month">Mes</Label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger id="month">
                                    <SelectValue placeholder="Selecciona mes" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m, i) => (
                                        <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Año</Label>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger id="year">
                                    <SelectValue placeholder="Selecciona año" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 text-sm text-amber-800">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>Este reporte incluye automáticamente la marca de agua del <strong>Kit Digital</strong> requerida para la justificación de la ayuda.</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex gap-3 text-sm text-green-700">
                        <ShieldCheck className="h-5 w-5 shrink-0" />
                        <p>El documento generado tiene validez legal histórica para auditorías de desperdicio alimentario.</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-[#10a37f] hover:bg-[#0d8c6d] text-white"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Generar y Descargar PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
