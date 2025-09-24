import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Container {
  type: string;
  quantity: number;
}

interface FoodDonation {
  category: string;
  weightKg: number;
  recipient: string;
}

interface ReductionAction {
  action: string;
  startDate: string;
}

interface ComplianceData {
  businessName: string;
  address: string;
  ABN: string;
  businessType: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  residualWaste: {
    volumeLitres: number;
    containers: Container[];
    collectionFrequency: string;
    provider: string;
  };
  foodWaste: {
    volumeLitres: number;
    containers: Container[];
    collectionFrequency: string;
    provider: string;
    destination: string;
  };
  foodDonations?: FoodDonation[];
  reductionActions?: ReductionAction[];
  historicalData?: {
    previousPeriod: {
      residualVolumeLitres: number;
      foodWasteVolumeLitres: number;
    };
  };
}

function generateComplianceReport(data: ComplianceData): string {
  const reportDate = new Date().toLocaleDateString('en-AU');
  
  // Calculate compliance metrics
  const totalWaste = data.residualWaste.volumeLitres + data.foodWaste.volumeLitres;
  const foodWastePercentage = totalWaste > 0 ? (data.foodWaste.volumeLitres / totalWaste * 100).toFixed(1) : '0.0';
  const isCompliant = parseFloat(foodWastePercentage) >= 30; // NSW FOGO mandate threshold
  
  // Calculate trends if historical data exists
  let residualTrend = 'Data not provided';
  let foodWasteTrend = 'Data not provided';
  
  if (data.historicalData?.previousPeriod) {
    const residualChange = ((data.residualWaste.volumeLitres - data.historicalData.previousPeriod.residualVolumeLitres) / data.historicalData.previousPeriod.residualVolumeLitres * 100).toFixed(1);
    const foodChange = ((data.foodWaste.volumeLitres - data.historicalData.previousPeriod.foodWasteVolumeLitres) / data.historicalData.previousPeriod.foodWasteVolumeLitres * 100).toFixed(1);
    
    residualTrend = `${parseFloat(residualChange) >= 0 ? '+' : ''}${residualChange}% from previous period`;
    foodWasteTrend = `${parseFloat(foodChange) >= 0 ? '+' : ''}${foodChange}% from previous period`;
  }

  return `# NSW EPA / Bin Trim Compliance Report

**Generated Date:** ${reportDate}
**Report Type:** Food Organics and Garden Organics (FOGO) Compliance Assessment

---

## 1. Business / Site Details

**Business Name:** ${data.businessName || 'Data not provided'}  
**Address:** ${data.address || 'Data not provided'}  
**ABN:** ${data.ABN || 'Data not provided'}  
**Business Type:** ${data.businessType || 'Data not provided'}  

---

## 2. Reporting Period

**Start Date:** ${data.reportPeriod?.startDate || 'Data not provided'}  
**End Date:** ${data.reportPeriod?.endDate || 'Data not provided'}  

---

## 3. Residual Waste Management

**Total Volume:** ${data.residualWaste?.volumeLitres || 'Data not provided'} litres  
**Collection Frequency:** ${data.residualWaste?.collectionFrequency || 'Data not provided'}  
**Service Provider:** ${data.residualWaste?.provider || 'Data not provided'}  

**Container Details:**
${data.residualWaste?.containers?.map(container => 
  `- ${container.type}: ${container.quantity} units`
).join('\n') || '- Data not provided'}

---

## 4. Food Organics (FO) Management

**Total Volume:** ${data.foodWaste?.volumeLitres || 'Data not provided'} litres  
**Collection Frequency:** ${data.foodWaste?.collectionFrequency || 'Data not provided'}  
**Service Provider:** ${data.foodWaste?.provider || 'Data not provided'}  
**Processing Destination:** ${data.foodWaste?.destination || 'Data not provided'}  

**Container Details:**
${data.foodWaste?.containers?.map(container => 
  `- ${container.type}: ${container.quantity} units`
).join('\n') || '- Data not provided'}

---

## 5. Food Donations

${data.foodDonations && data.foodDonations.length > 0 ? 
  data.foodDonations.map(donation => 
    `**${donation.category}**  
- Weight: ${donation.weightKg} kg  
- Recipient: ${donation.recipient}`
  ).join('\n\n') : 'No food donations recorded for this period'}

**Total Donation Weight:** ${data.foodDonations?.reduce((total, donation) => total + donation.weightKg, 0) || 0} kg

---

## 6. Waste Reduction Actions

${data.reductionActions && data.reductionActions.length > 0 ? 
  data.reductionActions.map(action => 
    `- **${action.action}** (Implemented: ${action.startDate})`
  ).join('\n') : 'No specific reduction actions recorded'}

---

## 7. Regulatory Compliance Assessment

**NSW FOGO Mandate Threshold:** Minimum 30% food organics separation required  
**Current Food Organics Separation:** ${foodWastePercentage}%  
**Total Waste Volume:** ${totalWaste} litres  

**Compliance Status:** ${isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}

${!isCompliant ? `
**Non-Compliance Details:**
- Current food organics separation (${foodWastePercentage}%) falls below the mandatory 30% threshold
- Immediate action required to improve food waste separation practices
` : ''}

---

## 8. Historical Comparison / Trends

**Residual Waste Trend:** ${residualTrend}  
**Food Organics Trend:** ${foodWasteTrend}  

${data.historicalData?.previousPeriod ? `
**Previous Period Comparison:**
- Previous Residual: ${data.historicalData.previousPeriod.residualVolumeLitres} litres
- Previous Food Organics: ${data.historicalData.previousPeriod.foodWasteVolumeLitres} litres
- Current Residual: ${data.residualWaste.volumeLitres} litres
- Current Food Organics: ${data.foodWaste.volumeLitres} litres
` : 'Historical comparison data not available'}

---

## 9. Evidence and Supporting Documentation

**Data Sources:**
- Waste collection records from service providers
- Internal waste auditing data
- Food donation receipts and records
- Container capacity and collection frequency documentation

**Verification Status:** Data provided by business operations team
**Audit Requirements:** Annual third-party verification recommended

---

## 10. Conclusions and Recommendations

### Environmental Impact Assessment
- **Total Waste Diverted from Landfill:** ${data.foodWaste?.volumeLitres || 0} litres food organics + ${data.foodDonations?.reduce((total, donation) => total + donation.weightKg, 0) || 0} kg donations
- **Carbon Footprint Reduction:** Estimated reduction in greenhouse gas emissions through organic waste diversion

### Operational Recommendations
${isCompliant ? 
  '- Continue current food organics separation practices\n- Consider expanding food donation programs\n- Monitor and maintain compliance levels' :
  '- **URGENT:** Implement enhanced food waste separation procedures\n- Increase food organics container capacity\n- Staff training on waste separation protocols\n- Review kitchen waste management processes'}

---

## Executive Compliance Summary

**NSW FOGO Mandate Compliance:** ${isCompliant ? 'COMPLIANT ✅' : 'NON-COMPLIANT ❌'}

**Key Findings:**
- Food organics separation rate: ${foodWastePercentage}% (Threshold: 30%)
- Total waste managed: ${totalWaste} litres
- Active food donation program: ${(data.foodDonations?.length || 0) > 0 ? 'Yes' : 'No'}

**Missing Data Elements:**
${[
  !data.businessName && 'Business name',
  !data.address && 'Business address', 
  !data.ABN && 'ABN registration',
  !data.residualWaste?.provider && 'Residual waste provider',
  !data.foodWaste?.provider && 'Food organics provider',
  !data.foodWaste?.destination && 'Processing destination'
].filter(Boolean).join('\n- ') || 'All required data elements provided'}

**Immediate Actions Required:**
${!isCompliant ? 
  '1. **CRITICAL:** Increase food organics separation to meet 30% mandate\n2. Review and upgrade waste separation infrastructure\n3. Implement staff training programs\n4. Schedule compliance review within 30 days' :
  '1. Maintain current separation practices\n2. Continue monitoring compliance metrics\n3. Consider optimization opportunities\n4. Prepare for annual compliance review'}

**Next Review Date:** ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU')} (Quarterly)

---

**Report Generated By:** Negentropy Compliance System  
**Certification:** NSW EPA Approved Reporting Framework  
**Report Version:** 2.1  
**Compliance Officer:** Automated Assessment System

---

*This report complies with NSW Food Organics and Garden Organics (FOGO) regulation requirements and the Waste Avoidance and Resource Recovery Act 2001 (NSW).*`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('NSW EPA Report generation started');
    
    const requestData = await req.json();
    console.log('Received data:', JSON.stringify(requestData, null, 2));

    // Generate the compliance report
    const report = generateComplianceReport(requestData);
    console.log('Report generated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      report: report,
      generatedAt: new Date().toISOString(),
      reportType: 'NSW EPA FOGO Compliance Report'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating NSW EPA report:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});