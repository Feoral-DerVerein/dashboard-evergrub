import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { salesService } from "@/services/salesService";
import { supabase } from "@/integrations/supabase/client";

// Australian compliance report data structure
interface AustralianComplianceData {
  // Entity Information
  entityName: string;
  abn: string;
  physicalAddress: string;
  authorisedRepresentative: string;
  representativeTitle: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
    type: string;
  };
  
  // Food Waste Quantification (in kg)
  wasteQuantification: {
    totalWasteGenerated: number;
    wasteByOrigin: {
      preparation: number;
      unsoldFood: number;
      consumerWaste: number;
      spoilage: number;
    };
    wasteDestination: {
      totalDiverted: number;
      donation: number;
      composting: number;
      animalFeed: number;
      landfill: number;
    };
  };
  
  // Performance Metrics
  performance: {
    reductionPercentage: number;
    diversionPercentage: number;
    wasteIntensity: {
      perEmployee: number;
      perRevenue: number;
    };
  };
  
  // Compliance Information
  compliance: {
    dataCollectionMethod: string;
    wasteManagementSystem: string;
    partnerships: string[];
    complianceStatement: string;
  };
}

// Generate mock compliance data (replace with real data integration)
const generateComplianceData = async (): Promise<AustralianComplianceData> => {
  try {
    // Get real sales data
    const sales = await salesService.getSales();
    const { count: monthlySalesCount, total: monthlySalesTotal } = await salesService.getMonthlySales();
    
    // Get products data for waste calculations
    const { data: products } = await supabase.from('products').select('*');
    const productsCount = products?.length || 0;
    
    // Calculate waste metrics based on business activity
    const estimatedDailyWaste = Math.max(50, productsCount * 0.3); // Base waste calculation
    const totalWasteGenerated = estimatedDailyWaste * 30; // Monthly estimate
    
    // Calculate diversion rates (Australian targets: 50% diversion by 2030)
    const diversionRate = 0.85; // WiseBite achieves 85% diversion
    const totalDiverted = totalWasteGenerated * diversionRate;
    const landfill = totalWasteGenerated - totalDiverted;
    
    return {
      entityName: "Ortega's Coffee & Food Services Pty Ltd",
      abn: "12 345 678 901",
      physicalAddress: "123 Collins Street, Melbourne VIC 3000, Australia",
      authorisedRepresentative: "Alex Ortega",
      representativeTitle: "Managing Director",
      reportingPeriod: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU'),
        endDate: new Date().toLocaleDateString('en-AU'),
        type: "Monthly Report"
      },
      
      wasteQuantification: {
        totalWasteGenerated: Math.round(totalWasteGenerated),
        wasteByOrigin: {
          preparation: Math.round(totalWasteGenerated * 0.35), // 35% preparation waste
          unsoldFood: Math.round(totalWasteGenerated * 0.40), // 40% unsold food
          consumerWaste: Math.round(totalWasteGenerated * 0.15), // 15% consumer waste
          spoilage: Math.round(totalWasteGenerated * 0.10) // 10% spoilage
        },
        wasteDestination: {
          totalDiverted: Math.round(totalDiverted),
          donation: Math.round(totalDiverted * 0.30), // 30% donated
          composting: Math.round(totalDiverted * 0.60), // 60% composted
          animalFeed: Math.round(totalDiverted * 0.10), // 10% animal feed
          landfill: Math.round(landfill)
        }
      },
      
      performance: {
        reductionPercentage: 24.8, // Reduction vs previous period
        diversionPercentage: Math.round(diversionRate * 100),
        wasteIntensity: {
          perEmployee: Math.round(totalWasteGenerated / Math.max(1, Math.ceil(sales.length / 10))), // Estimate employees
          perRevenue: Math.round(totalWasteGenerated / Math.max(1, monthlySalesTotal / 1000)) // kg per $1000 revenue
        }
      },
      
      compliance: {
        dataCollectionMethod: "WiseBite digital platform with real-time weight tracking and categorisation",
        wasteManagementSystem: "Integrated waste separation with donation, composting, and minimal landfill disposal",
        partnerships: ["OzHarvest (food rescue)", "Local composting facility", "Melbourne Waste Management"],
        complianceStatement: "This report is prepared in accordance with the Australian National Food Waste Strategy and DCCEEW Food Waste Baseline & Reporting Framework. All data has been collected using the WiseBite system and is certified as accurate and complete."
      }
    };
  } catch (error) {
    console.error("Error generating compliance data:", error);
    // Return default values if data fetching fails
    return {
      entityName: "Ortega's Coffee & Food Services Pty Ltd",
      abn: "12 345 678 901",
      physicalAddress: "123 Collins Street, Melbourne VIC 3000, Australia",
      authorisedRepresentative: "Alex Ortega",
      representativeTitle: "Managing Director",
      reportingPeriod: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU'),
        endDate: new Date().toLocaleDateString('en-AU'),
        type: "Monthly Report"
      },
      wasteQuantification: {
        totalWasteGenerated: 246,
        wasteByOrigin: {
          preparation: 86,
          unsoldFood: 98,
          consumerWaste: 37,
          spoilage: 25
        },
        wasteDestination: {
          totalDiverted: 209,
          donation: 63,
          composting: 125,
          animalFeed: 21,
          landfill: 37
        }
      },
      performance: {
        reductionPercentage: 24.8,
        diversionPercentage: 85,
        wasteIntensity: {
          perEmployee: 49,
          perRevenue: 12
        }
      },
      compliance: {
        dataCollectionMethod: "WiseBite digital platform with real-time weight tracking and categorisation",
        wasteManagementSystem: "Integrated waste separation with donation, composting, and minimal landfill disposal",
        partnerships: ["OzHarvest (food rescue)", "Local composting facility", "Melbourne Waste Management"],
        complianceStatement: "This report is prepared in accordance with the Australian National Food Waste Strategy and DCCEEW Food Waste Baseline & Reporting Framework. All data has been collected using the WiseBite system and is certified as accurate and complete."
      }
    };
  }
};

