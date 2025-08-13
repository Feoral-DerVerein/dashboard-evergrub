import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const ProductSync = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Selecciona un archivo", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const { error } = await supabase.storage.from("imports").upload("products.csv", file, { upsert: true });
      if (error) throw error;
      toast({ title: "CSV subido", description: "Se guardó en imports/products.csv" });
    } catch (e: any) {
      toast({ title: "Error al subir", description: e?.message || "Inténtalo de nuevo", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunNow = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-products-from-storage", {
        body: { path: "products.csv" },
      });
      if (error) throw error;
      toast({ title: "Sync ejecutada", description: `Insertados: ${data?.inserted || 0} • Fallidos: ${data?.failed || 0}` });
    } catch (e: any) {
      toast({ title: "Error al ejecutar", description: e?.message || "Revisa logs", variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Sync de productos (CSV)</h1>
        <p className="text-sm text-gray-500">Sube un CSV y ejecútalo ahora o espera la sync nocturna (03:00 UTC).</p>
      </header>

      <section className="space-y-3 max-w-xl">
        <a
          href="/products-template.csv"
          download
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm"
        >
          Descargar plantilla CSV
        </a>
        <div className="flex items-center gap-3">
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Subiendo..." : "Subir CSV"}
          </Button>
        </div>
        <Button variant="secondary" onClick={handleRunNow} disabled={isRunning}>
          {isRunning ? "Ejecutando..." : "Ejecutar ahora"}
        </Button>
        <p className="text-xs text-gray-500">Ruta usada: imports/products.csv • Columnas: name, price, quantity, category, brand, description, barcode, image, expirationDate, userid, storeid</p>
      </section>
    </main>
  );
};

export default ProductSync;
