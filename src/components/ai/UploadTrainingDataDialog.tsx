import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ACCEPTED_TYPES = [
  ".csv",
  ".xlsx",
  ".xls",
  ".json",
  ".pdf",
  ".txt",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const MAX_FILES = 20;

const UploadTrainingDataDialog: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para subir datos.");
      return;
    }
    if (!files || files.length === 0) {
      toast.error("Selecciona al menos un archivo.");
      return;
    }
    if (files.length > MAX_FILES) {
      toast.error(`Máximo ${MAX_FILES} archivos por subida.`);
      return;
    }
    setIsUploading(true);
    try {
      const uploads = Array.from(files).map(async (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "dat";
        const time = new Date().toISOString().replace(/[:.]/g, "-");
        const path = `${user.id}/${time}-${file.name}`;
        const { error } = await supabase.storage
          .from("ai-training")
          .upload(path, file, {
            upsert: true,
            contentType: file.type || `application/${ext}`,
          });
        if (error) throw error;
        return path;
      });

      const paths = await Promise.all(uploads);

      toast.success(
        `Se cargaron ${paths.length} archivo(s). El entrenamiento se habilitará cuando esté configurada la API key.`
      );
      setOpen(false);
      setFiles(null);
    } catch (err: any) {
      console.error("Upload error", err);
      toast.error(err?.message || "No se pudieron subir los archivos.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full max-w-lg" variant="secondary">
          Cargar datos IA
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir datos para entrenamiento</DialogTitle>
          <DialogDescription>
            Acepta múltiples formatos (CSV, XLSX, PDF, imágenes, texto). Los
            archivos se guardarán de forma privada por empresa para entrenar las
            recomendaciones, forecasting y resúmenes del dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            aria-label="Selecciona archivos para entrenamiento de IA"
            className="block w-full text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Formatos soportados: {ACCEPTED_TYPES.join(", ")}. Máx. {MAX_FILES}
            archivos por subida.
          </p>
          <div className="rounded-md bg-muted p-3 text-xs">
            Consejo: para mejores resultados, sube extractos de ventas, inventario,
            lista de productos, historial de pedidos y notas operativas.
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Subiendo..." : "Subir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadTrainingDataDialog;
