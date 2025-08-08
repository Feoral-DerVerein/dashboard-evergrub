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

  // Header normalization helpers (to tolerate accents, spaces, symbols and case)
  const normalizeKey = (s: string) =>
    String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .toLowerCase()
      .replace(/[\s_\-\/]+/g, "") // collapse separators
      .replace(/[^a-z0-9]/g, ""); // strip non-alphanumerics

  // Common header synonyms (normalized)
  const NAME_KEYS = ["name", "nombre", "producto", "product", "item", "titulo"];
  const PRICE_KEYS = ["price", "precio", "preciounitario", "unitprice", "coste", "costo"];
  const QTY_KEYS = ["quantity", "qty", "cantidad", "stock", "unidades"];
  const CATEGORY_KEYS = ["category", "categoria", "rubro", "tipo", "seccion"];
  const BRAND_KEYS = ["brand", "marca"];
  const DESC_KEYS = ["description", "descripcion", "detalle", "notas"];
  const BARCODE_KEYS = ["barcode", "ean", "sku", "codigo", "codigodebarras"];
  const IMAGE_KEYS = ["image", "imagen", "urlimagen", "foto", "photo", "picture"];
  const EXPIRATION_KEYS = [
    "expirationdate",
    "expiration_date",
    "fechavencimiento",
    "caducidad",
    "vencimiento",
    "fechadecaducidad"
  ];
export default function BulkImportProductsDialog({ open, onOpenChange, onImported }: BulkImportProductsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [parsed, setParsed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pasted, setPasted] = useState("");

  const canImport = useMemo(() => parsed.length > 0 && !!user?.id, [parsed.length, user?.id]);

  const mapRowToProduct = (row: any): Product | null => {
    // Build a normalized key->value map for robust header matching
    const normalizedRow: Record<string, any> = {};
    Object.keys(row || {}).forEach((k) => {
      normalizedRow[normalizeKey(k)] = row[k];
    });

    const getSmart = (keys: string[], fallback: any = "") => {
      // Try original keys first
      const direct = getVal(row, keys, "__MISSING__");
      if (direct !== "__MISSING__") return direct;

      // Then try normalized keys
      for (const key of keys) {
        const nk = normalizeKey(key);
        if (normalizedRow[nk] !== undefined && normalizedRow[nk] !== null && String(normalizedRow[nk]).length > 0) {
          return normalizedRow[nk];
        }
      }
      return fallback;
    };

    const nameRaw = getSmart(NAME_KEYS, "");
    const name = String(String(nameRaw).trim());
    if (!name) return null;

    const price = Number(getSmart(PRICE_KEYS, 0)) || 0;
    const quantity = Number(getSmart(QTY_KEYS, 0)) || 0;
    const category = String(getSmart(CATEGORY_KEYS, "General"));
    const brand = String(getSmart(BRAND_KEYS, ""));
    const description = String(getSmart(DESC_KEYS, ""));
    const barcodeVal = String(getSmart(BARCODE_KEYS, "")).trim();
    const barcode = barcodeVal ? barcodeVal : undefined;
    const expirationDate = String(getSmart(EXPIRATION_KEYS, ""));
    const image = String(getSmart(IMAGE_KEYS, "/placeholder.svg"));

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
      const ext = file.name.split(".").pop()?.toLowerCase();
      let wb: XLSX.WorkBook;

      if (ext === "csv") {
        // CSV must be read as text
        const text = await file.text();
        wb = XLSX.read(text, { type: "string" });
      } else {
        // XLSX/XLS as ArrayBuffer
        const data = await file.arrayBuffer();
        wb = XLSX.read(data, { type: "array" });
      }

      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const mapped = rows.map(mapRowToProduct).filter(Boolean) as Product[];
      setParsed(mapped);
      toast({
        title: "Archivo cargado",
        description: mapped.length > 0 ? `${mapped.length} productos detectados` : "No se detectaron productos. Revisa los encabezados (ej.: nombre, precio, cantidad).",
        variant: mapped.length > 0 ? "default" : "destructive",
      });
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
                imageToUse = suggested; // fallback to external URL so it still displays
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
