import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompleteProfileProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
  email: string;
}

const CompleteProfile = ({ open, onComplete, userId, email }: CompleteProfileProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !country || !businessType) {
      toast({
        title: "Error",
        description: "Please complete all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: phoneNumber,
          country: country,
          business_type: businessType
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Profile completed",
        description: "Welcome to Negentropy!"
      });
      
      onComplete();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide additional information to complete your registration
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Input
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Input
              type="text"
              placeholder="Business Type (e.g., Cafe, Restaurant)"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Complete Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteProfile;
