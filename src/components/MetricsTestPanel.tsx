import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataSeeding } from '@/hooks/useDataSeeding';
import { Loader2, Database, Trash2 } from 'lucide-react';

export function MetricsTestPanel() {
  const { seedData, clearData, isSeeding, isClearing } = useDataSeeding();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Seeding Panel</CardTitle>
        <CardDescription>
          Generate or clear realistic test data for the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={() => seedData.mutate({ days: 30, clearExisting: false })}
            disabled={isSeeding || isClearing}
            className="flex-1"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed 30 Days
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => clearData.mutate()}
            disabled={isSeeding || isClearing}
            variant="destructive"
            className="flex-1"
          >
            {isClearing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold">Seeding generates realistic data:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>30 days of sales data (trending up 10% monthly)</li>
            <li>Sustainability metrics with improvement trend</li>
            <li>Customer behavior data (10-20% conversion)</li>
            <li>5-10 active surprise bags from different stores</li>
          </ul>
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs font-medium">API Endpoints:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• POST /functions/v1/seed-test-data</li>
            <li>• GET /functions/v1/get-sales-metrics</li>
            <li>• GET /functions/v1/get-sustainability-metrics</li>
            <li>• GET /functions/v1/get-customer-metrics</li>
            <li>• GET /functions/v1/get-surprise-bags-metrics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
