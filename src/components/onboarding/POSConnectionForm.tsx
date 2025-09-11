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
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  posType: z.string().min(1, "POS type is required"),
  apiKey: z.string().min(1, "API Key is required"),
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
    { value: "cafe", label: "Café" },
    { value: "restaurant", label: "Restaurant" },
    { value: "hotel", label: "Hotel" },
    { value: "supermarket", label: "Supermarket" },
    { value: "hospital", label: "Hospital" },
  ];

  const posTypes = [
    { value: "square", label: "Square" },
    { value: "shopify", label: "Shopify POS" },
    { value: "lightspeed", label: "Lightspeed" },
    { value: "toast", label: "Toast" },
    { value: "custom", label: "Custom/Other" },
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-slate-300/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse" />
        <Card className="w-full max-w-md mx-auto backdrop-blur-2xl bg-white/10 dark:bg-black/10 border border-white/30 shadow-2xl relative z-10 animate-scale-in">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-scale-in" />
            <h2 className="text-2xl font-bold text-green-600 mb-2 animate-fade-in">Connection Successful!</h2>
            <p className="text-muted-foreground animate-fade-in">
              We're now analyzing your data. Your dashboard will be ready in a few minutes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-small-slate-300/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse" />
      
      <Card className="w-full max-w-2xl mx-auto backdrop-blur-2xl bg-white/10 dark:bg-black/10 border border-white/30 shadow-2xl relative z-10 animate-scale-in hover-scale">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-transparent to-accent/10 rounded-lg" />
        
        <CardHeader className="text-center pb-6 relative z-10 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Connect Your POS System
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            To start optimizing your inventory and reducing waste, connect your point of sale system.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 relative z-10">
          {/* Step 1 */}
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-semibold shadow-lg backdrop-blur-sm border border-white/20">
                1
              </div>
              <h3 className="text-lg font-semibold">Get Your API Key</h3>
            </div>
            <p className="text-muted-foreground ml-11">
              In your POS system settings, look for developer options or integrations and copy your API key.
            </p>
          </div>

          <Separator className="bg-white/20" />

          {/* Step 2 */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-semibold shadow-lg backdrop-blur-sm border border-white/20">
                2
              </div>
              <h3 className="text-lg font-semibold">Enter Your Details</h3>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 ml-11">
                {status === "error" && (
                  <Alert variant="destructive" className="backdrop-blur-sm bg-red-500/10 border-red-500/30 animate-fade-in">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem className="animate-fade-in">
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Central Café" 
                          {...field} 
                          className="backdrop-blur-sm bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem className="animate-fade-in">
                      <FormLabel>Business Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-sm bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300">
                            <SelectValue placeholder="Select your business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-2xl bg-white/90 dark:bg-black/90 border-white/20">
                          {businessTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="hover:bg-white/10">
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
                    <FormItem className="animate-fade-in">
                      <FormLabel>POS System Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-sm bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300">
                            <SelectValue placeholder="Select your POS system" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-2xl bg-white/90 dark:bg-black/90 border-white/20">
                          {posTypes.map((pos) => (
                            <SelectItem key={pos.value} value={pos.value} className="hover:bg-white/10">
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
                    <FormItem className="animate-fade-in">
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your API key" 
                          {...field} 
                          className="backdrop-blur-sm bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300"
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
                    <FormItem className="animate-fade-in">
                      <FormLabel>API URL (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://api.yourpos.com/v1" 
                          {...field} 
                          className="backdrop-blur-sm bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 backdrop-blur-sm border border-white/20 shadow-2xl transition-all duration-300 hover-scale animate-fade-in"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect and Start Optimizing"
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