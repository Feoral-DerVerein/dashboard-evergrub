import { POSItem } from "@/types/dashboard";

export interface AccountingEntry {
    date: string;
    account: string;
    description: string;
    debit: number;
    credit: number;
    taxRate: number;
    taxAmount: number;
}

export class AccountingExportService {
    /**
     * Export sales data to A3 compatible CSV format
     */
    static exportToA3(entries: AccountingEntry[]): string {
        const header = "Fecha,Cuenta,Concepto,Debe,Haber,IVA_Cuota,IVA_Base";
        const rows = entries.map(e =>
            `${e.date},${e.account},${e.description},${e.debit.toFixed(2)},${e.credit.toFixed(2)},${e.taxAmount.toFixed(2)},${(e.debit || e.credit).toFixed(2)}`
        );

        return [header, ...rows].join("\n");
    }

    /**
     * Export sales data to Contasol compatible CSV format
     */
    static exportToContasol(entries: AccountingEntry[]): string {
        const header = "Diario;Fecha;Cuenta;Concepto;Debe;Haber;IVA;Recargo";
        const rows = entries.map((e, index) =>
            `1;${e.date};${e.account};${e.description};${e.debit.toFixed(2)};${e.credit.toFixed(2)};${e.taxRate};0`
        );

        return [header, ...rows].join("\r\n");
    }

    /**
     * Helper to prepare entries from sales data
     */
    static prepareEntriesFromSales(sales: any[]): AccountingEntry[] {
        return sales.map(sale => ({
            date: new Date(sale.timestamp?.seconds * 1000 || Date.now()).toLocaleDateString('es-ES'),
            account: "700.0000", // Standard sales account for Spain
            description: `Venta Tpv: ${sale.transactionId || 'N/A'}`,
            debit: 0,
            credit: sale.totalAmount || 0,
            taxRate: 21,
            taxAmount: (sale.totalAmount || 0) * 0.21 / 1.21 // Extract tax from total
        }));
    }

    /**
     * Trigger a file download in the browser
     */
    static downloadCSV(content: string, filename: string): void {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
