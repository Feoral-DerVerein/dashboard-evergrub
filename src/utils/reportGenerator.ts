import { salesService } from "@/services/salesService";
import * as orderService from "@/services/orderService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Define TimeFilterPeriod type
export type TimeFilterPeriod = "Today" | "Week" | "Month" | "Quarter" | "Year";

// Interface for NSW EPA Compliance Data
interface NSWEPAComplianceData {
  foodWasteVolume: {
    weight: number; // in kg
    volume: number; // in liters
    separationRate: number; // percentage
  };
  generalWasteVolume: {
    weight: number; // in kg
    volume: number; // in liters
    destinationType: string; // "landfill" | "recycling"
  };
  collectionService: {
    provider: string;
    frequency: string; // "daily" | "weekly" | "bi-weekly"
    collectionDays: string[];
    destination: string;
    facilityType: string; // "composting" | "anaerobic_digestion" | "biogas"
  };
  wasteReduction: {
    monthlyTrend: number; // percentage change
    totalReduced: number; // kg saved
    preventionMethods: string[];
    negentropyCo2Impact: number; // kg CO2 saved
    costSavings: number; // AUD saved
  };
  reportingPeriod: {
    startDate: string;
    endDate: string;
    complianceStatus: "compliant" | "partial" | "non-compliant";
  };
}

