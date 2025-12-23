import { Invoice, TaxItem } from "@/types/dashboard";

export class FacturaEService {
    /**
     * Generate a FacturaE XML segment for a given invoice
     * This is a simplified version for demonstration and compliance auditing.
     */
    static generateFacturaEXML(invoice: Invoice, sellerInfo: any, buyerInfo: any): string {
        const timestamp = new Date().toISOString();

        // Basic FacturaE structure (Simplified)
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<fe:Facturae xmlns:fe="http://www.facturae.gob.es/formato/versiones/facturaev3_2_2.xsd">
  <FileHeader>
    <SchemaVersion>3.2.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
  </FileHeader>
  <Parties>
    <SellerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${sellerInfo.taxId}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${sellerInfo.name}</CorporateName>
        <AddressInSpain>
          <Address>${sellerInfo.address}</Address>
          <PostCode>${sellerInfo.postCode}</PostCode>
          <Town>${sellerInfo.town}</Town>
          <Province>${sellerInfo.province}</Province>
          <CountryCode>ESP</CountryCode>
        </AddressInSpain>
      </LegalEntity>
    </SellerParty>
    <BuyerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${buyerInfo.taxId}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${buyerInfo.name}</CorporateName>
        <AddressInSpain>
          <Address>${buyerInfo.address}</Address>
          <PostCode>${buyerInfo.postCode}</PostCode>
          <Town>${buyerInfo.town}</Town>
          <Province>${buyerInfo.province}</Province>
          <CountryCode>ESP</CountryCode>
        </AddressInSpain>
      </LegalEntity>
    </BuyerParty>
  </Parties>
  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${invoice.invoiceNumber}</InvoiceNumber>
        <InvoiceSeriesCode>F</InvoiceSeriesCode>
        <InvoiceDocumentType>FC</InvoiceDocumentType>
        <InvoiceClass>OO</InvoiceClass>
      </InvoiceHeader>
      <InvoiceIssueData>
        <IssueDate>${invoice.date.toISOString().split('T')[0]}</IssueDate>
        <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
        <TaxCurrencyCode>EUR</TaxCurrencyCode>
      </InvoiceIssueData>
      <TaxesOutputs>
        ${invoice.taxDetails.map(tax => `
        <Tax>
          <TaxTypeCode>01</TaxTypeCode>
          <TaxRate>${tax.taxRate}</TaxRate>
          <TaxableBase>
            <TotalAmount>${tax.taxBase.toFixed(2)}</TotalAmount>
          </TaxableBase>
          <TaxAmount>
            <TotalAmount>${tax.taxAmount.toFixed(2)}</TotalAmount>
          </TaxAmount>
        </Tax>`).join('')}
      </TaxesOutputs>
      <InvoiceTotals>
        <TotalGrossAmount>${invoice.totalTaxableAmount.toFixed(2)}</TotalGrossAmount>
        <TotalTaxOutputs>${invoice.totalTaxAmount.toFixed(2)}</TotalTaxOutputs>
        <TotalInvoiceAmount>${invoice.totalAmount.toFixed(2)}</TotalInvoiceAmount>
      </InvoiceTotals>
      <Items>
        ${invoice.items.map(item => `
        <InvoiceLine>
          <ItemDescription>${item.productName}</ItemDescription>
          <Quantity>${item.quantity}</Quantity>
          <UnitOfMeasure>01</UnitOfMeasure>
          <UnitPriceWithoutTax>${item.unitPrice.toFixed(2)}</UnitPriceWithoutTax>
          <TotalCost>${item.totalPrice.toFixed(2)}</TotalCost>
          <TaxesOutputs>
            <Tax>
              <TaxTypeCode>01</TaxTypeCode>
              <TaxRate>${item.taxRate || 21}</TaxRate>
              <TaxableBase>
                <TotalAmount>${item.totalPrice.toFixed(2)}</TotalAmount>
              </TaxableBase>
              <TaxAmount>
                <TotalAmount>${((item.totalPrice * (item.taxRate || 21)) / 100).toFixed(2)}</TotalAmount>
              </TaxAmount>
            </Tax>
          </TaxesOutputs>
        </InvoiceLine>`).join('')}
      </Items>
    </Invoice>
  </Invoices>
</fe:Facturae>`;

        return xml;
    }

    /**
     * Simulate a digital signature (XAdES format is required for real FacturaE)
     * For this prototype, we generate a SHA-256 hash representative of the signature.
     */
    static async signInvoice(xmlContent: string): Promise<string> {
        // In a real environment, this would use a digital certificate and the WebCrypto API
        const encoder = new TextEncoder();
        const data = encoder.encode(xmlContent);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return `XAdES-T-Signature-${hashHex}`;
    }

    /**
     * High-level method to process an invoice for Spanish compliance
     */
    static async processInvoiceForCompliance(invoice: Invoice, sellerInfo: any, buyerInfo: any): Promise<Invoice> {
        const xml = this.generateFacturaEXML(invoice, sellerInfo, buyerInfo);
        const signature = await this.signInvoice(xml);

        return {
            ...invoice,
            isFacturaEGenerated: true,
            xmlSegment: xml,
            digitalSignature: signature,
            status: 'issued'
        };
    }
}
