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
  return;
};