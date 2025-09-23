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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Loader2, Upload, FileSpreadsheet, Edit3, Download, Link, Coffee } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

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
  
  // Enhanced states for alternative data sources
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualData, setManualData] = useState({
    dailySales: "",
    monthlyTransactions: "",
    productCategories: "",
    averageOrderValue: "",
  });

  // Dropzone configuration for CSV uploads
  const onDrop = (acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
    simulateFileUpload(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 5,
  });

  // Helper functions for alternative data sources
  const simulateFileUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsUploading(false);
    toast.success(`${files.length} file(s) uploaded successfully!`);
    
    // Prepare N8N payload for CSV upload
    const n8nPayload = {
      source_type: "csv",
      business_name: form.getValues("businessName") || "Unknown",
      business_type: form.getValues("businessType") || "Unknown",
      data_payload: {
        sales_data: files.map(f => ({ filename: f.name, size: f.size })),
        inventory_data: [],
        customer_data: [],
        timestamp: new Date().toISOString(),
      },
      webhook_url: "https://your-n8n-webhook-url.com/webhook"
    };
    
    console.log("N8N CSV Payload:", n8nPayload);
  };

  const handleGoogleSheetsConnect = async () => {
    if (!googleSheetUrl) {
      toast.error("Please enter a valid Google Sheets URL");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const n8nPayload = {
      source_type: "google_sheets",
      business_name: form.getValues("businessName") || "Unknown",
      business_type: form.getValues("businessType") || "Unknown", 
      data_payload: {
        sheets_url: googleSheetUrl,
        sales_data: [],
        inventory_data: [],
        customer_data: [],
        timestamp: new Date().toISOString(),
      },
      webhook_url: "https://your-n8n-webhook-url.com/webhook"
    };
    
    console.log("N8N Google Sheets Payload:", n8nPayload);
    setIsLoading(false);
    toast.success("Google Sheets connected successfully!");
  };

  const handleManualDataSubmit = () => {
    const n8nPayload = {
      source_type: "manual",
      business_name: form.getValues("businessName") || "Unknown",
      business_type: form.getValues("businessType") || "Unknown",
      data_payload: {
        sales_data: [manualData],
        inventory_data: [],
        customer_data: [],
        timestamp: new Date().toISOString(),
      },
      webhook_url: "https://your-n8n-webhook-url.com/webhook"
    };
    
    console.log("N8N Manual Data Payload:", n8nPayload);
    setIsManualEntryOpen(false);
    toast.success("Manual data saved successfully!");
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const csvContent = `Business Name,Daily Sales,Monthly Transactions,Product Categories,Average Order Value
Example Cafe,2500,150,Coffee|Pastries|Sandwiches,16.50`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'business_data_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded!");
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <Card className="w-full max-w-md mx-auto backdrop-blur-xl bg-background/80 border border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Connection Successful!</h2>
            <p className="text-muted-foreground">
              We're now analyzing your data. Your dashboard will be ready in a few minutes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Gradient Background with Animated Floating Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-900/20 dark:via-green-800/10 dark:to-green-700/5">
        {/* Animated Floating Fruits & Vegetables */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10 pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 40 + 20}px`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 8 + 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          >
            {["🍎", "🥕", "🥬", "🍅", "🍊", "🥒"][Math.floor(Math.random() * 6)]}
          </motion.div>
        ))}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/20" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          
          {/* Main POS Connection Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card backdrop-blur-xl bg-white/25 border border-white/20 rounded-3xl shadow-[0_25px_45px_rgba(0,0,0,0.1)] overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    Connect Your POS System
                  </h1>
                  <p className="text-muted-foreground mt-2 text-lg">
                    Streamline your business data integration in minutes
                  </p>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-8 p-8">
                {/* Step 1 */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center text-sm font-bold shadow-lg">
                      1
                    </div>
                    <h3 className="text-lg font-semibold">Get Your API Key</h3>
                  </div>
                  <p className="text-muted-foreground ml-11">
                    Find your API key in your POS system's developer settings.
                  </p>
                </motion.div>

                <Separator className="border-white/30" />

                {/* Step 2 - API Form */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center text-sm font-bold shadow-lg">
                      2
                    </div>
                    <h3 className="text-lg font-semibold">Enter Your Details</h3>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 ml-11">
                      {status === "error" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Alert variant="destructive" className="glass-card bg-red-50/50 border-red-200/50">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>{errorMessage}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Business Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Central Café" 
                                  {...field}
                                  className="glass-input bg-white/50 border-white/30 focus:border-green-400 focus:ring-green-400/20"
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
                              <FormLabel className="text-sm font-medium">Business Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="glass-input bg-white/50 border-white/30 focus:border-green-400">
                                    <SelectValue placeholder="Select business type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="glass-card bg-white/90 backdrop-blur-xl">
                                  {businessTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value} className="hover:bg-green-50">
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="posType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">POS System Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="glass-input bg-white/50 border-white/30 focus:border-green-400">
                                    <SelectValue placeholder="Select POS system" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="glass-card bg-white/90 backdrop-blur-xl">
                                  {posTypes.map((pos) => (
                                    <SelectItem key={pos.value} value={pos.value} className="hover:bg-green-50">
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
                              <FormLabel className="text-sm font-medium">API Key</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter your API key" 
                                  {...field}
                                  className="glass-input bg-white/50 border-white/30 focus:border-green-400 focus:ring-green-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="apiUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">API URL (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://api.yourpos.com/v1" 
                                {...field}
                                className="glass-input bg-white/50 border-white/30 focus:border-green-400 focus:ring-green-400/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Link className="mr-2 h-4 w-4" />
                            Connect and Start Optimizing
                          </>
                        )}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full border-white/30" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white/60 backdrop-blur-sm px-4 py-1 rounded-full text-muted-foreground font-medium">
                            or
                          </span>
                        </div>
                      </div>

                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full h-12 text-sm font-semibold glass-button bg-white/30 border-white/40 hover:bg-white/40 backdrop-blur-sm"
                        onClick={() => {
                          localStorage.setItem("posOnboardingCompleted", "true");
                          window.location.href = "/kpi";
                        }}
                      >
                        <Coffee className="mr-2 h-4 w-4 text-gray-900" />
                        Continue without API
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alternative Data Sources Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="glass-card backdrop-blur-xl bg-white/25 border border-white/20 rounded-3xl shadow-[0_25px_45px_rgba(0,0,0,0.1)] overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm">
                <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Alternative Data Sources
                </h2>
                <p className="text-muted-foreground mt-1">
                  Multiple ways to get your business data connected
                </p>
              </CardHeader>

              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Google Sheets Integration */}
                  <motion.div 
                    className="glass-card bg-white/30 p-6 rounded-2xl border border-white/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <FileSpreadsheet className="h-6 w-6 text-white" />
                      <h3 className="font-semibold">Google Sheets</h3>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Paste your Google Sheets URL here"
                        value={googleSheetUrl}
                        onChange={(e) => setGoogleSheetUrl(e.target.value)}
                        className="glass-input bg-white/50 border-white/30 focus:border-green-400"
                      />
                       <Button 
                         onClick={handleGoogleSheetsConnect}
                         disabled={isLoading}
                         className="w-full bg-white text-gray-900 hover:bg-white/90"
                       >
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-900" /> : <Link className="mr-2 h-4 w-4 text-gray-900" />}
                         Connect Google Sheet
                       </Button>
                      <p className="text-xs text-muted-foreground">
                        Share your sheet with view permissions
                      </p>
                    </div>
                  </motion.div>

                  {/* CSV File Upload */}
                  <motion.div 
                    className="glass-card bg-white/30 p-6 rounded-2xl border border-white/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Upload className="h-6 w-6 text-white" />
                      <h3 className="font-semibold">CSV Upload</h3>
                    </div>
                    <div 
                      {...getRootProps()} 
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive 
                          ? 'border-green-400 bg-green-50/50' 
                          : 'border-white/40 hover:border-green-300 bg-white/20'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">
                        {isDragActive ? 'Drop files here...' : 'Drag & drop CSV files or click to browse'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported: .csv, .xlsx (max 5 files)
                      </p>
                    </div>
                    
                    {isUploading && (
                      <div className="mt-4">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Uploaded Files:</p>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="text-xs bg-green-50/50 p-2 rounded border">
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Manual Data Entry */}
                  <motion.div 
                    className="glass-card bg-white/30 p-6 rounded-2xl border border-white/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Edit3 className="h-6 w-6 text-white" />
                      <h3 className="font-semibold">Manual Entry</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter your business metrics manually for quick setup
                    </p>
                    <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                      <DialogTrigger asChild>
                         <Button className="w-full bg-white text-gray-900 hover:bg-white/90">
                           <Edit3 className="mr-2 h-4 w-4 text-gray-900" />
                           Enter Data Manually
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-modal bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl">
                        <DialogHeader>
                          <DialogTitle>Manual Data Entry</DialogTitle>
                          <DialogDescription>
                            Enter your basic business metrics to get started quickly
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="dailySales">Daily Sales (Average)</Label>
                            <Input
                              id="dailySales"
                              placeholder="e.g. 2500"
                              value={manualData.dailySales}
                              onChange={(e) => setManualData(prev => ({...prev, dailySales: e.target.value}))}
                              className="glass-input"
                            />
                          </div>
                          <div>
                            <Label htmlFor="monthlyTransactions">Monthly Transactions</Label>
                            <Input
                              id="monthlyTransactions"
                              placeholder="e.g. 450"
                              value={manualData.monthlyTransactions}
                              onChange={(e) => setManualData(prev => ({...prev, monthlyTransactions: e.target.value}))}
                              className="glass-input"
                            />
                          </div>
                          <div>
                            <Label htmlFor="productCategories">Product Categories</Label>
                            <Textarea
                              id="productCategories"
                              placeholder="e.g. Coffee, Pastries, Sandwiches"
                              value={manualData.productCategories}
                              onChange={(e) => setManualData(prev => ({...prev, productCategories: e.target.value}))}
                              className="glass-input"
                            />
                          </div>
                          <div>
                            <Label htmlFor="averageOrderValue">Average Order Value</Label>
                            <Input
                              id="averageOrderValue"
                              placeholder="e.g. 16.50"
                              value={manualData.averageOrderValue}
                              onChange={(e) => setManualData(prev => ({...prev, averageOrderValue: e.target.value}))}
                              className="glass-input"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsManualEntryOpen(false)}
                            className="flex-1 glass-button"
                          >
                            Cancel
                          </Button>
                           <Button 
                             onClick={handleManualDataSubmit}
                             className="flex-1 bg-white text-gray-900 hover:bg-white/90"
                           >
                             Save Data
                           </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>

                  {/* Template Download */}
                  <motion.div 
                    className="glass-card bg-white/30 p-6 rounded-2xl border border-white/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Download className="h-6 w-6 text-white" />
                      <h3 className="font-semibold">Template Import</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download our template, fill it out, and upload it back
                    </p>
                    <div className="space-y-3">
                       <Button 
                         variant="outline"
                         onClick={downloadTemplate}
                         className="w-full glass-button bg-white/40 hover:bg-white/50"
                       >
                         <Download className="mr-2 h-4 w-4 text-gray-900" />
                         Download Template
                       </Button>
                       <Button 
                         className="w-full bg-white text-gray-900 hover:bg-white/90"
                         onClick={() => {
                           // Trigger file picker for completed template
                           document.getElementById('template-upload')?.click();
                         }}
                       >
                         <Upload className="mr-2 h-4 w-4 text-gray-900" />
                         Upload Completed Template
                       </Button>
                      <input 
                        id="template-upload" 
                        type="file" 
                        accept=".csv,.xlsx" 
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            simulateFileUpload(Array.from(e.target.files));
                          }
                        }}
                      />
                    </div>
                  </motion.div>

                </div>

                <motion.div 
                  className="mt-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                   <Button 
                     onClick={() => {
                       localStorage.setItem("posOnboardingCompleted", "true");
                       onComplete();
                     }}
                     className="bg-white text-gray-900 hover:bg-white/90 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                   >
                     Continue to Dashboard
                   </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default POSConnectionForm;