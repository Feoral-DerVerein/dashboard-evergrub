import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateMetrics } from '@/hooks/useMetricsApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function MetricsTestPanel() {
  const updateMetrics = useUpdateMetrics();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSampleData = async () => {
    setIsGenerating(true);
    try {
      // Generate sales metrics
      await updateMetrics.mutateAsync({
        type: 'sales',
        data: {
          totalSales: 142.50 + Math.random() * 50,
          transactions: Math.floor(15 + Math.random() * 10),
          profit: 36.25 + Math.random() * 20,
        },
      });

      // Generate sustainability metrics
      await updateMetrics.mutateAsync({
        type: 'sustainability',
        data: {
          co2Saved: 25.5 + Math.random() * 10,
          wasteReduced: 3.2 + Math.random() * 2,
          foodWasteKg: 15.8 + Math.random() * 5,
        },
      });

      // Generate customer metrics
      await updateMetrics.mutateAsync({
        type: 'customer',
        data: {
          conversionRate: 12.5 + Math.random() * 5,
          returnRate: 2.8 + Math.random() * 2,
          avgOrderValue: 7.5 + Math.random() * 3,
        },
      });

      // Generate surprise bag metrics
      await updateMetrics.mutateAsync({
        type: 'surprise_bags',
        data: {
          storeName: 'Negentropy Store',
          originalPrice: 30.00,
          discountPrice: 10.00,
          items: ['Bread', 'Pastries', 'Vegetables', 'Fruit'],
          pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'available',
        },
      });

      toast.success('Sample data generated successfully!', {
        description: 'All metrics have been updated with random sample data.',
      });
    } catch (error) {
      toast.error('Failed to generate sample data', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Testing Panel</CardTitle>
        <CardDescription>
          Generate sample data to test the real-time metrics dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Click the button below to generate random sample metrics data for today. 
            This will create entries in all metrics tables (sales, sustainability, customer, surprise bags).
          </p>
        </div>

        <Button 
          onClick={generateSampleData} 
          disabled={isGenerating || updateMetrics.isPending}
          className="w-full"
        >
          {isGenerating || updateMetrics.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Sample Data'
          )}
        </Button>

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs font-medium">API Endpoints:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• GET /functions/v1/get-sales-metrics</li>
            <li>• GET /functions/v1/get-sustainability-metrics</li>
            <li>• GET /functions/v1/get-customer-metrics</li>
            <li>• GET /functions/v1/get-surprise-bags-metrics</li>
            <li>• POST /functions/v1/update-metrics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
