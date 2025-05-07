
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { salesService } from "@/services/salesService";
import { toast } from "sonner";

export const FundsSimulator = () => {
  const [amount, setAmount] = useState("25.00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSimulatePayment = async () => {
    setIsSubmitting(true);
    
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error("Por favor ingresa un monto válido");
        return;
      }
      
      const success = await salesService.simulatePayment(parsedAmount);
      
      if (success) {
        toast.success(`Pago simulado de $${parsedAmount.toFixed(2)} recibido!`);
        // Limpiar el formulario
        setAmount("25.00");
      } else {
        toast.error("No se pudo procesar el pago simulado");
      }
    } catch (error) {
      console.error("Error al simular pago:", error);
      toast.error("Ocurrió un error al simular el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-lg font-medium mb-2">Simulador de Pagos</h2>
      <p className="text-sm text-gray-500 mb-4">
        Simula la recepción de pagos del marketplace para ver las actualizaciones en el dashboard
      </p>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="amount">Monto a recibir ($)</Label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="pl-7"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleSimulatePayment} 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Procesando..." : "Recibir Pago Simulado"}
        </Button>
      </div>
    </div>
  );
};
