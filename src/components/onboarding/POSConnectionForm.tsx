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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background landscape effect */}
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/5 to-purple-500/10" />
        
        <Card className="w-full max-w-md mx-auto backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl relative z-10 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
          <CardContent className="p-8 text-center relative z-10">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connection Successful!</h2>
            <p className="text-white/70">
              We're now analyzing your data. Your dashboard will be ready in a few minutes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background landscape effect */}
      <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/5 to-purple-500/10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl relative z-10 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
        <CardHeader className="text-center pb-6 relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">Connect Your POS System</h1>
          <p className="text-lg text-white/70 mt-2">
            To start optimizing your inventory and reducing waste, connect your point of sale system.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 relative z-10">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 text-white flex items-center justify-center font-semibold shadow-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-white">Get Your API Key</h3>
            </div>
            <p className="text-white/70 ml-11">
              In your POS system settings, look for developer options or integrations and copy your API key.
            </p>
          </div>

          <Separator className="bg-white/10" />

          {/* Step 2 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 text-white flex items-center justify-center font-semibold shadow-lg">
                2
              </div>
              <h3 className="text-lg font-semibold text-white">Enter Your Details</h3>
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
                      <FormLabel className="text-white">Business Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Central Café" 
                          className="backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/30"
                          {...field} 
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
                    <FormItem>
                      <FormLabel className="text-white">Business Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-sm bg-white/10 border-white/20 text-white focus:bg-white/15 focus:border-white/30">
                            <SelectValue placeholder="Select your business type" className="text-white/50" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-xl bg-slate-900/90 border-white/20">
                          {businessTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="text-white hover:bg-white/10">
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
                      <FormLabel className="text-white">POS System Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-sm bg-white/10 border-white/20 text-white focus:bg-white/15 focus:border-white/30">
                            <SelectValue placeholder="Select your POS system" className="text-white/50" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-xl bg-slate-900/90 border-white/20">
                          {posTypes.map((pos) => (
                            <SelectItem key={pos.value} value={pos.value} className="text-white hover:bg-white/10">
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
                      <FormLabel className="text-white">API Key</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your API key" 
                          className="backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/30"
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
                      <FormLabel className="text-white">API URL (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://api.yourpos.com/v1" 
                          className="backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/30"
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
                  className="w-full h-12 text-lg font-semibold shadow-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white border-0"
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