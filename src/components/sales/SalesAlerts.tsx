
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Store, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderAlert } from "@/hooks/useSalesData";

interface SalesAlertsProps {
  newOrdersPageAccepted: OrderAlert | null;
  newMarketplaceCompletedOrder: OrderAlert | null;
  newCompletedOrderId: string | null;
  newCompletedOrderAmount: number | null;
  onNavigateToOrders: () => void;
}

const SalesAlerts = ({
  newOrdersPageAccepted,
  newMarketplaceCompletedOrder,
  newCompletedOrderId,
  newCompletedOrderAmount,
  onNavigateToOrders
}: SalesAlertsProps) => {
  return (
    <>
      {newOrdersPageAccepted && (
        <Alert className="mb-4 border-blue-500 bg-blue-50 text-blue-800">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800 font-semibold">Order accepted from Orders page!</AlertTitle>
          <AlertDescription className="text-blue-700">
            An order has been accepted for ${newOrdersPageAccepted.total.toFixed(2)} 
            <br />
            Order #{newOrdersPageAccepted.id.substring(0, 8)}
          </AlertDescription>
        </Alert>
      )}
      
      {newMarketplaceCompletedOrder && (
        <Alert className="mb-4 border-amber-500 bg-amber-50 text-amber-800">
          <Store className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800 font-semibold">Marketplace sale completed!</AlertTitle>
          <AlertDescription className="text-amber-700">
            A new Marketplace sale has been recorded for ${newMarketplaceCompletedOrder.total.toFixed(2)} 
            <br />
            Order #{newMarketplaceCompletedOrder.id.substring(0, 8)}
          </AlertDescription>
        </Alert>
      )}
      
      {newCompletedOrderId && newCompletedOrderAmount !== null && !newMarketplaceCompletedOrder && (
        <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-semibold">Sale completed!</AlertTitle>
          <AlertDescription className="text-green-700">
            A new sale has been recorded for ${newCompletedOrderAmount.toFixed(2)} 
            <br />
            Order #{newCompletedOrderId.substring(0, 8)}
          </AlertDescription>
        </Alert>
      )}
      
      {!newOrdersPageAccepted && !newMarketplaceCompletedOrder && !newCompletedOrderId && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">New sales notification</h3>
              <p className="text-sm text-amber-700 mt-1">
                When you complete an order, the sales information will appear here automatically.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800" 
                onClick={onNavigateToOrders}
              >
                View pending orders
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesAlerts;
