
import { useToast as useToastOriginal, toast as toastOriginal } from "@/hooks/use-toast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

// Define the ToasterToast type here since it's not exported from toast.tsx
type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
};

// Create a wrapper for the toast function to handle different variants
const enhancedToast = Object.assign({}, toastOriginal, {
  error: (message: string) => toastOriginal({
    title: "Error",
    description: message,
    variant: "destructive",
  }),
  success: (message: string) => toastOriginal({
    title: "Success",
    description: message,
    variant: "success",
  }),
  info: (message: string) => toastOriginal({
    title: "Info",
    description: message,
    variant: "info",
  }),
  warning: (message: string) => toastOriginal({
    title: "Warning",
    description: message,
    variant: "warning",
  })
});

// Export both the original toast function and the enhanced version
export const useToast = useToastOriginal;
export const toast = enhancedToast;
