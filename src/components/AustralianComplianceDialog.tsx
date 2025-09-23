import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, CheckCircle } from "lucide-react";

import { toast } from "sonner";

export const AustralianComplianceDialog = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      toast.info("This feature has been removed.");
      setIsOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("This feature is no longer available.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Australian Legal Compliance Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Australian Food Waste Legal Compliance Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Compliance Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">National Framework</h4>
                  <Badge variant="secondary" className="w-fit">
                    Food Waste Baseline & Reporting Framework (DCCEEW)
                  </Badge>
                  <Badge variant="secondary" className="w-fit">
                    National Food Waste Strategy
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">State Regulations</h4>
                  <Badge variant="secondary" className="w-fit">
                    NSW Waste Regulation 2026
                  </Badge>
                  <Badge variant="secondary" className="w-fit">
                    Environmental Protection Act
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Content Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">1. Entity Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Legal business name and ABN</li>
                    <li>• Physical address of reporting location</li>
                    <li>• Authorised representative details</li>
                    <li>• Reporting period specification</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">2. Food Waste Quantification</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Total waste generated (kg/tonnes)</li>
                    <li>• Waste classification by origin</li>
                    <li>• Destination analysis (landfill vs diverted)</li>
                    <li>• Performance metrics</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">3. Reduction & Diversion</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Percentage reduction calculations</li>
                    <li>• Landfill diversion percentage</li>
                    <li>• Donation & composting volumes</li>
                    <li>• Waste intensity per employee/revenue</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">4. Compliance Declaration</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Data collection methodology</li>
                    <li>• Waste management system description</li>
                    <li>• Partnership details (OzHarvest, etc.)</li>
                    <li>• Legal compliance statement</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Metrics Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">246kg</div>
                  <div className="text-sm text-muted-foreground">Total Waste Diverted</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-muted-foreground">Waste Reduction</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                  <div className="text-sm text-muted-foreground">Landfill Diversion</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">0.5kg</div>
                  <div className="text-sm text-muted-foreground">Waste per Employee</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex-1 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? "Generating Report..." : "Generate & Download PDF Report"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Legal Notice:</strong> This report is generated based on data collected through WiseBite system and formatted to comply with Australian food waste reporting requirements. It includes all necessary metrics for compliance with DCCEEW Food Waste Baseline & Reporting Framework and state-level waste regulations. Always verify with your legal advisor for complete compliance assurance.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};