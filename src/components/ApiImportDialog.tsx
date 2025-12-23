import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { Product } from "@/services/productService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Database, Globe, Zap } from "lucide-react";

interface ApiImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (products: Product[]) => void;
}

const ApiImportDialog = ({ open, onOpenChange, onImported }: ApiImportDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [posEndpoint, setPosEndpoint] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const handleApiImport = async () => {
    if (!user || !apiUrl) {
      toast({
        title: "Error",
        description: "Please provide a valid API URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch data from external API
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      await processImportData(data);
    } catch (error: any) {
      console.error("API import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import from API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePosImport = async () => {
    if (!user || !posEndpoint) {
      toast({
        title: "Error",
        description: "Please provide a valid POS endpoint",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Common POS system endpoints
      const response = await fetch(posEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`POS system request failed: ${response.statusText}`);
      }

      const data = await response.json();
      await processImportData(data);
    } catch (error: any) {
      console.error("POS import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import from POS system",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJsonImport = async () => {
    if (!user || !jsonData) {
      toast({
        title: "Error",
        description: "Please provide valid JSON data",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = JSON.parse(jsonData);
      await processImportData(data);
    } catch (error: any) {
      console.error("JSON import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Invalid JSON format",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWebhookTrigger = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your webhook URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          action: "import_products",
          user_id: user?.uid,
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      toast({
        title: "Webhook Triggered",
        description: "Import request sent successfully. Products should appear shortly.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processImportData = async (data: any) => {
    try {
      // Normalize the data - handle different API response formats
      let products = [];

      if (Array.isArray(data)) {
        products = data;
      } else if (data.products && Array.isArray(data.products)) {
        products = data.products;
      } else if (data.items && Array.isArray(data.items)) {
        products = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        products = data.data;
      } else {
        throw new Error("No valid product array found in the response");
      }

      // Map the products to our format
      const mappedProducts = products.map((item: any) => ({
        name: item.name || item.title || item.product_name || 'Unknown Product',
        price: parseFloat(item.price || item.cost || item.amount || 0),
        discount: parseFloat(item.discount || item.discount_percent || 0),
        description: item.description || item.details || item.summary || '',
        category: item.category || item.type || 'Restaurant',
        brand: item.brand || item.manufacturer || item.vendor || 'Generic',
        quantity: parseInt(item.quantity || item.stock || item.inventory || 1),
        expirationDate: item.expiration_date || item.expiry || item.best_before || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        image: item.image || item.image_url || item.picture || '',
        user_id: user?.uid,
      }));

      // Send to our import edge function (Mocked pending Cloud Functions)
      // const { data: importResult, error } = await supabase.functions.invoke('import-products', { body: { products: mappedProducts, user_id: user?.uid } });

      console.log('Importing products (Mocked):', mappedProducts);
      const importResult = { inserted: mappedProducts.length };
      const error = null;

      if (error) {
        throw error;
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${importResult.inserted} products`,
      });

      // Convert to Product format for callback
      const importedProducts: Product[] = mappedProducts.map((p: any, index: number) => ({
        id: index + Date.now(), // Temporary ID
        name: p.name,
        price: p.price,
        discount: p.discount,
        description: p.description,
        category: p.category,
        brand: p.brand,
        quantity: p.quantity,
        expirationDate: p.expirationDate,
        image: p.image,
        storeId: "4",
        userId: user?.uid || "",
        createdAt: new Date().toISOString(),
        isMarketplaceVisible: true,
      }));

      onImported(importedProducts);
      onOpenChange(false);

      // Reset form
      setApiUrl("");
      setApiKey("");
      setPosEndpoint("");
      setJsonData("");
      setWebhookUrl("");

    } catch (error: any) {
      console.error("Process import error:", error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Import Products from External Sources
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Supported Import Methods:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>REST APIs with JSON responses</li>
                  <li>POS system endpoints (Square, Shopify, etc.)</li>
                  <li>Direct JSON data paste</li>
                  <li>Webhook triggers for automated imports</li>
                </ul>
              </div>
            </div>
          </div>

          <Tabs defaultValue="api" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="api" className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                API
              </TabsTrigger>
              <TabsTrigger value="pos" className="flex items-center gap-1">
                <Database className="w-4 h-4" />
                POS
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                JSON
              </TabsTrigger>
              <TabsTrigger value="webhook" className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Webhook
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-4">
              <div>
                <Label htmlFor="apiUrl">API Endpoint URL</Label>
                <Input
                  id="apiUrl"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.yourstore.com/products"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="apiKey">API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Your API key or token"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleApiImport} disabled={loading} className="w-full">
                {loading ? "Importing..." : "Import from API"}
              </Button>
            </TabsContent>

            <TabsContent value="pos" className="space-y-4">
              <div>
                <Label htmlFor="posEndpoint">POS System Endpoint</Label>
                <Input
                  id="posEndpoint"
                  value={posEndpoint}
                  onChange={(e) => setPosEndpoint(e.target.value)}
                  placeholder="https://connect.squareup.com/v2/catalog/list"
                  className="mt-1"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Popular POS Systems:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Square: /v2/catalog/list</li>
                  <li>Shopify: /admin/api/products.json</li>
                  <li>Clover: /v3/merchants/inventory/items</li>
                  <li>Toast: /restaurants/inventory</li>
                </ul>
              </div>
              <Button onClick={handlePosImport} disabled={loading} className="w-full">
                {loading ? "Importing..." : "Import from POS"}
              </Button>
            </TabsContent>

            <TabsContent value="json" className="space-y-4">
              <div>
                <Label htmlFor="jsonData">JSON Data</Label>
                <Textarea
                  id="jsonData"
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder={`[
  {
    "name": "Product Name",
    "price": 19.99,
    "description": "Product description",
    "category": "Restaurant",
    "brand": "Brand Name",
    "quantity": 10
  }
]`}
                  className="mt-1 h-48 font-mono text-sm"
                />
              </div>
              <Button onClick={handleJsonImport} disabled={loading} className="w-full">
                {loading ? "Processing..." : "Import JSON Data"}
              </Button>
            </TabsContent>

            <TabsContent value="webhook" className="space-y-4">
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="mt-1"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>This will trigger an external webhook that should send product data back to our import endpoint.</p>
              </div>
              <Button onClick={handleWebhookTrigger} disabled={loading} className="w-full">
                {loading ? "Triggering..." : "Trigger Webhook Import"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiImportDialog;