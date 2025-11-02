import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

export const ChatFileUploadCard = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({
        title: "Invalid Format",
        description: "Please select an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to upload files",
          variant: "destructive"
        });
        return;
      }

      // Read and parse the file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Parsed data:', jsonData);

      // Get store profile
      const { data: storeProfile } = await supabase
        .from('store_profiles')
        .select('name, categories')
        .eq('userId', user.id)
        .maybeSingle();

      // Save to database
      const { error } = await supabase
        .from('uploaded_data')
        .insert([{
          user_id: user.id,
          business_name: storeProfile?.name || 'Unknown',
          business_type: storeProfile?.categories?.[0] || 'Unknown',
          json_data: jsonData as any,
          pdf_info: null,
          google_sheet_url: null
        }]);

      if (error) throw error;

      setUploadedFileName(file.name);
      toast({
        title: "✅ File uploaded successfully",
        description: `${file.name} - ${jsonData.length} rows processed. The chatbot can now access this data.`
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error uploading file",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <Card className="glass-card-chatbot overflow-hidden">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Upload Database</h3>
            <p className="text-sm text-muted-foreground">
              Upload Excel or CSV files for the chatbot to analyze your data
            </p>
          </div>

          {uploadedFileName && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Last file: {uploadedFileName}</span>
            </div>
          )}

          <div>
            <input
              type="file"
              id="chat-file-upload"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <label htmlFor="chat-file-upload">
              <Button
                type="button"
                disabled={isUploading}
                className="w-full"
                onClick={() => document.getElementById('chat-file-upload')?.click()}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </>
                )}
              </Button>
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            Supported formats: Excel (.xlsx, .xls) and CSV
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
