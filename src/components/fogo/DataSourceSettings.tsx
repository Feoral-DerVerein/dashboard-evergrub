import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Database, Shield, Clock, FileText, Info, CheckCircle } from 'lucide-react';

const DataSourceSettings = () => {
  const [settings, setSettings] = useState({
    automaticWastePrediction: true,
    syncInventoryData: true,
    trackExpiryDates: false,
    predictionAccuracy: [85],
    autoGenerateReports: true,
    weeklyBinTrimData: true,
    reportGenerationDate: '1',
    emailNotifications: true,
    dataRetention: '12',
    anonymizeData: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const syncFrequencyOptions = [
    { value: '15', label: 'Every 15 minutes' },
    { value: '30', label: 'Every 30 minutes' },
    { value: '60', label: 'Every hour' },
    { value: '240', label: 'Every 4 hours' },
    { value: '1440', label: 'Daily' }
  ];

  const reportDays = [
    { value: '1', label: '1st of month' },
    { value: '15', label: '15th of month' },
    { value: '28', label: 'Last day of month' }
  ];

  const dataRetentionOptions = [
    { value: '6', label: '6 months' },
    { value: '12', label: '12 months' },
    { value: '24', label: '24 months' },
    { value: '36', label: '36 months' }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Data Source Configuration
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Advanced Settings
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure data collection, processing, and automation preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* POS Integration Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              POS Integration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">Enable automatic waste prediction</p>
                    <p className="text-sm text-gray-600">Use sales data to predict organic waste volumes</p>
                  </div>
                  <Switch 
                    checked={settings.automaticWastePrediction}
                    onCheckedChange={(value) => updateSetting('automaticWastePrediction', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">Sync inventory data</p>
                    <p className="text-sm text-gray-600">Include stock levels in waste calculations</p>
                  </div>
                  <Switch 
                    checked={settings.syncInventoryData}
                    onCheckedChange={(value) => updateSetting('syncInventoryData', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">Track product expiry dates</p>
                    <p className="text-sm text-gray-600">Monitor products approaching expiration</p>
                  </div>
                  <Switch 
                    checked={settings.trackExpiryDates}
                    onCheckedChange={(value) => updateSetting('trackExpiryDates', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-white rounded-lg border">
                  <label className="block text-sm font-medium mb-3">
                    Prediction accuracy threshold: {settings.predictionAccuracy[0]}%
                  </label>
                  <Slider
                    value={settings.predictionAccuracy}
                    onValueChange={(value) => updateSetting('predictionAccuracy', value)}
                    min={70}
                    max={95}
                    step={5}
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-600">
                    Higher values may reduce prediction frequency but increase accuracy
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border">
                  <label className="block text-sm font-medium mb-2">Data sync frequency</label>
                  <Select value="60" onValueChange={() => {}}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {syncFrequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Reporting Automation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Reporting Automation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">Auto-generate monthly EPA reports</p>
                    <p className="text-sm text-gray-600">Automatically compile and format EPA submissions</p>
                  </div>
                  <Switch 
                    checked={settings.autoGenerateReports}
                    onCheckedChange={(value) => updateSetting('autoGenerateReports', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">Send Bin Trim data weekly</p>
                    <p className="text-sm text-gray-600">Weekly waste data submissions to Bin Trim program</p>
                  </div>
                  <Switch 
                    checked={settings.weeklyBinTrimData}
                    onCheckedChange={(value) => updateSetting('weeklyBinTrimData', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-sm text-gray-600">Receive alerts and report confirmations</p>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(value) => updateSetting('emailNotifications', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-white rounded-lg border">
                  <label className="block text-sm font-medium mb-2">Report generation date</label>
                  <Select 
                    value={settings.reportGenerationDate} 
                    onValueChange={(value) => updateSetting('reportGenerationDate', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportDays.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-white rounded-lg border">
                  <label className="block text-sm font-medium mb-2">Data retention period</label>
                  <Select 
                    value={settings.dataRetention} 
                    onValueChange={(value) => updateSetting('dataRetention', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataRetentionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Privacy & Security
            </h3>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <p className="font-medium">Anonymize exported data</p>
                <p className="text-sm text-gray-600">Remove personally identifiable information from reports</p>
              </div>
              <Switch 
                checked={settings.anonymizeData}
                onCheckedChange={(value) => updateSetting('anonymizeData', value)}
              />
            </div>

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <p className="font-medium mb-2">Legal Compliance & Data Protection</p>
                <ul className="text-sm space-y-1">
                  <li>• All data analysis uses your business's own sales data only</li>
                  <li>• No external data sources are accessed without explicit permission</li>
                  <li>• Reports generated comply with NSW EPA requirements</li>
                  <li>• Data is encrypted in transit and at rest</li>
                  <li>• You maintain full ownership and control of your data</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Configuration
            </Button>
            <Button variant="outline">
              Reset to Defaults
            </Button>
            <Button variant="outline">
              Export Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-600" />
            System Status & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-sm text-green-700">Uptime</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">2.3s</div>
              <div className="text-sm text-blue-700">Avg Response</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">94%</div>
              <div className="text-sm text-purple-700">Prediction Accuracy</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">15min</div>
              <div className="text-sm text-orange-700">Last Sync</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSourceSettings;