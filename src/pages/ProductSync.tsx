import { useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes } from "firebase/storage";
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
      const storageRef = ref(storage, "imports/products.csv");
      await uploadBytes(storageRef, file);
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
      // TODO: Implement Firebase Function for sync
      console.warn("Product sync function not yet migrated to Firebase");

      // Mock success for now to avoid breaking UI flow
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Sync simulada",
        description: "La función de sincronización se migrará a Cloud Functions pronto."
      });
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
