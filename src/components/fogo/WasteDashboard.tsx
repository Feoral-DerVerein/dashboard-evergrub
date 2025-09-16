import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Trash2, Recycle } from 'lucide-react';

interface WasteData {
  period: string;
  general: number;
  organics: number;
  recyclables: number;
  contamination: number;
}

export const WasteDashboard = () => {
  const [currentData, setCurrentData] = useState({
    general: '',
    organics: '',
    recyclables: '',
    frequency: '',
    contamination: ''
  });

  const [savedData, setSavedData] = useState<WasteData[]>([
    { period: 'Ene 2024', general: 4200, organics: 1800, recyclables: 800, contamination: 15 },
    { period: 'Feb 2024', general: 3900, organics: 2100, recyclables: 850, contamination: 12 },
    { period: 'Mar 2024', general: 3600, organics: 2400, recyclables: 900, contamination: 8 },
    { period: 'Abr 2024', general: 3400, organics: 2600, recyclables: 950, contamination: 6 },
  ]);

  const saveData = () => {
    if (!currentData.general || !currentData.organics || !currentData.recyclables) return;
    
    const newEntry: WasteData = {
      period: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      general: parseFloat(currentData.general),
      organics: parseFloat(currentData.organics),
      recyclables: parseFloat(currentData.recyclables),
      contamination: parseFloat(currentData.contamination) || 0
    };

    setSavedData([...savedData, newEntry]);
    setCurrentData({ general: '', organics: '', recyclables: '', frequency: '', contamination: '' });
  };

  // Calculations
  const latestData = savedData[savedData.length - 1];
  const previousData = savedData[savedData.length - 2];
  
  const diversionRate = latestData ? 
    ((latestData.organics + latestData.recyclables) / (latestData.general + latestData.organics + latestData.recyclables)) * 100 : 0;
  
  const monthlyReduction = latestData && previousData ? 
    ((previousData.general - latestData.general) / previousData.general) * 100 : 0;

  const getComplianceStatus = () => {
    if (diversionRate >= 70 && latestData?.contamination <= 10) return 'excellent';
    if (diversionRate >= 50 && latestData?.contamination <= 20) return 'good';
    if (diversionRate >= 30) return 'warning';
    return 'danger';
  };

  const complianceStatus = getComplianceStatus();

  const pieData = latestData ? [
    { name: 'Residuos Generales', value: latestData.general, color: '#ef4444' },
    { name: 'Orgánicos FOGO', value: latestData.organics, color: '#22c55e' },
    { name: 'Reciclables', value: latestData.recyclables, color: '#3b82f6' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Data Input */}
      <Card>
        <CardHeader>
          <CardTitle>Ingreso de Datos de Residuos</CardTitle>
          <CardDescription>Registre los volúmenes semanales/mensuales de sus residuos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="general">Residuos Generales (L)</Label>
              <Input
                id="general"
                type="number"
                value={currentData.general}
                onChange={(e) => setCurrentData({...currentData, general: e.target.value})}
                placeholder="Ej: 3500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organics">Residuos Orgánicos FOGO (L)</Label>
              <Input
                id="organics"
                type="number"
                value={currentData.organics}
                onChange={(e) => setCurrentData({...currentData, organics: e.target.value})}
                placeholder="Ej: 2400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recyclables">Reciclables (L)</Label>
              <Input
                id="recyclables"
                type="number"
                value={currentData.recyclables}
                onChange={(e) => setCurrentData({...currentData, recyclables: e.target.value})}
                placeholder="Ej: 900"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frecuencia de Recolección</Label>
              <Select value={currentData.frequency} onValueChange={(value) => setCurrentData({...currentData, frequency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diaria</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="biweekly">Bisemanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contamination">Tasa de Contaminación (%)</Label>
              <Input
                id="contamination"
                type="number"
                max="100"
                value={currentData.contamination}
                onChange={(e) => setCurrentData({...currentData, contamination: e.target.value})}
                placeholder="Ej: 8"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={saveData} className="w-full">
                Guardar Datos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Tasa de Desvío</p>
                <p className="text-2xl font-bold text-green-700">
                  {diversionRate.toFixed(1)}%
                </p>
              </div>
              <Recycle className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={diversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Reducción Mensual</p>
                <p className="text-2xl font-bold text-blue-700 flex items-center gap-1">
                  {monthlyReduction > 0 ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <TrendingUp className="w-5 h-5" />
                  )}
                  {Math.abs(monthlyReduction).toFixed(1)}%
                </p>
              </div>
              <Trash2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Contaminación</p>
                <p className="text-2xl font-bold text-orange-700">
                  {latestData?.contamination || 0}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <Progress value={latestData?.contamination || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r ${
          complianceStatus === 'excellent' ? 'from-green-50 to-green-100' :
          complianceStatus === 'good' ? 'from-blue-50 to-blue-100' :
          complianceStatus === 'warning' ? 'from-yellow-50 to-yellow-100' :
          'from-red-50 to-red-100'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Estado de Cumplimiento</p>
                <Badge className={
                  complianceStatus === 'excellent' ? 'bg-green-100 text-green-800' :
                  complianceStatus === 'good' ? 'bg-blue-100 text-blue-800' :
                  complianceStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {complianceStatus === 'excellent' && 'Excelente'}
                  {complianceStatus === 'good' && 'Bueno'}
                  {complianceStatus === 'warning' && 'Advertencia'}
                  {complianceStatus === 'danger' && 'Requiere Acción'}
                </Badge>
              </div>
              <CheckCircle className={`w-8 h-8 ${
                complianceStatus === 'excellent' ? 'text-green-600' :
                complianceStatus === 'good' ? 'text-blue-600' :
                complianceStatus === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Residuos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={savedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="general" fill="#ef4444" name="Generales" />
                <Bar dataKey="organics" fill="#22c55e" name="Orgánicos" />
                <Bar dataKey="recyclables" fill="#3b82f6" name="Reciclables" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composición Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};