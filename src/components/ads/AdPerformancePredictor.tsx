
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
          <CardTitle className="text-lg">Performance Prediction Model</CardTitle>
        </div>
        <CardDescription>
          Estimate the potential performance of your advertising campaign
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
                      Daily Budget ($)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            How much you're willing to spend per day
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
                      Campaign Days
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Duration of the campaign in days
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
                      Average CPC ($)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Estimated average cost per click
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
                      Conversion Rate (%)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Percentage of clicks that convert
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
                      Conversion Value ($)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Average value of each conversion
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
              Calculate Prediction
            </Button>
          </form>
        </Form>
        
        {predictionResult && (
          <div className="mt-6 border-t pt-4">
            <h4 className="font-medium text-base mb-3">Estimated Results:</h4>
            <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-3"} gap-3`}>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="font-medium text-lg">${predictionResult.totalCost.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Estimated Clicks</p>
                <p className="font-medium text-lg">{Math.round(predictionResult.estimatedClicks)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="font-medium text-lg">{predictionResult.estimatedConversions.toFixed(1)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Estimated Revenue</p>
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
              <p className="font-medium mb-1">Factors to consider:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The quality of your audience will affect the actual conversion rate</li>
                <li>Ad relevance can improve your CPC</li>
                <li>Consider seasonality and market competition</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-800/20">
        <p>
          This is a predictive model and actual results may vary depending on multiple factors.
        </p>
      </CardFooter>
    </Card>
  );
};

export default AdPerformancePredictor;
