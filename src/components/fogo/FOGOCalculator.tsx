import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, CheckCircle, XCircle, Clock } from 'lucide-react';

interface FOGOResult {
  mandateApplies: boolean;
  complianceDate: Date | null;
  daysRemaining: number;
  category: 'high' | 'medium' | 'low' | 'exempt';
  volume: number;
}

export const FOGOCalculator = () => {
  const [businessType, setBusinessType] = useState('');
  const [sellsFood, setSellsFood] = useState('');
  const [managesContract, setManagesContract] = useState('');
  const [weeklyVolume, setWeeklyVolume] = useState('');
  const [result, setResult] = useState<FOGOResult | null>(null);

  const businessTypes = [
    { value: 'supermarket', label: 'Supermercado' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'school', label: 'Escuela' },
    { value: 'restaurant', label: 'Restaurante' },
    { value: 'cafe', label: 'Café' },
    { value: 'office', label: 'Oficina' },
    { value: 'other', label: 'Otro' }
  ];

  const calculateMandate = () => {
    const volume = parseFloat(weeklyVolume);
    
    if (!volume || !businessType || !sellsFood || !managesContract) {
      return;
    }

    let mandateApplies = false;
    let complianceDate: Date | null = null;
    let category: 'high' | 'medium' | 'low' | 'exempt' = 'exempt';

    // Solo aplica si vende comida Y gestiona su propio contrato
    if (sellsFood === 'yes' && managesContract === 'yes') {
      if (volume >= 3840) {
        mandateApplies = true;
        complianceDate = new Date('2026-07-01');
        category = 'high';
      } else if (volume >= 1920) {
        mandateApplies = true;
        complianceDate = new Date('2028-07-01');
        category = 'medium';
      } else if (volume >= 660) {
        mandateApplies = true;
        complianceDate = new Date('2030-07-01');
        category = 'low';
      }
    }

    const daysRemaining = complianceDate 
      ? Math.ceil((complianceDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    setResult({
      mandateApplies,
      complianceDate,
      daysRemaining,
      category,
      volume
    });
  };

  const reset = () => {
    setBusinessType('');
    setSellsFood('');
    setManagesContract('');
    setWeeklyVolume('');
    setResult(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de Mandato FOGO
          </CardTitle>
          <CardDescription>
            Determine si el mandato FOGO aplica a su negocio y cuándo debe cumplir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="business-type">Tipo de Negocio</Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo de negocio" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sells Food */}
          <div className="space-y-3">
            <Label>¿Vende comestibles o prepara alimentos/bebidas?</Label>
            <RadioGroup value={sellsFood} onValueChange={setSellsFood}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="sells-yes" />
                <Label htmlFor="sells-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="sells-no" />
                <Label htmlFor="sells-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Manages Contract */}
          <div className="space-y-3">
            <Label>¿Gestiona su propio contrato de residuos?</Label>
            <RadioGroup value={managesContract} onValueChange={setManagesContract}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="manages-yes" />
                <Label htmlFor="manages-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="manages-no" />
                <Label htmlFor="manages-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Weekly Volume */}
          <div className="space-y-2">
            <Label htmlFor="weekly-volume">Volumen Semanal de Residuos Generales (litros)</Label>
            <Input
              id="weekly-volume"
              type="number"
              value={weeklyVolume}
              onChange={(e) => setWeeklyVolume(e.target.value)}
              placeholder="Ej: 2500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button onClick={calculateMandate} className="flex-1">
              Calcular Mandato
            </Button>
            <Button variant="outline" onClick={reset}>
              Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.mandateApplies ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-600" />
              )}
              Resultado del Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.mandateApplies ? (
              <>
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    <strong>El mandato FOGO SÍ aplica a su negocio</strong>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.volume.toLocaleString()}L
                    </div>
                    <div className="text-sm text-blue-800">Volumen Semanal</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.complianceDate?.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-orange-800">Fecha Límite</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="text-2xl font-bold text-purple-600">
                        {result.daysRemaining}
                      </span>
                    </div>
                    <div className="text-sm text-purple-800">Días Restantes</div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Badge className={getCategoryColor(result.category)}>
                    {result.category === 'high' && 'Prioridad Alta - Cumplimiento 2026'}
                    {result.category === 'medium' && 'Prioridad Media - Cumplimiento 2028'}
                    {result.category === 'low' && 'Prioridad Baja - Cumplimiento 2030'}
                  </Badge>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Próximos Pasos:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Contacte a su proveedor de residuos para implementar recolección FOGO</li>
                    <li>• Capacite al personal sobre separación de residuos orgánicos</li>
                    <li>• Considere solicitar subvenciones disponibles</li>
                    <li>• Establezca sistema de monitoreo para cumplimiento</li>
                  </ul>
                </div>
              </>
            ) : (
              <Alert className="bg-gray-50 border-gray-200">
                <AlertDescription className="text-gray-800">
                  <strong>El mandato FOGO NO aplica a su negocio</strong> basado en los criterios actuales.
                  {sellsFood === 'no' && " Razón: No vende comestibles ni prepara alimentos."}
                  {managesContract === 'no' && " Razón: No gestiona su propio contrato de residuos."}
                  {parseFloat(weeklyVolume) < 660 && " Razón: Volumen semanal menor a 660L."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};