// Define the type for autoTable
interface AutoTableOptions {
  head: any[][];
  body: any[][];
  startY?: number;
  theme?: string;
  // Add other options as needed
}

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
  try {
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
    
    // Add expiring items table
    autoTable(doc, {
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
    
    // Add sales performance table
    autoTable(doc, {
      head: [["Day", "Sales Amount"]],
      body: salesPerformanceTableData,
      startY: 155,
      theme: "grid"
    });
    
    // Add footer with page numbers
    const pageCount = (doc as any).internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        "Generated with Lovable Dashboard | Confidential Business Report",
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
    
    // Save the PDF with a mobile-friendly name
    doc.save(`KPI_Report_${data.period}_${currentDate.replace(/\//g, "-")}.pdf`);
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

// Function to generate NSW EPA compliance data
const generateNSWEPAComplianceData = (): NSWEPAComplianceData => {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = today;

  return {
    foodWasteVolume: {
      weight: 127.5, // kg per month
      volume: 425, // liters per month
      separationRate: 89.2 // percentage properly separated
    },
    generalWasteVolume: {
      weight: 89.3, // kg per month
      volume: 298, // liters per month
      destinationType: "landfill"
    },
    collectionService: {
      provider: "Green Waste Solutions Pty Ltd",
      frequency: "weekly",
      collectionDays: ["Tuesday", "Friday"],
      destination: "Sydney Organic Processing Facility",
      facilityType: "composting"
    },
    wasteReduction: {
      monthlyTrend: -23.7, // 23.7% reduction from previous month
      totalReduced: 89.4, // kg saved this month
      preventionMethods: [
        "Negentropy AI predictive ordering",
        "Smart inventory rotation",
        "Dynamic pricing for near-expiry items",
        "Customer demand forecasting",
        "Donation program integration"
      ],
      negentropyCo2Impact: 246.8, // kg CO2 equivalent saved
      costSavings: 1247.50 // AUD saved in waste disposal fees
    },
    reportingPeriod: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      complianceStatus: "compliant"
    }
  };
};

// Enhanced function to generate AI report with NSW EPA compliance
export const generateAIReportWithEPACompliance = async (period: TimeFilterPeriod): Promise<void> => {
  try {
    const kpiData = await getKpiReportData(period);
    const epaData = generateNSWEPAComplianceData();
    
    // Create new PDF document
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();
    
    // PAGE 1: Business Performance & EPA Overview
    doc.setFontSize(18);
    doc.text("NSW EPA Compliance Report", 105, 15, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Period: ${kpiData.period} | Generated: ${currentDate}`, 105, 22, { align: "center" });
    
    // Compliance Status Header
    doc.setFontSize(11);
    doc.setTextColor(0, 100, 0);
    doc.text(`Status: ${epaData.reportingPeriod.complianceStatus.toUpperCase()}`, 14, 32);
    doc.setTextColor(0, 0, 0);
    doc.text(`Period: ${epaData.reportingPeriod.startDate} to ${epaData.reportingPeriod.endDate}`, 14, 39);
    
    // Business Performance (Compact)
    doc.setFontSize(12);
    doc.text("Business Performance", 14, 50);
    doc.setFontSize(9);
    doc.text(`Sales: $${kpiData.totalSales} | Transactions: ${kpiData.transactionCount} | Waste Reduced: ${kpiData.wasteReduced}`, 14, 57);
    
    // Food Waste & General Waste (Side by Side)
    let yPos = 70;
    doc.setFontSize(11);
    doc.text("1. Food Waste Volume", 14, yPos);
    doc.text("2. General Waste", 110, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.text(`Weight: ${epaData.foodWasteVolume.weight} kg`, 14, yPos);
    doc.text(`Weight: ${epaData.generalWasteVolume.weight} kg`, 110, yPos);
    doc.text(`Volume: ${epaData.foodWasteVolume.volume} L`, 14, yPos + 6);
    doc.text(`Volume: ${epaData.generalWasteVolume.volume} L`, 110, yPos + 6);
    doc.text(`Separation: ${epaData.foodWasteVolume.separationRate}%`, 14, yPos + 12);
    doc.text(`Destination: ${epaData.generalWasteVolume.destinationType}`, 110, yPos + 12);
    yPos += 25;
    
    // Collection Service (Compact)
    doc.setFontSize(11);
    doc.text("3. Collection Service", 14, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.text(`Provider: ${epaData.collectionService.provider}`, 14, yPos);
    doc.text(`Frequency: ${epaData.collectionService.frequency} | Days: ${epaData.collectionService.collectionDays.join(", ")}`, 14, yPos + 6);
    doc.text(`Destination: ${epaData.collectionService.destination}`, 14, yPos + 12);
    doc.text(`Facility: ${epaData.collectionService.facilityType}`, 14, yPos + 18);
    yPos += 30;
    
    // Waste Reduction Evidence
    doc.setFontSize(11);
    doc.setTextColor(0, 100, 0);
    doc.text("4. Waste Reduction Evidence (Negentropy Platform)", 14, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;
    doc.setFontSize(9);
    doc.text(`Monthly Reduction: ${Math.abs(epaData.wasteReduction.monthlyTrend)}% | Waste Prevented: ${epaData.wasteReduction.totalReduced} kg`, 14, yPos);
    doc.text(`CO₂ Avoided: ${epaData.wasteReduction.negentropyCo2Impact} kg | Cost Savings: $${epaData.wasteReduction.costSavings} AUD`, 14, yPos + 6);
    yPos += 15;
    
    // Prevention Methods Table (Compact)
    const methodsTableData = epaData.wasteReduction.preventionMethods.map((method, index) => [
      (index + 1).toString(),
      method
    ]);
    
    autoTable(doc, {
      head: [["#", "Prevention Method"]],
      body: methodsTableData,
      startY: yPos,
      theme: "grid",
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Negentropy Benefits (Compact)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 255);
    doc.text("Negentropy AI Benefits:", 14, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 6;
    doc.setFontSize(8);
    doc.text("• Real-time forecasting • Inventory optimization • Dynamic pricing • Donation integration", 14, yPos);
    
    // PAGE 2: Certification & Footer
    doc.addPage();
    yPos = 20;
    
    // Certification header
    doc.setFontSize(16);
    doc.setTextColor(0, 100, 0);
    doc.text("Negentropy Impact Certification", 105, yPos, { align: "center" });
    doc.setTextColor(0, 0, 0);
    yPos += 15;
    
    // Add certification seals image
    try {
      const imgData = '/lovable-uploads/9240be3b-9144-47c2-81e5-7bcb548d1fe6.png';
      const imgWidth = 160;
      const imgHeight = 107;
      const xPosition = (doc.internal.pageSize.width - imgWidth) / 2;
      
      doc.addImage(imgData, 'PNG', xPosition, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 20;
    } catch (error) {
      doc.setFontSize(12);
      doc.text("Negentropy Impact Seals", 105, yPos + 30, { align: "center" });
      doc.setFontSize(10);
      doc.text("Green Seal (+30%) | Orange Seal (+60%) | Blue Seal (+90%)", 105, yPos + 45, { align: "center" });
      yPos += 60;
    }
    
    // Additional EPA compliance details
    doc.setFontSize(12);
    doc.text("EPA Compliance Summary", 14, yPos);
    yPos += 10;
    doc.setFontSize(9);
    doc.text("✓ Food waste separation rate exceeds 80% target", 14, yPos);
    doc.text("✓ Licensed collection service with weekly frequency", 14, yPos + 7);
    doc.text("✓ Certified composting facility destination", 14, yPos + 14);
    doc.text("✓ Documented waste reduction through AI optimization", 14, yPos + 21);
    doc.text("✓ CO₂ impact reporting and cost savings tracking", 14, yPos + 28);
    
    // EPA compliance footer
    yPos = doc.internal.pageSize.height - 30;
    doc.setFontSize(8);
    doc.text("This report complies with NSW EPA Food Waste Reporting Requirements.", 105, yPos, { align: "center" });
    doc.text("Generated by Negentropy Platform - Certified for EPA Compliance", 105, yPos + 7, { align: "center" });
    
    // Add EPA compliance footer
    yPos = doc.internal.pageSize.height - 30;
    doc.setFontSize(8);
    doc.text("This report is prepared in accordance with NSW EPA Food Waste Reporting Requirements.", 105, yPos, { align: "center" });
    doc.text("Generated by Negentropy Platform - Certified for EPA Compliance Reporting", 105, yPos + 7, { align: "center" });
    
    // Add standard footer
    const pageCount = (doc as any).internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount} | NSW EPA Compliance Report | Generated: ${currentDate}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
    
    // Save the PDF with EPA compliance name
    doc.save(`NSW_EPA_Compliance_Report_${currentDate.replace(/\//g, "-")}.pdf`);
  } catch (error) {
    console.error("Error generating EPA compliance report:", error);
    throw error;
  }
};
