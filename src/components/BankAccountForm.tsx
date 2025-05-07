
import { useState } from "react";
import { Building, CreditCard, Globe, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { storeProfileService } from "@/services/storeProfileService";
import { PaymentDetails, StoreProfile } from "@/types/store.types";

export const BankAccountForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [merchantDetails, setMerchantDetails] = useState<PaymentDetails>({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    routingNumber: "",
    paymentMethod: "bank",
    paypalEmail: "",
    currency: "USD",
  });
  
  // Load existing payment details if available
  const loadPaymentDetails = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const storeProfile = await storeProfileService.getStoreProfile(user.id);
      
      if (storeProfile?.paymentDetails) {
        setMerchantDetails({
          ...merchantDetails,
          ...storeProfile.paymentDetails
        });
      }
    } catch (error) {
      console.error("Error loading payment details:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load payment details when component mounts
  useState(() => {
    loadPaymentDetails();
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format account number and routing number to only allow digits
    if (name === "accountNumber" || name === "routingNumber") {
      const formattedValue = value.replace(/\D/g, '');
      setMerchantDetails(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    setMerchantDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setMerchantDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar los datos de pago",
        variant: "destructive"
      });
      return;
    }
    
    // Validate form based on payment method
    if (merchantDetails.paymentMethod === "bank") {
      if (!merchantDetails.bankName) {
        toast({
          title: "Error", 
          description: "Ingresa el nombre del banco",
          variant: "destructive"
        });
        return;
      }
      
      if (!merchantDetails.accountNumber) {
        toast({
          title: "Error", 
          description: "Ingresa el número de cuenta",
          variant: "destructive"
        });
        return;
      }
      
      if (!merchantDetails.accountHolder) {
        toast({
          title: "Error", 
          description: "Ingresa el nombre del titular de la cuenta",
          variant: "destructive"
        });
        return;
      }
      
      if (!merchantDetails.routingNumber) {
        toast({
          title: "Error", 
          description: "Ingresa el número de routing",
          variant: "destructive"
        });
        return;
      }
    } else if (merchantDetails.paymentMethod === "paypal") {
      if (!merchantDetails.paypalEmail) {
        toast({
          title: "Error", 
          description: "Ingresa tu correo electrónico de PayPal",
          variant: "destructive"
        });
        return;
      }
    }
    
    setSaving(true);
    
    try {
      // Get existing profile or create minimal one
      let storeProfile = await storeProfileService.getStoreProfile(user.id);
      
      if (!storeProfile) {
        // Create a basic profile with payment details
        storeProfile = {
          userId: user.id,
          name: "",
          description: "",
          location: "",
          contactPhone: "",
          contactEmail: "",
          socialFacebook: "",
          socialInstagram: "",
          logoUrl: "",
          coverUrl: "",
          categories: [],
          businessHours: [],
          paymentDetails: merchantDetails
        };
      } else {
        // Update existing profile with payment details
        storeProfile.paymentDetails = merchantDetails;
      }
      
      const result = await storeProfileService.saveStoreProfile(storeProfile);
      
      if (result) {
        toast({
          title: "Éxito",
          description: "La información de pago se guardó correctamente"
        });
      } else {
        throw new Error("No se pudo guardar la información de pago");
      }
    } catch (error) {
      console.error("Error al guardar detalles de pago:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la información de pago",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Cargando datos de pago...</span>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Datos de Cuenta Bancaria</CardTitle>
        <CardDescription>
          Configura tu cuenta para recibir pagos del marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="paymentMethod">Método de Pago</Label>
            <Select 
              value={merchantDetails.paymentMethod} 
              onValueChange={(value) => handleSelectChange("paymentMethod", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Cuenta Bancaria</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="currency">Moneda</Label>
            <Select 
              value={merchantDetails.currency} 
              onValueChange={(value) => handleSelectChange("currency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {merchantDetails.paymentMethod === "bank" && (
            <>
              <div>
                <Label htmlFor="bankName">Nombre del Banco</Label>
                <div className="relative">
                  <Input
                    id="bankName"
                    name="bankName"
                    placeholder="Tu Banco"
                    value={merchantDetails.bankName}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="accountHolder">Nombre del Titular</Label>
                <Input
                  id="accountHolder"
                  name="accountHolder"
                  placeholder="Juan Pérez"
                  value={merchantDetails.accountHolder}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="accountNumber">Número de Cuenta</Label>
                <div className="relative">
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    placeholder="123456789"
                    value={merchantDetails.accountNumber}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="routingNumber">Número de Routing</Label>
                <Input
                  id="routingNumber"
                  name="routingNumber"
                  placeholder="123456789"
                  value={merchantDetails.routingNumber}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}
          
          {merchantDetails.paymentMethod === "paypal" && (
            <div>
              <Label htmlFor="paypalEmail">Correo Electrónico de PayPal</Label>
              <div className="relative">
                <Input
                  id="paypalEmail"
                  name="paypalEmail"
                  placeholder="tu-correo@ejemplo.com"
                  value={merchantDetails.paypalEmail}
                  onChange={handleInputChange}
                  className="pl-10"
                />
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
          )}
          
          <Button 
            type="button" 
            className="w-full mt-4" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Información de Pago
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Tu información de pago está segura y encriptada. Esta información se utilizará para procesar los pagos del marketplace.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
