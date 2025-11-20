import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import * as XLSX from 'xlsx';

export const ProductImportCard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona un archivo CSV o Excel",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    toast({
      title: "Archivo seleccionado",
      description: `${file.name} listo para importar`
    });
  };

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error leyendo el archivo'));
      reader.readAsBinaryString(file);
    });
  };

  const normalizeProductData = (row: any) => {
    const normalizeKey = (key: string) => key.toLowerCase().trim().replace(/\s+/g, '_');
    const normalized: any = {};
    
    Object.keys(row).forEach(key => {
      const normalizedKey = normalizeKey(key);
      normalized[normalizedKey] = row[key];
    });

    return {
      name: normalized.name || normalized.nombre || normalized.producto || normalized.product || 'Sin nombre',
      category: normalized.category || normalized.categoria || 'General',
      brand: normalized.brand || normalized.marca || '',
      price: parseFloat(normalized.price || normalized.precio || '0') || 0,
      quantity: parseInt(normalized.quantity || normalized.cantidad || normalized.stock || '0') || 0,
      description: normalized.description || normalized.descripcion || '',
      expirationdate: normalized.expiration_date || normalized.fecha_expiracion || normalized.expiry_date || 
                      normalized.expirationdate || new Date().toISOString().split('T')[0],
      ean: normalized.ean || normalized.barcode || normalized.codigo_barras || null,
      sku: normalized.sku || normalized.codigo || null,
      original_price: parseFloat(normalized.original_price || normalized.precio_original || '0') || null,
      image: normalized.image || normalized.imagen || '',
      userid: user!.id
    };
  };

  const handleUpload = async () => {
    if (!user) {
      toast({
        title: "Autenticación requerida",
        description: "Debes iniciar sesión para importar productos",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Sin archivo",
        description: "Por favor selecciona un archivo para importar",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const jsonData = await parseExcelFile(selectedFile);
      
      if (jsonData.length === 0) {
        toast({
          title: "Archivo vacío",
          description: "El archivo no contiene datos",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }

      console.log('📊 Datos parseados:', jsonData.length, 'filas');

      const products = jsonData.map(row => normalizeProductData(row));
      
      console.log('📦 Productos normalizados:', products.length);

      const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();

      if (error) {
        console.error('❌ Error insertando productos:', error);
        throw error;
      }

      toast({
        title: "✅ Importación exitosa",
        description: `${data.length} productos importados correctamente`,
      });

      setSelectedFile(null);
      const fileInput = document.getElementById('product-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('❌ Error en importación:', error);
      toast({
        title: "Error en importación",
        description: error.message || "No se pudieron importar los productos",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileSpreadsheet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle>Importar Productos</CardTitle>
            <CardDescription>
              Sube archivos CSV o Excel con tus productos
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              id="product-file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={isUploading}
              className="cursor-pointer"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{selectedFile.name}</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Importar Productos
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Columnas aceptadas:</strong></p>
          <p>name/nombre, category/categoria, price/precio, quantity/cantidad, description/descripcion, brand/marca, ean, sku, expiration_date/fecha_expiracion</p>
        </div>
      </CardContent>
    </Card>
  );
};
