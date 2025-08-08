import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { productService, Product } from "@/services/productService";
import { productImageSuggestService } from "@/services/productImageSuggestService";
import { productImageService } from "@/services/productImageService";
import { useAuth } from "@/context/AuthContext";
import { Upload, FileSpreadsheet, ListChecks } from "lucide-react";
import * as XLSX from "xlsx";
interface BulkImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: (created: Product[]) => void;
}

// Minimal column mapping helper
const getVal = (row: any, keys: string[], fallback: any = "") => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).length > 0) return row[k];
  }
  return fallback;
};

export default function BulkImportProductsDialog({ open, onOpenChange, onImported }: BulkImportProductsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [parsed, setParsed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pasted, setPasted] = useState("");

  const canImport = useMemo(() => parsed.length > 0 && !!user?.id, [parsed.length, user?.id]);

  const mapRowToProduct = (row: any): Product | null => {
    const name = String(getVal(row, ["name", "Name", "nombre", "Nombre", "product", "Product"]).trim());
    if (!name) return null;
    const price = Number(getVal(row, ["price", "Price", "precio", "Precio"], 0)) || 0;
    const quantity = Number(getVal(row, ["quantity", "Quantity", "qty", "Qty"], 0)) || 0;
    const category = String(getVal(row, ["category", "Category", "categoria", "Categoría"], "General"));
    const brand = String(getVal(row, ["brand", "Brand"], ""));
    const description = String(getVal(row, ["description", "Description", "descripcion", "Descripción"], ""));
    const barcode = String(getVal(row, ["barcode", "Barcode", "EAN", "SKU"], "")) || undefined;
    const expirationDate = String(getVal(row, ["expirationDate", "expiration_date", "caducidad", "vencimiento"], ""));
    const image = String(getVal(row, ["image", "Image", "imagen"], "/placeholder.svg"));

    if (!user?.id) return null;

    const product: Product = {
      name,
      price,
      discount: 0,
      description,
      category,
      brand,
      quantity,
      expirationDate,
      image,
      userId: user.id,
      barcode,
    };
    return product;
  };

  const handleFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const mapped = rows.map(mapRowToProduct).filter(Boolean) as Product[];
      setParsed(mapped);
      toast({ title: "Archivo cargado", description: `${mapped.length} productos detectados` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error al leer el archivo", description: e?.message || "Revisa el formato", variant: "destructive" });
    }
  };

  const handleProcessPasted = () => {
    try {
      const lines = pasted.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) {
        toast({ title: "Lista vacía", description: "Incluye encabezados y al menos una fila" });
        return;
      }
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(",");
        const row: any = {};
        headers.forEach((h, i) => (row[h] = cols[i] ?? ""));
        return row;
      });
      const mapped = rows.map(mapRowToProduct).filter(Boolean) as Product[];
      setParsed(mapped);
      toast({ title: "Lista procesada", description: `${mapped.length} productos detectados` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error al procesar la lista", description: e?.message || "Revisa el formato", variant: "destructive" });
    }
  };

  const handleImport = async () => {
    if (!canImport) return;
    setLoading(true);
    try {
      const created: Product[] = [];
      for (const p of parsed) {
        try {
          let imageToUse = (p.image || '').trim();
          if (!imageToUse || imageToUse === '/placeholder.svg') {
            const suggested = await productImageSuggestService.suggestImage(p.barcode, p.name);
            if (suggested && user?.id) {
              const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
              try {
                imageToUse = await productImageService.uploadImageFromUrl(suggested, path);
              } catch (e) {
                console.warn('Upload from URL failed for', p.name, e);
              }
            }
          }

          const c = await productService.createProduct({ ...p, image: imageToUse || p.image });
          created.push(c);
        } catch (e) {
          console.error("Error creando producto", p.name, e);
        }
      }
      onImported?.(created);
      toast({ title: "Importación completa", description: `${created.length} productos creados` });
      setParsed([]);
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Error en importación", description: e?.message || "Intenta nuevamente", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar productos</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant={mode === "file" ? "default" : "outline"} size="sm" onClick={() => setMode("file")} className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Archivo (Excel/CSV)
          </Button>
          <Button variant={mode === "paste" ? "default" : "outline"} size="sm" onClick={() => setMode("paste")} className="flex items-center gap-2">
            <ListChecks className="w-4 h-4" /> Lista pegada
          </Button>
        </div>

        {mode === "file" ? (
          <div className="space-y-3">
            <Input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
            <p className="text-sm text-muted-foreground">
              Columnas sugeridas: name, price, quantity, category, brand, description, barcode, image, expirationDate
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={"name,price,quantity,category\nAgua,2.5,100,Bebidas"}
              className="min-h-32"
            />
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={handleProcessPasted}>Procesar lista</Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">Detectados: {parsed.length}</div>
          <Button onClick={handleImport} disabled={!canImport || loading} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {loading ? "Importando..." : `Importar ${parsed.length} productos`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
