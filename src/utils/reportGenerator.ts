
import { salesService } from "@/services/salesService";
import * as orderService from "@/services/orderService";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Define the type for autoTable
interface AutoTableOptions {
  head: any[][];
  body: any[][];
  startY?: number;
  theme?: string;
  // Add other options as needed
}

// We need to properly augment jsPDF to avoid type conflicts
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

export type TimeFilterPeriod = "Today" | "Week" | "Month" | "Quarter" | "Year";

// Interface for KPI data
interface KpiReportData {
  totalSales: number;
  transactionCount: number;
  co2Saved: string;
  wasteReduced: string;
  conversionRate: string;
  returnRate: string;
  expiringItems: {
    name: string;
    expires: string;
    quantity: string;
  }[];
  salesPerformance: {
    day: string;
    value: number;
  }[];
  period: TimeFilterPeriod;
}

// Function to generate mock KPI data (will be replaced with real data later)
const generateMockKpiData = (period: TimeFilterPeriod): KpiReportData => {
  return {
    totalSales: 2458,
    transactionCount: 186,
    co2Saved: "246 kg",
    wasteReduced: "85%",
    conversionRate: "24.8%",
    returnRate: "6.8%",
    expiringItems: [
      { name: "Fresh Vegetables", expires: "2 days", quantity: "5 kg" },
      { name: "Dairy Products", expires: "3 days", quantity: "8 units" },
      { name: "Baked Goods", expires: "1 day", quantity: "12 pieces" },
    ],
    salesPerformance: [
      { day: "Mon", value: 2500 },
      { day: "Tue", value: 1500 },
      { day: "Wed", value: 3500 },
      { day: "Thu", value: 4000 },
      { day: "Fri", value: 4500 },
      { day: "Sat", value: 4000 },
      { day: "Sun", value: 4200 },
    ],
    period
  };
};

// Get real data from services when possible
export const getKpiReportData = async (period: TimeFilterPeriod): Promise<KpiReportData> => {
  try {
    // Get sales data
    const sales = await salesService.getSales();
    
    // Get real transaction count, this is just for the report
    const { count: monthlySalesCount, total: monthlySalesTotal } = await salesService.getMonthlySales();
    const { count: todaySalesCount, total: todaySalesTotal } = await salesService.getTodaySales();
    
    // Filter based on period
    // For now, just use the mock data structure but with real numbers where possible
    const reportData: KpiReportData = {
      totalSales: monthlySalesTotal || 0,
      transactionCount: sales.length || 0,
      co2Saved: "246 kg", // Placeholder for now
      wasteReduced: "85%", // Placeholder for now
      conversionRate: "24.8%", // Placeholder for now 
      returnRate: "6.8%", // Placeholder for now
      expiringItems: [
        { name: "Fresh Vegetables", expires: "2 days", quantity: "5 kg" },
        { name: "Dairy Products", expires: "3 days", quantity: "8 units" },
        { name: "Baked Goods", expires: "1 day", quantity: "12 pieces" },
      ],
      salesPerformance: [
        { day: "Mon", value: 2500 },
        { day: "Tue", value: 1500 },
        { day: "Wed", value: 3500 },
        { day: "Thu", value: 4000 },
        { day: "Fri", value: 4500 },
        { day: "Sat", value: 4000 },
        { day: "Sun", value: 4200 },
      ],
      period
    };
    
    return reportData;
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    // Fallback to mock data if we can't get real data
    return generateMockKpiData(period);
  }
};

// Function to generate and download PDF report
export const generateKpiReport = async (period: TimeFilterPeriod): Promise<void> => {
  const data = await getKpiReportData(period);
  
  // Create new PDF document
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString();
  
  // Add title and header
  doc.setFontSize(20);
  doc.text("KPI Report", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Period: ${data.period} | Generated: ${currentDate}`, 105, 22, { align: "center" });
  
  // Add KPI metrics section
  doc.setFontSize(16);
  doc.text("Key Performance Metrics", 14, 35);
  
  doc.setFontSize(11);
  doc.text(`Total Sales: $${data.totalSales}`, 14, 45);
  doc.text(`Transactions: ${data.transactionCount}`, 14, 52);
  doc.text(`CO₂ Saved: ${data.co2Saved}`, 14, 59);
  doc.text(`Waste Reduced: ${data.wasteReduced}`, 14, 66);
  doc.text(`Conversion Rate: ${data.conversionRate}`, 14, 73);
  doc.text(`Return Rate: ${data.returnRate}`, 14, 80);
  
  // Add expiring items section
  doc.setFontSize(16);
  doc.text("Expiring Soon", 14, 95);
  
  const expiringItemsTableData = data.expiringItems.map(item => [
    item.name, item.expires, item.quantity
  ]);
  
  // Use the autotable functionality from jspdf-autotable
  (doc as any).autoTable({
    head: [["Product", "Expires In", "Quantity"]],
    body: expiringItemsTableData,
    startY: 100,
    theme: "grid"
  });
  
  // Add sales performance section
  doc.setFontSize(16);
  doc.text("Sales Performance", 14, 150);
  
  const salesPerformanceTableData = data.salesPerformance.map(item => [
    item.day, `$${item.value}`
  ]);
  
  // Use the autotable functionality from jspdf-autotable
  (doc as any).autoTable({
    head: [["Day", "Sales Amount"]],
    body: salesPerformanceTableData,
    startY: 155,
    theme: "grid"
  });
  
  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      "Generated with Lovable Dashboard | Confidential Business Report",
      105,
      (doc as any).internal.pageSize.height - 10,
      { align: "center" }
    );
  }
  
  // Save the PDF
  doc.save(`KPI_Report_${data.period}_${currentDate.replace(/\//g, "-")}.pdf`);
};
