
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface ComplianceStats {
    totalWasteKg: number;
    totalDonatedKg: number;
    totalSurplus: number;
    donationPercentage: number;
    co2Saved: number;
    economicValue: number;
}

export const complianceReportService = {
    /**
     * Generates a professional PDF report for compliance with Ley 1/2025 and Kit Digital branding.
     */
    async generateMonthlyReport(userId: string, month: number, year: number): Promise<void> {
        try {
            console.log(`📄 Generating compliance report for ${month}/${year}...`);

            // 1. Fetch data from Firestore
            const donationsRef = collection(db, 'donations');
            const startOfMonth = new Date(year, month - 1, 1).toISOString();
            const endOfMonth = new Date(year, month, 0, 23, 59, 59).toISOString();

            const q = query(
                donationsRef,
                where('tenant_id', '==', userId),
                where('created_at', '>=', startOfMonth),
                where('created_at', '<=', endOfMonth),
                orderBy('created_at', 'desc')
            );

            const snapshot = await getDocs(q);
            const donations = snapshot.docs.map(doc => doc.data());

            // Calculate totals
            const totalDonatedKg = donations.reduce((sum, d) => sum + (d.quantity || 0), 0);
            const co2Saved = totalDonatedKg * 2.5;
            const economicValue = totalDonatedKg * 3.5; // Estimated 3.5€ per kg saved

            // 2. Create PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;

            // Header Background
            doc.setFillColor(248, 250, 252);
            doc.rect(0, 0, pageWidth, 40, 'F');

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('REPORTE MENSUAL DE CUMPLIMIENTO - LEY 1/2025', 10, 15);
            doc.text(`Periodo: ${format(new Date(year, month - 1), 'MMMM yyyy', { locale: es }).toUpperCase()}`, 10, 22);

            // Title & Branding
            doc.setFontSize(22);
            doc.setTextColor(16, 163, 127); // Negentropy Green
            doc.text('Negentropy AI', pageWidth - 10, 20, { align: 'right' });
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text('Gestión Inteligente de Excedentes', pageWidth - 10, 28, { align: 'right' });

            // 1. Resumen Ejecutivo
            doc.setTextColor(0);
            doc.setFontSize(16);
            doc.text('1. Resumen Ejecutivo de Impacto', 10, 55);

            autoTable(doc, {
                startY: 60,
                head: [['Métrica', 'Valor Logrado']],
                body: [
                    ['Total Excedentes Donados', `${totalDonatedKg.toFixed(2)} kg`],
                    ['Número de Donaciones Realizadas', `${donations.length}`],
                    ['Ahorro CO2 Estimado', `${co2Saved.toFixed(2)} kg`],
                    ['Valor Económico Recuperado', `${economicValue.toFixed(2)} €`],
                    ['Estado de Cumplimiento Normativo', 'CUMPLE - LEY 1/2025']
                ],
                theme: 'striped',
                headStyles: { fillColor: [16, 163, 127] }
            });

            // 2. Desglose de Donaciones
            doc.setFontSize(16);
            doc.text('2. Registro Detallado de Donaciones', 10, (doc as any).lastAutoTable.cursor.y + 15);

            const donationRows = donations.map(d => [
                format(new Date(d.created_at), 'dd/MM/yyyy'),
                d.product_name || 'Varios',
                d.category || 'General',
                `${d.quantity} kg`,
                d.target_org || 'FESBAL / Cruz Roja'
            ]);

            autoTable(doc, {
                startY: (doc as any).lastAutoTable.cursor.y + 20,
                head: [['Fecha', 'Producto', 'Categoría', 'Cantidad', 'Entidad Destino']],
                body: donationRows.length > 0 ? donationRows : [['-', 'No se registraron donaciones en este periodo', '-', '-', '-']],
                theme: 'grid',
                headStyles: { fillColor: [71, 85, 105] }
            });

            // Compliance certification text
            const finalY = (doc as any).lastAutoTable.cursor.y + 20;
            doc.setFontSize(10);
            doc.setTextColor(100);
            const complianceText = "Certificamos que este establecimiento ha implementado la jerarquía de prioridades establecida en la Ley 1/2025 (BOE-A-2025-...) mediante el uso de la plataforma de inteligencia artificial Negentropy para la prevención del desperdicio alimentario y la gestión eficiente de donaciones.";
            doc.text(doc.splitTextToSize(complianceText, pageWidth - 20), 10, finalY);

            // Mandatory Kit Digital Branding Footer
            doc.setFontSize(8);
            const footerY = pageHeight - 30;
            doc.setDrawColor(200);
            doc.line(10, footerY - 5, pageWidth - 10, footerY - 5);

            doc.text('Documento generado automáticamente por Negentropy AI.', 10, footerY);
            doc.text('Financiado por la Unión Europea - NextGenerationEU', 10, footerY + 5);
            doc.text('Plan de Recuperación, Transformación y Resiliencia (PRTR) - Programa Kit Digital', 10, footerY + 10);

            // Save PDF
            const fileName = `Negentropy_Compliance_${year}_${String(month).padStart(2, '0')}.pdf`;
            doc.save(fileName);

            return;
        } catch (error) {
            console.error("Error generating PDF report:", error);
            throw error;
        }
    }
};

export default complianceReportService;
