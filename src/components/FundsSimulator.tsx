
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
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Simulador de Pagos</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Monto a Simular</Label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <Input
              id="amount"
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>
        <Button 
          onClick={handleSimulatePayment} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Procesando..." : "Simular Pago"}
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Esto simulará un pago entrante y actualizará las estadísticas del dashboard.
        </p>
      </div>
    </div>
  );
};