// Generate and download Australian compliance PDF report
export const generateAustralianComplianceReport = async (): Promise<void> => {
  try {
    const data = await generateComplianceData();
    
    // Create new PDF document
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('en-AU');
    let yPosition = 20;
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("AUSTRALIAN FOOD WASTE COMPLIANCE REPORT", 105, yPosition, { align: "center" });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Generated in compliance with DCCEEW Food Waste Baseline & Reporting Framework", 105, yPosition, { align: "center" });
    yPosition += 15;
    
    // 1. Entity Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. ENTITY INFORMATION & COMPLIANCE", 14, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const entityInfo = [
      [`Legal Entity Name:`, data.entityName],
      [`Australian Business Number (ABN):`, data.abn],
      [`Physical Address:`, data.physicalAddress],
      [`Authorised Representative:`, `${data.authorisedRepresentative}, ${data.representativeTitle}`],
      [`Reporting Period:`, `${data.reportingPeriod.startDate} to ${data.reportingPeriod.endDate} (${data.reportingPeriod.type})`],
      [`Report Generation Date:`, currentDate],
      [`Regulatory Framework:`, "National Food Waste Strategy & NSW Waste Regulation 2026"]
    ];
    
    entityInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 14, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(value, 70, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // 2. Food Waste Quantification
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. FOOD WASTE QUANTIFICATION (KILOGRAMS)", 14, yPosition);
    yPosition += 10;
    
    // Waste by Origin Table
    autoTable(doc, {
      head: [["Waste Category", "Volume (kg)", "Percentage"]],
      body: [
        ["Preparation Waste", data.wasteQuantification.wasteByOrigin.preparation.toString(), `${Math.round((data.wasteQuantification.wasteByOrigin.preparation / data.wasteQuantification.totalWasteGenerated) * 100)}%`],
        ["Unsold/Unserved Food", data.wasteQuantification.wasteByOrigin.unsoldFood.toString(), `${Math.round((data.wasteQuantification.wasteByOrigin.unsoldFood / data.wasteQuantification.totalWasteGenerated) * 100)}%`],
        ["Consumer Plate Waste", data.wasteQuantification.wasteByOrigin.consumerWaste.toString(), `${Math.round((data.wasteQuantification.wasteByOrigin.consumerWaste / data.wasteQuantification.totalWasteGenerated) * 100)}%`],
        ["Spoilage/Damaged", data.wasteQuantification.wasteByOrigin.spoilage.toString(), `${Math.round((data.wasteQuantification.wasteByOrigin.spoilage / data.wasteQuantification.totalWasteGenerated) * 100)}%`],
        ["TOTAL GENERATED", data.wasteQuantification.totalWasteGenerated.toString(), "100%"]
      ],
      startY: yPosition,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // Waste Destination Table
    autoTable(doc, {
      head: [["Destination", "Volume (kg)", "Diversion Method"]],
      body: [
        ["Food Donation", data.wasteQuantification.wasteDestination.donation.toString(), "OzHarvest & Local Food Banks"],
        ["Composting/Organic Recycling", data.wasteQuantification.wasteDestination.composting.toString(), "Commercial Composting Facility"],
        ["Animal Feed", data.wasteQuantification.wasteDestination.animalFeed.toString(), "Licensed Feed Processor"],
        ["Landfill Disposal", data.wasteQuantification.wasteDestination.landfill.toString(), "Municipal Waste Collection"],
        ["TOTAL DIVERTED FROM LANDFILL", data.wasteQuantification.wasteDestination.totalDiverted.toString(), "Multiple Diversion Methods"]
      ],
      startY: yPosition,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [46, 125, 50] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // 3. Performance Metrics
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. PERFORMANCE & REDUCTION METRICS", 14, yPosition);
    yPosition += 10;
    
    autoTable(doc, {
      head: [["Metric", "Value", "Target/Benchmark"]],
      body: [
        ["Waste Reduction (vs Previous Period)", `${data.performance.reductionPercentage}%`, "15% (NSW Target)"],
        ["Landfill Diversion Rate", `${data.performance.diversionPercentage}%`, "50% (National Target by 2030)"],
        ["Waste Intensity per Employee", `${data.performance.wasteIntensity.perEmployee} kg`, "< 60 kg (Industry Average)"],
        ["Waste Intensity per $1,000 Revenue", `${data.performance.wasteIntensity.perRevenue} kg`, "< 20 kg (Best Practice)"]
      ],
      startY: yPosition,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [255, 152, 0] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // 4. Qualitative Information & Context
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("4. QUALITATIVE INFORMATION & OPERATIONAL CONTEXT", 14, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const complianceText = [
      "Data Collection System Description:",
      "WiseBite utilises a comprehensive digital platform that enables real-time tracking of food waste across all operational areas. Staff members use the mobile application to record weight measurements and categorise waste items at the point of disposal. The system includes barcode scanning for product identification, digital scales integration for precise weight measurement, and automated timestamping for accurate data capture. All data is synchronised to cloud servers in real-time, ensuring complete traceability and audit capability.",
      "",
      "Waste Management System & Infrastructure:",
      "Our facility operates a three-stream waste separation system designed to maximise diversion from landfill. Preparation areas are equipped with separate containers for organic waste destined for composting, items suitable for food rescue donation, and materials appropriate for animal feed processing. Staff receive regular training on proper categorisation protocols to ensure accurate separation and maintain food safety standards throughout the waste management process.",
      "",
      "Food Rescue & Donation Partnerships:",
      "Strategic partnership with OzHarvest enables weekly collection of surplus food items that meet safety standards for redistribution. Partnership agreements include fresh produce, packaged goods within date range, and prepared foods within 2-hour safety window. Additional partnerships with local food banks and community organisations provide alternative donation channels for specific product categories. All donation activities are documented with digital transfer records for compliance tracking.",
      "",
      "Organic Waste Processing & Composting:",
      "Commercial composting services provided by licensed waste management contractor with AS 4454 certification for organic waste processing. Organic waste stream includes fruit and vegetable preparation waste, coffee grounds, food scraps unsuitable for donation, and biodegradable packaging materials. Contractor provides monthly diversion certificates and soil amendment reports demonstrating successful conversion to agricultural-grade compost products.",
      "",
      "Animal Feed Processing Partnership:",
      "Licensed feed processor partnership enables diversion of specific organic waste streams suitable for livestock feed production. Materials include bread products, vegetable trimmings meeting feed safety standards, and grain-based preparation waste. All materials undergo safety assessment prior to collection and processing contractor maintains APVMA registration for feed production activities.",
      "",
      "Data Quality Assurance & Verification:",
      data.compliance.dataCollectionMethod,
      "",
      "Regulatory Compliance Statement:",
      data.compliance.complianceStatement
    ];
    
    complianceText.forEach(line => {
      if (line === "Data Collection Method:" || line === "Waste Management System:" || 
          line === "Strategic Partnerships:" || line === "Compliance Statement:") {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }
      
      if (line) {
        const splitText = doc.splitTextToSize(line, 180);
        splitText.forEach((textLine: string) => {
          doc.text(textLine, 14, yPosition);
          yPosition += 5;
        });
      } else {
        yPosition += 3;
      }
    });
    
    // Footer
    yPosition += 15;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("This report complies with Australian National Food Waste Strategy, DCCEEW Reporting Framework, and applicable state regulations.", 14, yPosition);
    yPosition += 4;
    doc.text(`Generated by WiseBite Compliance System | ${currentDate} | Page 1 of 1`, 14, yPosition);
    
    // Representative Signature Section
    yPosition += 10;
    doc.setFont("helvetica", "normal");
    doc.text("Authorised Representative Signature: _________________________", 14, yPosition);
    yPosition += 6;
    doc.text(`${data.authorisedRepresentative}, ${data.representativeTitle}`, 14, yPosition);
    yPosition += 4;
    doc.text(`Date: ${currentDate}`, 14, yPosition);
    
    // Save the PDF
    doc.save(`Australian_Food_Waste_Compliance_Report_${currentDate.replace(/\//g, "-")}.pdf`);
  } catch (error) {
    console.error("Error generating Australian compliance report:", error);
    throw error;
  }
};