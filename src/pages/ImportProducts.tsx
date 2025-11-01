import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChatFileUploadCard } from "@/components/chat/ChatFileUploadCard";

const defaultProducts = `[
  {
    "name": "Producto demo",
    "price": 9.99,
    "quantity": 10,
    "category": "General",
    "description": "Descripción opcional",
    "brand": "Generic",
    "image": "https://example.com/imagen.jpg",
    "is_marketplace_visible": true
  }
]`;

const ImportProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [payload, setPayload] = useState(defaultProducts);
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Sesión requerida", description: "Inicia sesión para importar.", variant: "destructive" });
      return;
    }

    let products: any;
    try {
      const parsed = JSON.parse(payload);
      products = Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      toast({ title: "JSON inválido", description: "Revisa el formato del listado de productos.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-products", {
        body: {
          user_id: user.id,
          products,
        },
        headers: apiKey ? {
          "x-import-api-key": apiKey,
        } : {},
      });

      if (error) throw error;

      toast({
        title: "Importación enviada",
        description: `Recibidos: ${data?.received || 0} • Insertados: ${data?.inserted || 0} • Fallidos: ${data?.failed || 0}`,
      });
    } catch (err: any) {
      console.error("Error invoking import-products:", err);
      toast({ title: "Error al importar", description: err?.message || "Inténtalo de nuevo", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Importar productos</h1>
        <p className="text-sm text-gray-500">Puedes usar tu sesión; la IMPORT_API_KEY es opcional.</p>
      </header>

      <section className="max-w-2xl space-y-6">
        {/* File Upload Card */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Subir archivo Excel o CSV</h2>
          <ChatFileUploadCard />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O usa JSON</span>
          </div>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">IMPORT_API_KEY</label>
            <Input
              type="password"
              placeholder="Pega aquí tu IMPORT_API_KEY"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Productos (JSON)</label>
            <Textarea
              rows={10}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
            <p className="text-xs text-gray-500">Puedes pegar un objeto o un array; lo convertiremos a array automáticamente.</p>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Importando..." : "Enviar importación"}
          </Button>
        </form>
      </section>
    </main>
  );
};

export default ImportProducts;
