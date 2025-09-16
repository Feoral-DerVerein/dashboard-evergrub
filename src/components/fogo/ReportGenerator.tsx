import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Send, Eye, Download, Building, Calendar, Users, Percent } from 'lucide-react';

interface EPAReport {
  companyCount: number;
  diversionRate: number;
  contaminationRate: number;
  behaviorChanges: string;
  commitmentVsResults: string;
  reportingDate: string;
}

interface BinTrimReport {
  wasteInventory: {
    general: number;
    organics: number;
    recyclables: number;
  };
  equipmentUsed: string[];
  reimbursements: number;
  reductionMetrics: {
    baseline: number;
    current: number;
    reduction: number;
  };
}

export const ReportGenerator = () => {
  const [activeReport, setActiveReport] = useState('epa');
  const [epaData, setEpaData] = useState<EPAReport>({
    companyCount: 1,
    diversionRate: 65,
    contaminationRate: 8,
    behaviorChanges: '',
    commitmentVsResults: '',
    reportingDate: new Date().toISOString().split('T')[0]
  });

  const [binTrimData, setBinTrimData] = useState<BinTrimReport>({
    wasteInventory: { general: 3400, organics: 2600, recyclables: 950 },
    equipmentUsed: ['Contenedores FOGO', 'Señalización', 'Balanza'],
    reimbursements: 2500,
    reductionMetrics: { baseline: 4200, current: 3400, reduction: 19 }
  });

  const generateEPAReport = () => {
    const reportData = {
      ...epaData,
      totalWaste: binTrimData.wasteInventory.general + binTrimData.wasteInventory.organics + binTrimData.wasteInventory.recyclables,
      complianceStatus: epaData.diversionRate >= 50 ? 'Cumpliendo' : 'Requiere Mejora'
    };

    // En una implementación real, esto generaría un PDF
    console.log('EPA Report Generated:', reportData);
    alert('Reporte EPA generado exitosamente. En producción, se descargaría un PDF.');
  };

  const generateBinTrimReport = () => {
    const reportData = {
      ...binTrimData,
      totalDiversion: binTrimData.wasteInventory.organics + binTrimData.wasteInventory.recyclables,
      costSavings: binTrimData.reductionMetrics.reduction * 15 // Estimación $15 por % de reducción
    };

    console.log('Bin Trim Report Generated:', reportData);
    alert('Reporte Bin Trim generado exitosamente. En producción, se exportaría en formato compatible.');
  };

  const sendToAuthorities = (type: 'epa' | 'bintrim') => {
    const subject = type === 'epa' ? 'Reporte FOGO - EPA NSW' : 'Datos Bin Trim - Programa de Subvención';
    const body = type === 'epa' 
      ? `Estimados,\n\nAdjunto el reporte de cumplimiento FOGO correspondiente al período ${epaData.reportingDate}.\n\nSaludos cordiales.`
      : `Estimados,\n\nAdjunto los datos del programa Bin Trim para solicitud de reembolso.\n\nSaludos cordiales.`;
    
    const email = type === 'epa' ? 'organics.grants@epa.nsw.gov.au' : 'bintrim@epa.nsw.gov.au';
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generador de Reportes
          </CardTitle>
          <CardDescription>
            Crear reportes automáticos para EPA NSW y programa Bin Trim
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="epa">Reporte EPA</TabsTrigger>
          <TabsTrigger value="bintrim">Reporte Bin Trim</TabsTrigger>
        </TabsList>

        {/* EPA Report */}
        <TabsContent value="epa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Datos Requeridos por EPA NSW
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-count">Número de Empresas con Servicio FOGO</Label>
                  <Input
                    id="company-count"
                    type="number"
                    value={epaData.companyCount}
                    onChange={(e) => setEpaData({...epaData, companyCount: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reporting-date">Fecha de Reporte</Label>
                  <Input
                    id="reporting-date"
                    type="date"
                    value={epaData.reportingDate}
                    onChange={(e) => setEpaData({...epaData, reportingDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diversion-rate">Tasa de Desvío (%)</Label>
                  <Input
                    id="diversion-rate"
                    type="number"
                    max="100"
                    value={epaData.diversionRate}
                    onChange={(e) => setEpaData({...epaData, diversionRate: parseFloat(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contamination-rate">Tasa de Contaminación (%)</Label>
                  <Input
                    id="contamination-rate"
                    type="number"
                    max="100"
                    value={epaData.contaminationRate}
                    onChange={(e) => setEpaData({...epaData, contaminationRate: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="behavior-changes">Cambios de Comportamiento Observados</Label>
                <Textarea
                  id="behavior-changes"
                  value={epaData.behaviorChanges}
                  onChange={(e) => setEpaData({...epaData, behaviorChanges: e.target.value})}
                  placeholder="Describa los cambios de comportamiento antes vs después de implementar FOGO..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commitment-results">Compromisos vs Resultados Reales</Label>
                <Textarea
                  id="commitment-results"
                  value={epaData.commitmentVsResults}
                  onChange={(e) => setEpaData({...epaData, commitmentVsResults: e.target.value})}
                  placeholder="Compare los compromisos iniciales con los resultados obtenidos..."
                />
              </div>
            </CardContent>
          </Card>

          {/* EPA Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Vista Previa del Reporte EPA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{epaData.companyCount}</div>
                  <div className="text-sm text-blue-800">Empresas</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{epaData.diversionRate}%</div>
                  <div className="text-sm text-green-800">Desvío</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{epaData.contaminationRate}%</div>
                  <div className="text-sm text-orange-800">Contaminación</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <Badge className={epaData.diversionRate >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {epaData.diversionRate >= 50 ? 'Cumpliendo' : 'Requiere Mejora'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EPA Actions */}
          <div className="flex gap-3">
            <Button onClick={generateEPAReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Generar Reporte PDF
            </Button>
            <Button variant="outline" onClick={() => sendToAuthorities('epa')} className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Enviar a EPA
            </Button>
          </div>
        </TabsContent>

        {/* Bin Trim Report */}
        <TabsContent value="bintrim" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Datos para Programa Bin Trim
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Inventario de Residuos (Litros/Semana)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="general-waste">Residuos Generales</Label>
                      <Input
                        id="general-waste"
                        type="number"
                        value={binTrimData.wasteInventory.general}
                        onChange={(e) => setBinTrimData({
                          ...binTrimData,
                          wasteInventory: {...binTrimData.wasteInventory, general: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organics-waste">Orgánicos FOGO</Label>
                      <Input
                        id="organics-waste"
                        type="number"
                        value={binTrimData.wasteInventory.organics}
                        onChange={(e) => setBinTrimData({
                          ...binTrimData,
                          wasteInventory: {...binTrimData.wasteInventory, organics: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recyclables-waste">Reciclables</Label>
                      <Input
                        id="recyclables-waste"
                        type="number"
                        value={binTrimData.wasteInventory.recyclables}
                        onChange={(e) => setBinTrimData({
                          ...binTrimData,
                          wasteInventory: {...binTrimData.wasteInventory, recyclables: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Métricas de Reducción</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="baseline">Línea Base (L/semana)</Label>
                      <Input
                        id="baseline"
                        type="number"
                        value={binTrimData.reductionMetrics.baseline}
                        onChange={(e) => setBinTrimData({
                          ...binTrimData,
                          reductionMetrics: {...binTrimData.reductionMetrics, baseline: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current">Actual (L/semana)</Label>
                      <Input
                        id="current"
                        type="number"
                        value={binTrimData.reductionMetrics.current}
                        onChange={(e) => setBinTrimData({
                          ...binTrimData,
                          reductionMetrics: {...binTrimData.reductionMetrics, current: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reducción</Label>
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700">
                          {((binTrimData.reductionMetrics.baseline - binTrimData.reductionMetrics.current) / binTrimData.reductionMetrics.baseline * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reimbursements">Reembolsos Solicitados ($AUD)</Label>
                  <Input
                    id="reimbursements"
                    type="number"
                    value={binTrimData.reimbursements}
                    onChange={(e) => setBinTrimData({...binTrimData, reimbursements: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bin Trim Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Resumen Bin Trim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(binTrimData.wasteInventory.general + binTrimData.wasteInventory.organics + binTrimData.wasteInventory.recyclables).toLocaleString()}L
                    </div>
                    <div className="text-sm text-blue-800">Total Semanal</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {((binTrimData.wasteInventory.organics + binTrimData.wasteInventory.recyclables) / 
                        (binTrimData.wasteInventory.general + binTrimData.wasteInventory.organics + binTrimData.wasteInventory.recyclables) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-800">Desvío</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      ${binTrimData.reimbursements.toLocaleString()}
                    </div>
                    <div className="text-sm text-orange-800">Reembolso</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {((binTrimData.reductionMetrics.baseline - binTrimData.reductionMetrics.current) / binTrimData.reductionMetrics.baseline * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-800">Reducción</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bin Trim Actions */}
          <div className="flex gap-3">
            <Button onClick={generateBinTrimReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Generar Reporte
            </Button>
            <Button variant="outline" onClick={() => sendToAuthorities('bintrim')} className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Enviar a Bin Trim
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};