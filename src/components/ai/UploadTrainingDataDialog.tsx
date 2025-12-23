import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes } from "firebase/storage";
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
      toast.error("You must log in to upload data.");
      return;
    }
    if (!files || files.length === 0) {
      toast.error("Select at least one file.");
      return;
    }
    if (files.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files per upload.`);
      return;
    }
    setIsUploading(true);
    try {
      const uploads = Array.from(files).map(async (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "dat";
        const time = new Date().toISOString().replace(/[:.]/g, "-");
        // Use user.uid instead of user.id
        const path = `ai-training/${user?.uid}/${time}-${file.name}`;

        const storageRef = ref(storage, path);
        const metadata = {
          contentType: file.type || `application/${ext}`,
        };

        await uploadBytes(storageRef, file, metadata);
        return path;
      });

      const paths = await Promise.all(uploads);

      toast.success(
        `Uploaded ${paths.length} file(s). Training will be enabled when API key is configured.`
      );
      setOpen(false);
      setFiles(null);
    } catch (err: any) {
      console.error("Upload error", err);
      toast.error(err?.message || "Could not upload files.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full max-w-lg" variant="secondary">
          Upload AI Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Training Data</DialogTitle>
          <DialogDescription>
            Accepts multiple formats (CSV, XLSX, PDF, images, text). Files
            will be stored privately by company to train recommendations,
            forecasting and dashboard summaries.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            aria-label="Select files for AI training"
            className="block w-full text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Supported formats: {ACCEPTED_TYPES.join(", ")}. Max. {MAX_FILES}
            files per upload.
          </p>
          <div className="rounded-md bg-muted p-3 text-xs">
            Tip: for best results, upload sales extracts, inventory,
            product lists, order history and operational notes.
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadTrainingDataDialog;
