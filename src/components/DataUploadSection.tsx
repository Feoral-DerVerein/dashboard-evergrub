import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileJson, FileText, Sheet, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

const WEBHOOK_URL = 'https://n8n.srv1024074.hstgr.cloud/webhook/fc7630b0-e2eb-44d0-957d-f55162b32271';
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const DataUploadSection = () => {
  const { toast } = useToast();
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const validateGoogleSheetUrl = (url: string): boolean => {
    const googleSheetRegex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
    return googleSheetRegex.test(url);
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast({
        title: "Error",
        description: "Please select a valid JSON file",
        variant: "destructive"
      });
      return;
    }

    // Validate JSON content
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        JSON.parse(event.target?.result as string);
        setJsonFile(file);
        toast({
          title: "JSON file loaded",
          description: `${file.name} is ready to upload`
        });
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "The selected file contains invalid JSON format",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Please select a valid PDF file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      toast({
        title: "File too large",
        description: "PDF file must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    setPdfFile(file);
    toast({
      title: "PDF file loaded",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) is ready to upload`
    });
  };

  const handleSave = async () => {
    // Validate inputs
    if (!jsonFile && !pdfFile && !googleSheetUrl) {
      toast({
        title: "No data to save",
        description: "Please add at least one file or Google Sheets URL",
        variant: "destructive"
      });
      return;
    }

    if (googleSheetUrl && !validateGoogleSheetUrl(googleSheetUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Sheets URL",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      // Read JSON file content
      let jsonData = null;
      if (jsonFile) {
        const jsonText = await jsonFile.text();
        jsonData = JSON.parse(jsonText);
      }

      // Prepare PDF info
      let pdfInfo = null;
      if (pdfFile) {
        pdfInfo = {
          name: pdfFile.name,
          size: pdfFile.size,
          type: pdfFile.type
        };
      }

      // Prepare payload for webhook
      const payload = {
        timestamp: new Date().toISOString(),
        data: {
          json_data: jsonData,
          pdf_info: pdfInfo,
          google_sheet_url: googleSheetUrl || null
        }
      };

      // Send to n8n webhook
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.statusText}`);
      }

      const result = await response.json();
      
      setStatusMessage({
        type: 'success',
        message: 'Data successfully sent to webhook!'
      });

      toast({
        title: "Success",
        description: "Data has been saved to the database successfully"
      });

      // Clear form
      setJsonFile(null);
      setPdfFile(null);
      setGoogleSheetUrl('');
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => {
        (input as HTMLInputElement).value = '';
      });

    } catch (error) {
      console.error('Error uploading data:', error);
      setStatusMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload data'
      });
      
      toast({
        title: "Error",
        description: "Could not save data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* JSON File Upload */}
        <div className="space-y-2">
          <Label htmlFor="json-upload" className="flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Subir archivo JSON
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="json-upload"
              type="file"
              accept=".json,application/json"
              onChange={handleJsonFileChange}
              className="flex-1"
            />
            {jsonFile && (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            )}
          </div>
          {jsonFile && (
            <p className="text-sm text-gray-600">
              Selected: {jsonFile.name}
            </p>
          )}
        </div>

        {/* PDF File Upload */}
        <div className="space-y-2">
          <Label htmlFor="pdf-upload" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Subir archivo PDF
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfFileChange}
              className="flex-1"
            />
            {pdfFile && (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            )}
          </div>
          {pdfFile && (
            <p className="text-sm text-gray-600">
              Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          )}
          <p className="text-xs text-gray-500">
            Maximum file size: 10MB
          </p>
        </div>

        {/* Google Sheets URL */}
        <div className="space-y-2">
          <Label htmlFor="google-sheet-url" className="flex items-center gap-2">
            <Sheet className="w-4 h-4" />
            Conectar Google Sheet
          </Label>
          <Input
            id="google-sheet-url"
            type="url"
            value={googleSheetUrl}
            onChange={(e) => setGoogleSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
          <p className="text-xs text-gray-500">
            Paste the full URL of your Google Sheet
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            statusMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                statusMessage.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {statusMessage.type === 'success' ? 'Success!' : 'Error'}
              </p>
              <p className={`text-sm ${
                statusMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {statusMessage.message}
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Guardar en Base de Datos
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
