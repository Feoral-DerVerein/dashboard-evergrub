import { describe, it, expect, vi } from 'vitest';
import { FacturaEService } from '../services/facturaEService';
import { Invoice } from '../types/dashboard';

describe('FacturaEService', () => {
    const mockInvoice: Invoice = {
        id: 'inv-123',
        invoiceNumber: '2023-0001',
        date: new Date('2023-10-01T12:00:00Z'),
        totalAmount: 121,
        totalTaxAmount: 21,
        totalTaxableAmount: 100,
        currency: 'EUR',
        items: [
            {
                productId: 'p1',
                productName: 'Test Product',
                quantity: 1,
                unitPrice: 100,
                totalPrice: 100,
                taxRate: 21
            }
        ],
        taxDetails: [
            {
                taxRate: 21,
                taxBase: 100,
                taxAmount: 21
            }
        ],
        status: 'draft'
    };

    const sellerInfo = {
        taxId: 'B12345678',
        name: 'My Store SL',
        address: 'Calle Falsa 123',
        postCode: '28001',
        town: 'Madrid',
        province: 'Madrid'
    };

    const buyerInfo = {
        taxId: 'A87654321',
        name: 'Client Co',
        address: 'Avenida Principal 45',
        postCode: '08001',
        town: 'Barcelona',
        province: 'Barcelona'
    };

    it('should generate a valid XML structure with correct values', () => {
        const xml = FacturaEService.generateFacturaEXML(mockInvoice, sellerInfo, buyerInfo);

        expect(xml).toContain('<fe:Facturae');
        expect(xml).toContain('<TaxIdentificationNumber>B12345678</TaxIdentificationNumber>');
        expect(xml).toContain('<CorporateName>My Store SL</CorporateName>');
        expect(xml).toContain('<InvoiceNumber>2023-0001</InvoiceNumber>');
        expect(xml).toContain('<TotalInvoiceAmount>121.00</TotalInvoiceAmount>');
        expect(xml).toContain('<ItemDescription>Test Product</ItemDescription>');
    });

    it('should sign the invoice with a mock XAdES signature', async () => {
        const xml = FacturaEService.generateFacturaEXML(mockInvoice, sellerInfo, buyerInfo);
        const signature = await FacturaEService.signInvoice(xml);

        expect(signature).toMatch(/^XAdES-T-Signature-[a-f0-9]{64}$/);
    });

    it('should process the invoice for compliance correctly', async () => {
        const processed = await FacturaEService.processInvoiceForCompliance(mockInvoice, sellerInfo, buyerInfo);

        expect(processed.isFacturaEGenerated).toBe(true);
        expect(processed.status).toBe('issued');
        expect(processed.digitalSignature).toBeDefined();
        expect(processed.xmlSegment).toBeDefined();
    });
});
