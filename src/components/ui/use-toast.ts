
import { useToast, toast } from "@/hooks/use-toast";

// Create a wrapper for the toast function to handle different variants
const enhancedToast = {
  ...toast,
  error: (message: string) => toast({
    title: "Error",
    description: message,
    variant: "destructive",
  }),
  success: (message: string) => toast({
    title: "Success",
    description: message,
    variant: "success",
  }),
  info: (message: string) => toast({
    title: "Info",
    description: message,
    variant: "info",
  }),
  warning: (message: string) => toast({
    title: "Warning",
    description: message,
    variant: "warning",
  })
};

// Export the enhanced toast as 'toast'
export { useToast, enhancedToast as toast };
