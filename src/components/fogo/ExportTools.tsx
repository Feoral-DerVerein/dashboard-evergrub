import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Mail, Calendar, History, ExternalLink } from 'lucide-react';

interface ExportHistory {
  id: string;
  type: 'EPA' | 'BinTrim' | 'Combined';
  date: string;
  status: 'sent' | 'generated' | 'draft';
  recipient: string;
}

export const ExportTools = () => {
  const [exportHistory] = useState<ExportHistory[]>([
    { id: '1', type: 'EPA', date: '2024-03-15', status: 'sent', recipient: 'organics.grants@epa.nsw.gov.au' },
    { id: '2', type: 'BinTrim', date: '2024-03-10', status: 'generated', recipient: 'bintrim@epa.nsw.gov.au' },
    { id: '3', type: 'Combined', date: '2024-02-28', status: 'sent', recipient: 'compliance@company.com' },
  ]);

  const exportFormats = [
    {
      title: 'Reporte EPA - PDF',
      description: 'Formato oficial para EPA NSW con todos los datos requeridos',
      format: 'PDF',
      action: () => exportEPAReport('pdf')
    },
    {
      title: 'Reporte EPA - CSV',
      description: 'Datos estructurados para procesamiento adicional',
      format: 'CSV',
      action: () => exportEPAReport('csv')
    },
    {
      title: 'Datos Bin Trim - JSON',
      description: 'Formato compatible con la aplicación Bin Trim',
      format: 'JSON',
      action: () => exportBinTrimData('json')
    },
    {
      title: 'Datos Bin Trim - Excel',
      description: 'Hoja de cálculo con métricas detalladas',
      format: 'XLSX',
      action: () => exportBinTrimData('xlsx')
    },
    {
      title: 'Reporte Combinado',
      description: 'Documento completo con datos EPA y Bin Trim',
      format: 'PDF',
      action: () => exportCombinedReport()
    }
  ];

  const emailTemplates = {
    epa: {
      subject: 'Reporte de Cumplimiento FOGO - [Nombre Empresa]',
      body: `Estimados,

Adjunto el reporte de cumplimiento del mandato FOGO correspondiente al período [PERÍODO].

Datos destacados:
• Tasa de desvío: [TASA]%
• Tasa de contaminación: [CONTAMINACIÓN]%
• Estado de cumplimiento: [ESTADO]

Para cualquier consulta, no duden en contactarnos.

Saludos cordiales,
[NOMBRE]
[CARGO]
[EMPRESA]`
    },
    binTrim: {
      subject: 'Solicitud de Reembolso - Programa Bin Trim',
      body: `Estimados,

Adjunto los datos del programa Bin Trim para solicitud de reembolso.

Métricas de rendimiento:
• Reducción de residuos: [REDUCCIÓN]%
• Volumen total desviado: [VOLUMEN]L
• Reembolso solicitado: $[CANTIDAD] AUD

Todos los datos han sido verificados y cumplen con los requisitos del programa.

Saludos cordiales,
[NOMBRE]
[CARGO]
[EMPRESA]`
    }
  };

  const exportEPAReport = (format: string) => {
    // En una implementación real, esto generaría y descargaría el archivo
    console.log(`Exporting EPA report in ${format} format`);
    alert(`Reporte EPA exportado en formato ${format}. En producción, el archivo se descargaría automáticamente.`);
  };

  const exportBinTrimData = (format: string) => {
    console.log(`Exporting Bin Trim data in ${format} format`);
    alert(`Datos Bin Trim exportados en formato ${format}. En producción, el archivo se descargaría automáticamente.`);
  };

  const exportCombinedReport = () => {
    console.log('Exporting combined report');
    alert('Reporte combinado generado. En producción, se descargaría un PDF completo.');
  };

  const sendPrefilledEmail = (type: 'epa' | 'binTrim') => {
    const template = emailTemplates[type];
    const email = type === 'epa' ? 'organics.grants@epa.nsw.gov.au' : 'bintrim@epa.nsw.gov.au';
    
    const subject = encodeURIComponent(template.subject);
    const body = encodeURIComponent(template.body);
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Options
          </CardTitle>
          <CardDescription>
            Generate and download reports in different formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportFormats.map((format, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{format.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {format.format}
                  </Badge>
                </div>
                <Button 
                  onClick={format.action}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Plantillas de Email
          </CardTitle>
          <CardDescription>
            Emails pre-completados para envío a autoridades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Email para EPA NSW</h3>
              <p className="text-sm text-gray-600 mb-3">
                Plantilla oficial para envío de reportes de cumplimiento
              </p>
              <Button 
                onClick={() => sendPrefilledEmail('epa')}
                className="w-full"
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" />
                Abrir Email EPA
              </Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Email para Bin Trim</h3>
              <p className="text-sm text-gray-600 mb-3">
                Plantilla para solicitudes de reembolso del programa
              </p>
              <Button 
                onClick={() => sendPrefilledEmail('binTrim')}
                className="w-full"
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" />
                Abrir Email Bin Trim
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial de Reportes
          </CardTitle>
          <CardDescription>
            Registro de reportes generados y enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exportHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Reporte {item.type}</p>
                    <p className="text-sm text-gray-600">{item.recipient}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.date).toLocaleDateString('es-ES')}
                    </p>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status === 'sent' && 'Enviado'}
                      {item.status === 'generated' && 'Generado'}
                      {item.status === 'draft' && 'Borrador'}
                    </Badge>
                  </div>
                  
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="text-center">
            <h3 className="font-medium text-blue-900 mb-2">Acciones Rápidas</h3>
            <p className="text-sm text-blue-800 mb-4">
              Accesos directos a herramientas y recursos oficiales
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://www.epa.nsw.gov.au/business-food-waste-grants', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Calculadora Oficial
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://www.smartygrants.com.au/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                SmartyGrants
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.href = 'mailto:organics.grants@epa.nsw.gov.au'}
              >
                <Mail className="w-4 h-4 mr-1" />
                Contactar EPA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};