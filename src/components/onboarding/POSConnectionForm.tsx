import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  businessName: z.string().min(1, "Nombre del negocio es requerido"),
  businessType: z.string().min(1, "Tipo de negocio es requerido"),
  posType: z.string().min(1, "Tipo de POS es requerido"),
  apiKey: z.string().min(1, "API Key es requerida"),
  apiUrl: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface POSConnectionFormProps {
  onComplete: () => void;
}

const POSConnectionForm = ({ onComplete }: POSConnectionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      posType: "",
      apiKey: "",
      apiUrl: "",
    },
  });

  const businessTypes = [
    { value: "cafeteria", label: "Cafetería" },
    { value: "restaurante", label: "Restaurante" },
    { value: "hotel", label: "Hotel" },
    { value: "supermercado", label: "Supermercado" },
    { value: "hospital", label: "Hospital" },
  ];

  const posTypes = [
    { value: "square", label: "Square" },
    { value: "shopify", label: "Shopify POS" },
    { value: "lightspeed", label: "Lightspeed" },
    { value: "toast", label: "Toast" },
    { value: "custom", label: "Custom/Otro" },
  ];

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      // Simulate API call - replace with actual webhook URL
      const webhookUrl = "https://your-n8n-webhook-url.com/webhook";
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          userId: "current-user-id", // Replace with actual user ID
        }),
      });

      if (response.ok) {
        setStatus("success");
        // Store onboarding completion in localStorage
        localStorage.setItem("posOnboardingCompleted", "true");
        // Complete onboarding after showing success message
        setTimeout(() => {
          onComplete();
        }, 3000);
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      console.error("Error connecting POS:", error);
      setStatus("error");
      setErrorMessage("Connection error. Please check your API Key and try again. If the problem persists, contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">¡Conexión exitosa!</h2>
            <p className="text-muted-foreground">
              Ahora estamos analizando tus datos. Tu dashboard estará listo en unos minutos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Conecta tu sistema POS</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Para empezar a optimizar tu inventario y reducir el desperdicio, conecta tu sistema de ventas.
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <h3 className="text-lg font-semibold">Obtén tu API Key</h3>
            </div>
            <p className="text-muted-foreground ml-11">
              En la configuración de tu sistema POS, busca las opciones para desarrolladores o integraciones y copia tu clave de API.
            </p>
          </div>

          <Separator />

          {/* Step 2 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <h3 className="text-lg font-semibold">Ingresa tus datos</h3>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 ml-11">
                {status === "error" && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Negocio</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Café del Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Negocio</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de negocio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="posType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de POS</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu sistema POS" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {posTypes.map((pos) => (
                            <SelectItem key={pos.value} value={pos.value}>
                              {pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Ingresa tu clave de API" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de la API (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://api.tupos.com/v1" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 text-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    "Conectar y empezar a optimizar"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSConnectionForm;