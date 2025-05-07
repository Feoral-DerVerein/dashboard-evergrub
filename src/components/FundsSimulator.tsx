
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { CreditCard, DollarSign, PiggyBank, Coins } from "lucide-react";
import { salesService } from "@/services/salesService";

export const FundsSimulator = () => {
  const [amount, setAmount] = useState<string>("100.00");
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulatePayment = async () => {
    setIsLoading(true);
    try {
      // Generate a random order ID
      const orderId = `sim-${Math.random().toString(36).substring(2, 10)}`;
      
      // Create a simulated sale
      const success = await salesService.simulatePayment(
        orderId,
        parseFloat(amount) || 100,
        `Simulated Payment`
      );
      
      if (success) {
        toast({
          title: "Payment Simulated",
          description: `$${amount} has been added to your account`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Simulation Failed",
          description: "Could not simulate the payment",
        });
      }
    } catch (error) {
      console.error("Error simulating payment:", error);
      toast({
        variant: "destructive",
        title: "Simulation Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Simulate Funds Receipt</CardTitle>
        <CardDescription>
          For testing purposes only - simulate receiving funds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount (AUD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSimulatePayment} 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" />
                Simulate Payment
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            This will create a simulated payment entry in your sales records.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
