
import { supabase } from "@/integrations/supabase/client";

export interface ComplianceReportRequest {
    reportType: 'spain_ley1_2025' | 'australia_epa' | 'prevention_plan_spain' | 'general';
    startDate: string;
    endDate: string;
    businessName?: string;
    tenantId?: string;
}

export interface ComplianceStats {
    totalWasteKg: number;
    totalDonatedKg: number;
    totalSurplus: number;
    donationPercentage: number;
    wasteByReason: Record<string, number>;
    donationsByRecipient: Record<string, number>;
}

export interface ComplianceReportResponse {
    success: boolean;
    report?: string;
    title?: string;
    stats?: ComplianceStats;
    generatedAt?: string;
    error?: string;
}

export const complianceReportService = {
    async generateReport(
        tenantId: string,
        request: ComplianceReportRequest
    ): Promise<ComplianceReportResponse> {
        try {
            const { data, error } = await supabase.functions.invoke('generate-compliance-pdf', {
                body: {
                    ...request,
                    tenantId
                }
            });

            if (error) {
                console.error('Error generating compliance report:', error);
                return { success: false, error: error.message };
            }

            return data as ComplianceReportResponse;
        } catch (err: any) {
            console.error('Error in generateReport:', err);
            return { success: false, error: err.message };
        }
    },

    async downloadAsPdf(reportContent: string, filename: string): Promise<void> {
        // Dynamic import of jsPDF
        const jsPDF = (await import('jspdf')).default;
        const pdf = new jsPDF();

        // Split content into lines
        const lines = reportContent.split('\n');
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 15;
        const maxWidth = pageWidth - margin * 2;
        let yPosition = 20;
        const lineHeight = 5;

        pdf.setFontSize(8);
        pdf.setFont('courier', 'normal');

        for (const line of lines) {
            // Check for section headers (lines with === or ---)
            if (line.includes('===')) {
                pdf.setFontSize(10);
                pdf.setFont('courier', 'bold');
            } else if (line.includes('---')) {
                pdf.setFontSize(9);
                pdf.setFont('courier', 'bold');
            } else {
                pdf.setFontSize(8);
                pdf.setFont('courier', 'normal');
            }

            // Handle page breaks
            if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
            }

            // Wrap long lines
            const wrappedLines = pdf.splitTextToSize(line, maxWidth);
            for (const wrappedLine of wrappedLines) {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;
                }
                pdf.text(wrappedLine, margin, yPosition);
                yPosition += lineHeight;
            }
        }

        // Add footer
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(7);
            pdf.setFont('courier', 'normal');
            pdf.text(
                `Página ${i} de ${pageCount} | Generado por Negentropy AI`,
                margin,
                pageHeight - 10
            );
        }

        // Save the PDF
        const timestamp = new Date().toISOString().split('T')[0];
        pdf.save(`${filename}_${timestamp}.pdf`);
    },

    getReportTypeName(type: string): string {
        switch (type) {
            case 'spain_ley1_2025':
                return 'Ley 1/2025 - España';
            case 'australia_epa':
                return 'NSW EPA - Australia';
            default:
                return 'General';
        }
    }
};

export default complianceReportService;
