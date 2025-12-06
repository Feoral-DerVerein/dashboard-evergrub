import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Loader2, Eye, Calendar } from "lucide-react";
import { toast } from "sonner";
import { complianceReportService, ComplianceReportRequest } from "@/services/complianceReportService";
import { useTranslation } from "react-i18next";

interface ComplianceReportGeneratorProps {
    businessName?: string;
}

const ComplianceReportGenerator = ({ businessName }: ComplianceReportGeneratorProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reportType, setReportType] = useState<'spain_ley1_2025' | 'australia_epa' | 'prevention_plan_spain'>('spain_ley1_2025');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        date.setDate(1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        date.setDate(0); // Last day of previous month
        return date.toISOString().split('T')[0];
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [reportTitle, setReportTitle] = useState('');

    const handleGenerate = async () => {
        if (!user?.id) {
            toast.error("Debes iniciar sesión");
            return;
        }

        setIsLoading(true);
        setPreview(null);

        try {
            const request: ComplianceReportRequest = {
                reportType,
                startDate,
                endDate,
                businessName
            };

            const response = await complianceReportService.generateReport(user.id, request);

            if (!response.success || !response.report) {
                throw new Error(response.error || "Error generating report");
            }

            setPreview(response.report);
            setReportTitle(response.title || 'Compliance_Report');
            toast.success("Informe generado correctamente");
        } catch (error: any) {
            console.error("Error generating report:", error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!preview || !reportTitle) return;

        setIsLoading(true);
        try {
            await complianceReportService.downloadAsPdf(preview, reportTitle);
            toast.success("PDF descargado correctamente");
        } catch (error: any) {
            console.error("Error downloading PDF:", error);
            toast.error("Error al descargar el PDF");
        } finally {
            setIsLoading(false);
        }
    };

    const reportTypes = [
        { value: 'spain_ley1_2025', label: t('compliance.types.spain_ley1_2025'), description: 'Informe de cumplimiento y auditoría' },
        { value: 'prevention_plan_spain', label: t('compliance.types.prevention_plan'), description: 'Documento estratégico (Obligatorio)' },
        { value: 'australia_epa', label: t('compliance.types.australia_epa'), description: 'FOGO Compliance Report' }
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <FileText className="h-4 w-4 mr-2" />
                    {t('compliance.generate_btn')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        {t('compliance.title')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Report Type Selection */}
                    <div className="space-y-2">
                        <Label>{t('compliance.type_label')}</Label>
                        <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {reportTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <div className="flex flex-col">
                                            <span>{type.label}</span>
                                            <span className="text-xs text-gray-500">{type.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {t('compliance.date_start')}
                            </Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {t('compliance.date_end')}
                            </Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                {t('compliance.generate_preview')}
                            </>
                        )}
                    </Button>

                    {/* Preview */}
                    {preview && (
                        <div className="space-y-4">
                            <Label>Vista Previa del Informe</Label>
                            <Textarea
                                value={preview}
                                readOnly
                                className="font-mono text-xs h-64 bg-gray-50"
                            />
                            <Button
                                onClick={handleDownload}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Descargando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        {t('compliance.download_pdf')}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ComplianceReportGenerator;
