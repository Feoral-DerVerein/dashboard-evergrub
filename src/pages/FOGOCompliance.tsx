import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calculator, FileText, BarChart3, Download, AlertCircle } from 'lucide-react';
import { FOGOCalculator } from '@/components/fogo/FOGOCalculator';
import { WasteDashboard } from '@/components/fogo/WasteDashboard';
import { ReportGenerator } from '@/components/fogo/ReportGenerator';
import { ExportTools } from '@/components/fogo/ExportTools';

const FOGOCompliance = () => {
  const [activeTab, setActiveTab] = useState('calculator');

  const officialLinks = [
    {
      title: "Official FOGO Calculator",
      url: "https://bintrim.epa.nsw.gov.au/fogocalculator",
      description: "Official EPA NSW tool"
    },
    {
      title: "Bin Trim Program",
      url: "https://www.epa.nsw.gov.au/your-environment/recycling-and-reuse/business-government-recycling/bin-trim",
      description: "Official program information"
    },
    {
      title: "Apply for Grant",
      url: "https://www.smartygrants.com.au/",
      description: "SmartyGrants Portal"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FOGO & Bin Trim</h1>
              <p className="text-gray-600">NSW Australia Compliance Module</p>
            </div>
          </div>
          
          {/* Disclaimer */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Legal Notice</p>
                  <p>This tool is for support only. For definitive information, always consult official EPA NSW sources and the Bin Trim program.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Official Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {officialLinks.map((link, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <FOGOCalculator />
          </TabsContent>

          <TabsContent value="dashboard">
            <WasteDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <ReportGenerator />
          </TabsContent>

          <TabsContent value="export">
            <ExportTools />
          </TabsContent>
        </Tabs>

        {/* Contact Information */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <h3 className="font-medium text-blue-900 mb-2">Need help?</h3>
              <p className="text-sm text-blue-800 mb-3">
                For inquiries about the FOGO program, contact EPA NSW directly
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = 'mailto:organics.grants@epa.nsw.gov.au'}
              >
                organics.grants@epa.nsw.gov.au
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FOGOCompliance;