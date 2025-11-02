import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

const ImportProducts = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('data', file);
      formData.append('filename', file.name);
      formData.append('mimeType', file.type);

      const response = await fetch('https://n8n.srv1024074.hstgr.cloud/webhook-test/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json().catch(() => ({}));

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been sent to n8n webhook`,
      });

      console.log('Upload response:', result);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error uploading file",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <main className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Import Products</h1>
        <p className="text-sm text-muted-foreground">Upload Excel or CSV files to import products into your dashboard.</p>
      </header>

      <section className="max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Upload File</h3>
                <p className="text-sm text-muted-foreground">
                  Select a file to upload to the webhook
                </p>
              </div>

              <div>
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    disabled={isUploading}
                    className="w-full"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
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
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default ImportProducts;
