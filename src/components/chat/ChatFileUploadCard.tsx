import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, FileText, Image, File, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

interface ChatFileUploadCardProps {
  onUploadComplete: (url: string, fileName: string, fileType: string) => void;
  allowedTypes?: string[]; // e.g., ['image/png', 'application/pdf']
  maxSizeMB?: number;
}

export const ChatFileUploadCard = ({
  onUploadComplete,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  maxSizeMB = 10
}: ChatFileUploadCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    // Validation
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      toast.error(`File type not allowed. Supported types: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `chat-uploads/${fileName}`;

      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      setUploadProgress(100);

      const publicUrl = await getDownloadURL(storageRef);

      onUploadComplete(publicUrl, file.name, file.type);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="w-full max-w-sm bg-background border-dashed border-2 hover:border-primary transition-colors">
      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept={allowedTypes.join(',')}
        />

        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          ) : (
            <Upload className="w-6 h-6 text-primary" />
          )}
        </div>

        <div>
          <p className="font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">
            Max file size: {maxSizeMB}MB
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Select File'}
        </Button>
      </CardContent>
    </Card>
  );
};
