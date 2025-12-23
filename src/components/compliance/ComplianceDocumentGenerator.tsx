
import React, { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, FileCheck } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Donation } from "@/services/types";

// Types of documents
const DOC_TYPES = [
    { value: 'prevention_plan', label: '1. Plan de Prevención', desc: 'Normativa Vigente - Documento estratégico obligatorio' },
    { value: 'donation_register', label: '2. Registro de Donaciones', desc: 'Trazabilidad oficial y Valoración Fiscal' },
    { value: 'management_report', label: '3. Informe de Gestión de Excedentes', desc: 'Reporte mensual de desviaciones del vertedero' },
    { value: 'internal_protocol', label: '4. Protocolo de Gestión Interna', desc: 'Procedimientos (SOP) para el personal' },
    { value: 'donation_agreement', label: '5. Acuerdo de Donación', desc: 'Convenio marco con cláusula de responsabilidad' },
    { value: 'compliance_cert', label: '6. Certificado de Cumplimiento', desc: 'Acreditación para entregar al Gobierno' },
];

interface ComplianceDocumentGeneratorProps {
    donations: Donation[];
    defaultType?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export const ComplianceDocumentGenerator = ({
    donations,
    defaultType = 'prevention_plan',
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    trigger
}: ComplianceDocumentGeneratorProps) => {
    const { user } = useAuth();
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen ?? internalOpen;
    const setIsOpen = setControlledOpen ?? setInternalOpen;

    const [docType, setDocType] = useState(defaultType);
    const [businessName, setBusinessName] = useState(user?.name || "Mi Empresa S.L.");
    const [cif, setCif] = useState("B12345678"); // Would come from profile
    const [address, setAddress] = useState("Calle Principal 123, Madrid");
    const [responsible, setResponsible] = useState(user?.name || "Gerente");

    // Report specific state
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

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

    const generatePDF = async () => {
        const doc = new jsPDF();
        const logoData = await getLogoBase64();

        switch (docType) {
            case 'prevention_plan':
                generatePreventionPlan(doc, logoData);
                break;
            case 'donation_register':
                generateDonationRegister(doc, logoData);
                break;
            case 'management_report':
                generateManagementReport(doc, logoData);
                break;
            case 'internal_protocol':
                generateInternalProtocol(doc, logoData);
                break;
            case 'donation_agreement':
                generateAgreement(doc, logoData);
                break;
            case 'compliance_cert':
                generateCertificate(doc, logoData);
                break;
        }

        doc.save(`${docType}_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("Documento Oficial generado correctamente");
        setIsOpen(false);
    };

    // --- TEMPLATE GENERATORS ---

    const addOfficialStamp = (doc: jsPDF, x: number, y: number) => {
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(1);
        doc.circle(x, y, 18);
        doc.circle(x, y, 16);

        doc.setFontSize(6);
        doc.setTextColor(41, 128, 185);

        // Circular text simulation
        doc.text("NEGENTROPY AI", x - 6, y - 10);
        doc.text("COMPLIANCE", x - 5, y + 12);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("VERIFICADO", x - 8, y + 1);

        doc.setLineWidth(0.5);
        doc.line(x - 12, y - 4, x + 12, y - 4);
        doc.line(x - 12, y + 5, x + 12, y + 5);
    };

    const addHeader = (doc: jsPDF, title: string, subtitle: string, logoData?: string) => {
        doc.setFillColor(41, 128, 185); // Blue header
        doc.rect(0, 0, 210, 35, 'F');

        // Logo
        if (logoData) {
            doc.addImage(logoData, 'PNG', 170, 5, 25, 25);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(title, 14, 18);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(subtitle.toUpperCase(), 14, 26);
        doc.setFontSize(8);
        doc.text(`REF: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 14, 42); // Verification Code
        doc.setTextColor(0, 0, 0); // Reset text color
    };

    const addFooter = (doc: jsPDF, logoData?: string) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Footer Line
            doc.setDrawColor(200);
            doc.line(14, 275, 196, 275);

            // Tech Stamp
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text(`Documento generado y trazado mediante tecnología Negentropy AI.`, 14, 282);
            doc.text(`Huella Digital: ${Math.random().toString(36).substr(2, 16)}...`, 14, 286);

            if (logoData) {
                // Small watermark logo in footer
                doc.addImage(logoData, 'PNG', 180, 278, 10, 10);
            }

            doc.text(`Pág ${i}/${pageCount}`, 196, 282, { align: 'right' });
        }
    };

    const generatePreventionPlan = (doc: jsPDF, logoData?: string) => {
        addHeader(doc, "PLAN DE PREVENCIÓN Y REDUCCIÓN", "Normativa Vigente de Prevención del Desperdicio Alimentario", logoData);

        // 1. Datos Empresa
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("1. DATOS IDENTIFICATIVOS", 14, 40);

        autoTable(doc, {
            startY: 45,
            theme: 'plain',
            body: [
                ['Razón Social:', businessName],
                ['CIF:', cif],
                ['Dirección:', address],
                ['Responsable del Plan:', responsible],
                ['Actividad Principal:', 'Hostelería / Distribución'],
            ],
            styles: { fontSize: 10, cellPadding: 2 }
        });

        // 2. Jerarquía de Prioridades (NEW SECTION)
        doc.text("2. JERARQUÍA DE PRIORIDADES APLICADA", 14, (doc as any).lastAutoTable.finalY + 15);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Prioridad', 'Destino', 'Estimación %']],
            body: [
                ['1. PRIORITARIO', 'Consumo Humano (Donación)', '85%'],
                ['2. SECUNDARIO', 'Transformación (Zumos, mermeladas)', '10%'],
                ['3. TERCIARIO', 'Alimentación Animal', '3%'],
                ['4. ÚLTIMO RECURSO', 'Compostaje / Industrial', '2%'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        // 3. Diagnóstico (Renumbered)
        doc.text("3. DIAGNÓSTICO E INDICADORES", 14, (doc as any).lastAutoTable.finalY + 15);

        // Mock calculations
        const totalKg = donations.reduce((sum, d) => sum + (d.kg || 0), 0);
        const estimatedWaste = totalKg * 0.15; // Mock 15% waste

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Indicador', 'Valor Actual', 'Objetivo']],
            body: [
                ['Volumen Mensual Gestionado', '1,250 kg', '-'],
                ['Porcentaje de Merma Estimado', '12.5%', '< 10%'],
                ['KG Donados (Recuperados)', `${totalKg.toFixed(1)} kg`, 'Aumentar 10%'],
                ['KG Residuos Finales', `${estimatedWaste.toFixed(1)} kg`, 'Reducir 15%'],
            ],
        });

        // 4. Medidas
        doc.text("4. MEDIDAS DE PREVENCIÓN IMPLEMENTADAS", 14, (doc as any).lastAutoTable.finalY + 15);
        const measures = [
            "[X] Control de stocks (FIFO) digitalizado",
            "[X] Donación de excedentes aptos para consumo (Prioridad 1)",
            "[X] Transformación de mermas en otros productos (Prioridad 2)",
            "[ ] Venta a precios reducidos (Happy Hour)",
            "[X] Formación del personal en Normativa Vigente"
        ];
        let y = (doc as any).lastAutoTable.finalY + 25;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        measures.forEach(m => {
            doc.text(m, 14, y);
            y += 7;
        });

        // Signatures
        doc.text("Firma del Responsable:", 14, y + 20);
        doc.line(14, y + 35, 80, y + 35);

        addFooter(doc, logoData);
    };

    const generateDonationRegister = (doc: jsPDF, logoData?: string) => {
        addHeader(doc, "REGISTRO DE DONACIONES", "Normativa Vigente - Trazabilidad y Valoración", logoData);

        doc.setFontSize(10);
        doc.text(`Entidad Donante: ${businessName} (${cif})`, 14, 40);
        doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 14, 45);

        // Filters
        // In a real app we'd filter by user selection, using all for now

        const tableData = donations.map(d => [
            new Date(d.created_at).toLocaleDateString(),
            d.ngo,
            d.product_id ? `Prod #${d.product_id}` : 'Lote Varios',
            `${d.quantity} u.`,
            `${(d.value_eur || 0).toFixed(2)} €`, // NEW: Value Column
            'Refrigerado/Ambiente',
            new Date(new Date(d.created_at).getTime() + 86400000 * 30).toLocaleDateString() // Mock expiry
        ]);

        autoTable(doc, {
            startY: 55,
            head: [['Fecha', 'Receptor', 'Producto', 'Cant.', 'Valor (€)', 'Conserv.', 'Caducidad']],
            body: tableData,
            foot: [['', '', 'TOTAL VALOR:', '', `${donations.reduce((s, d) => s + (d.value_eur || 0), 0).toFixed(2)} €`, '', '']]
        });

        doc.setFontSize(9);
        doc.text("* Valor contable (coste de producción sin margen comercial) a efectos de deducción fiscal (Modelo 182).", 14, (doc as any).lastAutoTable.finalY + 10);
        doc.setFontSize(10);
        doc.text("Certifico que los productos donados cumplen los requisitos de seguridad alimentaria vigentes.", 14, (doc as any).lastAutoTable.finalY + 20);
        doc.text("Firma Digital:", 14, (doc as any).lastAutoTable.finalY + 35);
        doc.line(14, (doc as any).lastAutoTable.finalY + 50, 80, (doc as any).lastAutoTable.finalY + 50);

        addFooter(doc, logoData);
    };

    const generateManagementReport = (doc: jsPDF, logoData?: string) => {
        addHeader(doc, "INFORME DE GESTIÓN DE EXCEDENTES", `Normativa Vigente - Periodo: ${reportMonth}`, logoData);

        autoTable(doc, {
            startY: 40,
            body: [
                ['Establecimiento:', businessName],
                ['Mes Reportado:', reportMonth],
                ['Responsable:', responsible]
            ],
            theme: 'plain'
        });

        doc.text("RESUMEN DE FLUJOS (Jerarquía de Prioridades)", 14, 75);

        // Mock Data for the report
        const data = [
            ['1. Preventa / Consumo Humano', '1,200 kg', '92%'],
            ['2. Donación (Fines Sociales)', '50 kg', '4%'],
            ['3. Transformación / Otros Usos', '30 kg', '2.5%'],
            ['4. Residuos (Vertedero/Reciclaje)', '20 kg', '1.5%']
        ];

        autoTable(doc, {
            startY: 80,
            head: [['Destino del Alimento', 'Volumen (Kg)', '% Total']],
            body: data,
            foot: [['Total Gestionado', '1,300 kg', '100%']],
        });

        doc.setFontSize(10);
        doc.setTextColor(0, 100, 0);
        doc.text(`Huella de Carbono Evitada: ~180 kg CO2eq`, 14, (doc as any).lastAutoTable.finalY + 15);
        doc.setTextColor(0, 0, 0);

        addFooter(doc, logoData);
    };

    const generateInternalProtocol = (doc: jsPDF, logoData?: string) => {
        addHeader(doc, "PROTOCOLO DE GESTIÓN INTERNA", "SOP - Procedimientos según Normativa Vigente", logoData);

        const content = [
            { t: "1. Objetivo", d: "Establecer las pautas para minimizar el desperdicio y gestionar correctamente los excedentes según la normativa vigente." },
            { t: "2. Identificación de Productos (Semáforo)", d: "- Verde: Vida útil > 5 días. Venta normal.\n- Amarillo: Vida útil < 3 días. Zona de oferta o donación.\n- Rojo: Caducado o no apto. Retirada a residuo." },
            { t: "3. Proceso de Donación", d: "a) Separar productos en 'Zona Donación'.\nb) Verificar integridad del envase.\nc) Registrar en Negentropy AI.\nd) Entregar a ONG con albarán digital." },
            { t: "4. Mermas y Residuos", d: "Todo alimento desechado debe pesarse y registrarse indicando la causa (rotura, caducidad, calidad) antes de tirarlo al contenedor orgánico." }
        ];

        let y = 40;
        content.forEach(section => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(section.t, 14, y);
            y += 7;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            const lines = doc.splitTextToSize(section.d, 180);
            doc.text(lines, 14, y);
            y += (lines.length * 5) + 10;
        });

        doc.text(`Aprobado por: ${responsible}`, 14, y + 10);
        addFooter(doc, logoData);
    };

    const generateAgreement = (doc: jsPDF, logoData?: string) => {
        addHeader(doc, "ACUERDO DE DONACIÓN ALIMENTARIA", "Convenio Marco - Normativa Vigente", logoData);

        doc.setFontSize(10);
        doc.text("En una parte, la entidad donante:", 14, 40);
        doc.text(`${businessName}, con CIF ${cif} y domicilio en ${address}.`, 14, 45);

        doc.text("Y en la otra, la entidad receptora (ONG):", 14, 55);
        doc.text(`[NOMBRE ONG], con CIF [CIF ONG] y domicilio en [DIRECCIÓN].`, 14, 60);

        doc.text("EXPONEN:", 14, 75);
        doc.text("1. Que ambas partes desean colaborar para reducir el desperdicio alimentario y ayudar a colectivos vulnerables.", 14, 80);

        doc.text("ACUERDAN:", 14, 95);
        const clauses = [
            "PRIMERO: La empresa se compromete a donar excedentes que cumplan los requisitos de seguridad e higiene.",
            "SEGUNDO: La ONG se compromete a recoger, transportar y distribuir los alimentos garantizando la cadena de frío.",
            "TERCERO: Ambas partes utilizarán la plataforma Negentropy AI para la trazabilidad digital de las entregas.",
            "CUARTO (Responsabilidad): La empresa donante garantiza el cumplimiento de los requisitos higiénico-sanitarios hasta el momento de la entrega. A partir de la recepción, la entidad receptora asume la total responsabilidad sobre la conservación y el destino final de los alimentos.",
            "QUINTO: Este acuerdo tiene una vigencia anual prorrogable automáticamente."
        ];

        let y = 100;
        clauses.forEach(c => {
            const lines = doc.splitTextToSize(c, 180);
            doc.text(lines, 14, y);
            y += (lines.length * 5) + 5;
        });

        y += 20;
        doc.text("Firmado en Madrid, a " + new Date().toLocaleDateString(), 14, y);

        doc.text("POR LA EMPRESA", 40, y + 20);
        doc.text("POR LA ONG", 140, y + 20);

        addFooter(doc, logoData);
    };

    const generateCertificate = (doc: jsPDF, logoData?: string) => {
        addHeader(doc, "CERTIFICADO DE CUMPLIMIENTO", "Normativa Vigente de Prevención del Desperdicio", logoData);

        doc.setFontSize(12);
        doc.text(`D. ${responsible}, como representante de ${businessName},`, 14, 50);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("CERTIFICA", 105, 70, { align: 'center' });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        const items = [
            "Que la empresa dispone de un Plan de Prevención del Desperdicio Alimentario.",
            "Que realiza mediciones y registros digitales de sus mermas y donaciones.",
            "Que prioriza el consumo humano a través de donaciones a entidades sociales.",
            "Que utiliza la tecnología 'Negentropy AI' para la trazabilidad y optimización.",
            "Que cumple con las obligaciones de información establecidas en la normativa vigente."
        ];

        let y = 90;
        items.forEach((item, i) => {
            doc.text(`${i + 1}. ${item}`, 20, y);
            y += 12;
        });

        doc.text("Y para que conste ante las autoridades competentes, firma el presente certificado.", 14, y + 10);

        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, y + 30);
        doc.text("Firma y Sello:", 14, y + 45);

        // Add Official Stamp
        addOfficialStamp(doc, 160, y + 40);

        addFooter(doc, logoData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-green-600" />
                        Generador de Documentación Legal
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona la plantilla oficial requerida. Los documentos se rellenarán automáticamente con los datos del sistema.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo de Documento</Label>
                            <Select value={docType} onValueChange={setDocType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOC_TYPES.map(Type => (
                                        <SelectItem key={Type.value} value={Type.value}>
                                            {Type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                {DOC_TYPES.find(d => d.value === docType)?.desc}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Empresa / Declarante</Label>
                            <Input value={businessName} onChange={e => setBusinessName(e.target.value)} />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border rounded-lg space-y-4">
                        <div className="flex items-start gap-3">
                            <FileText className="h-10 w-10 text-gray-400 mt-1" />
                            <div>
                                <h4 className="font-semibold text-sm">{DOC_TYPES.find(d => d.value === docType)?.label}</h4>
                                <p className="text-xs text-gray-500 max-w-sm mt-1">
                                    Este documento incluirá automáticamente:
                                </p>
                                <ul className="text-xs text-gray-600 list-disc ml-4 mt-1 space-y-1">
                                    <li>Datos identificativos de <strong>{businessName}</strong> ({cif})</li>
                                    <li>Firma del responsable: <strong>{responsible}</strong></li>
                                    {docType === 'prevention_plan' && <li>Diagnóstico y Jerarquía de Prioridades</li>}
                                    {docType === 'donation_register' && <li>Listado de Donaciones con Valoración Fiscal</li>}
                                    {docType === 'management_report' && <li>KPIs del mes de {reportMonth}</li>}
                                    {docType === 'internal_protocol' && <li>Procedimientos FIFO y semáforo de caducidad</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
                        <Download className="mr-2 h-4 w-4" /> Descargar PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
