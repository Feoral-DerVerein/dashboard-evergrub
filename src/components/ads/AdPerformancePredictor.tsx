
import React, { useState, useEffect } from "react";
import { Calculator, HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

type PredictionFormValues = {
  dailyBudget: number;
  campaignDays: number;
  averageCPC: number;
  conversionRate: number;
  averageConversionValue: number;
};

type PredictionResult = {
  totalCost: number;
  estimatedClicks: number;
  estimatedConversions: number;
  estimatedRevenue: number;
  roi: number;
};

const AdPerformancePredictor = () => {
  const isMobile = useIsMobile();
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  
  const form = useForm<PredictionFormValues>({
    defaultValues: {
      dailyBudget: 20,
      campaignDays: 30,
      averageCPC: 0.5,
      conversionRate: 2,
      averageConversionValue: 50,
    },
  });

  const predictAdPerformance = (data: PredictionFormValues) => {
    // Calculate prediction metrics
    const totalCost = data.dailyBudget * data.campaignDays;
    const estimatedClicks = totalCost / data.averageCPC;
    const estimatedConversions = estimatedClicks * (data.conversionRate / 100);
    const estimatedRevenue = estimatedConversions * data.averageConversionValue;
    const roi = ((estimatedRevenue - totalCost) / totalCost) * 100;

    setPredictionResult({
      totalCost,
      estimatedClicks,
      estimatedConversions,
      estimatedRevenue,
      roi,
    });
  };

  const onSubmit = (data: PredictionFormValues) => {
    predictAdPerformance(data);
  };

  // Initialize with default values
  useEffect(() => {
    const defaultValues = form.getValues();
    predictAdPerformance(defaultValues);
  }, []);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg">Modelo Predictivo de Rendimiento</CardTitle>
        </div>
        <CardDescription>
          Estime el rendimiento potencial de su campaña publicitaria
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-5">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dailyBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Presupuesto Diario ($)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Cuánto está dispuesto a gastar por día
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="1"
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="campaignDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Días de Campaña
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Duración de la campaña en días
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="averageCPC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      CPC Promedio ($)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Costo promedio por clic estimado
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0.01" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="conversionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Tasa de Conversión (%)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Porcentaje de clics que se convierten
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0.1" 
                        max="100"
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="averageConversionValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Valor de Conversión ($)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Valor promedio de cada conversión
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0.01" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Calcular Predicción
            </Button>
          </form>
        </Form>
        
        {predictionResult && (
          <div className="mt-6 border-t pt-4">
            <h4 className="font-medium text-base mb-3">Resultados Estimados:</h4>
            <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-3"} gap-3`}>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Costo Total</p>
                <p className="font-medium text-lg">${predictionResult.totalCost.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Clics Estimados</p>
                <p className="font-medium text-lg">{Math.round(predictionResult.estimatedClicks)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Conversiones</p>
                <p className="font-medium text-lg">{predictionResult.estimatedConversions.toFixed(1)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Ingresos Estimados</p>
                <p className="font-medium text-lg">${predictionResult.estimatedRevenue.toFixed(2)}</p>
              </div>
              <div className={`bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg ${isMobile ? "col-span-2" : ""}`}>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className={`font-medium text-lg ${predictionResult.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {predictionResult.roi.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium mb-1">Factores a considerar:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>La calidad de su audiencia afectará la tasa de conversión real</li>
                <li>La relevancia de los anuncios puede mejorar el CPC</li>
                <li>Considere la estacionalidad y la competencia del mercado</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-800/20">
        <p>
          Este es un modelo predictivo y los resultados reales pueden variar según múltiples factores.
        </p>
      </CardFooter>
    </Card>
  );
};

export default AdPerformancePredictor;
