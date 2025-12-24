import jsPDF from 'jspdf';
import { Donation } from './types';

// Tipos requeridos para el certificado
interface DonorInfo {
    name: string;
    nif: string; // NIF/CIF for Spanish entities
    address: string;
}

export class DonationCertificateService {

    /**
     * Generates a PDF certificate for a specific donation compliant with Spanish 'Ley 49/2002'.
     * @param donation The donation object
     * @param donor The donor's information (Logged in user/store)
     */
    generateCertificate(donation: Donation, donor: DonorInfo) {
        // 1. Create PDF document
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // 2. Add Branding (Logo placeholder)
        // In a real app, you'd add: doc.addImage(logoBase64, 'PNG', ...)
        doc.setFillColor(68, 12, 230); // Negentropy Blueish
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("CERTIFICADO DE DONACIÓN", pageWidth / 2, 25, { align: 'center' });

        // 3. Certificate Details
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        let startY = 60;
        const lineHeight = 10;

        // NGO Info (Receiver)
        doc.setFont("helvetica", "bold");
        doc.text("ENTIDAD DONATARIA (Receptor):", 20, startY);
        doc.setFont("helvetica", "normal");
        startY += 6;
        doc.text(`Nombre: ${donation.ngo}`, 20, startY);
        startY += 6;
        doc.text("Régimen Fiscal: Entidad acogida a la Ley 49/2002 (Sin fines lucrativos)", 20, startY);

        startY += 15;

        // Donor Info (Giver)
        doc.setFont("helvetica", "bold");
        doc.text("DONANTE:", 20, startY);
        doc.setFont("helvetica", "normal");
        startY += 6;
        doc.text(`Razón Social: ${donor.name}`, 20, startY);
        startY += 6;
        doc.text(`NIF/CIF: ${donor.nif}`, 20, startY);
        startY += 6;
        doc.text(`Domicilio: ${donor.address}`, 20, startY);

        startY += 20;

        // Certification Text
        doc.setDrawColor(200);
        doc.line(20, startY, pageWidth - 20, startY);
        startY += 15;

        const dateStr = new Date(donation.created_at).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const certText = `CERTIFICA:\n\n` +
            `Que ha recibido de la entidad arriba indicada, con fecha ${dateStr}, la siguiente donación en especie con carácter IRREVOCABLE:\n\n` +
            `   • Producto: ${donation.quantity} unidades/kg (Descripción: Donación de Alimentos)\n` +
            `   • Valoración Económica Estimada: ${donation.value_eur || 'Consultar Albarán'} EUR\n` +
            `   • Destino: Fines de interés general propios de la entidad donataria.\n\n` +
            `Este documento acredita la donación a efectos de la deducción fiscal prevista en la Ley 49/2002, de 23 de diciembre, de régimen fiscal de las entidades sin fines lucrativos y de los incentivos fiscales al mecenazgo.`;

        doc.splitTextToSize(certText, pageWidth - 40).forEach((line: string) => {
            doc.text(line, 20, startY);
            startY += 7;
        });

        // 4. Signatures
        startY += 40;

        doc.line(20, startY, 80, startY); // Line for NGO
        doc.line(120, startY, 180, startY); // Line for Donor

        startY += 5;
        doc.setFontSize(8);
        doc.text(`P.O. ${donation.ngo}`, 30, startY);
        doc.text(`P.O. ${donor.name}`, 130, startY);

        // 5. Footer (Legal disclaimer)
        const footerY = doc.internal.pageSize.getHeight() - 20;
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(
            "Documento generado electrónicamente por Negentropy AI para el cumplimiento del Plan de Prevención de Pérdidas y Desperdicio Alimentario.",
            pageWidth / 2,
            footerY,
            { align: 'center' }
        );

        // 6. Save
        doc.save(`Certificado_Donacion_${donation.id}.pdf`);
    }
}

export const donationCertificateService = new DonationCertificateService();
