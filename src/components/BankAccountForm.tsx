import { useState } from "react";
import { Building, CreditCard, Globe, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { storeProfileService } from "@/services/storeProfileService";
import { PaymentDetails, StoreProfile } from "@/types/store.types";
import { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const BankAccountForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [merchantDetails, setMerchantDetails] = useState<PaymentDetails>({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    routingNumber: "",
    paymentMethod: "bank",
    paypalEmail: "",
    currency: "USD",
  });
  
  // Load existing payment details if available
  const loadPaymentDetails = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const storeProfile = await storeProfileService.getStoreProfile(user.id);
      
      if (storeProfile?.paymentDetails) {
        setMerchantDetails({
          ...merchantDetails,
          ...storeProfile.paymentDetails
        });
      }
    } catch (error) {
      console.error("Error loading payment details:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load payment details when component mounts
  useEffect(() => {
    loadPaymentDetails();
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format account number and routing number to only allow digits
    if (name === "accountNumber" || name === "routingNumber") {
      const formattedValue = value.replace(/\D/g, '');
      setMerchantDetails(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    setMerchantDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setMerchantDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save payment details",
        variant: "destructive"
      });
      return;
    }
    
    // Validate form based on payment method
    if (merchantDetails.paymentMethod === "bank") {
      if (!merchantDetails.bankName) {
        toast({
          title: "Error", 
          description: "Please enter bank name",
          variant: "destructive"
        });
        return;
      }
      
      if (!merchantDetails.accountNumber) {
        toast({
          title: "Error", 
          description: "Please enter account number",
          variant: "destructive"
        });
        return;
      }
      
      if (!merchantDetails.accountHolder) {
        toast({
          title: "Error", 
          description: "Please enter account holder name",
          variant: "destructive"
        });
        return;
      }
      
      if (!merchantDetails.routingNumber) {
        toast({
          title: "Error", 
          description: "Please enter BSB number",
          variant: "destructive"
        });
        return;
      }
    } else if (merchantDetails.paymentMethod === "paypal") {
      if (!merchantDetails.paypalEmail) {
        toast({
          title: "Error", 
          description: "Please enter your PayPal email",
          variant: "destructive"
        });
        return;
      }
    }
    
    setSaving(true);
    
    try {
      // Get existing profile or create minimal one
      let storeProfile = await storeProfileService.getStoreProfile(user.id);
      
      if (!storeProfile) {
        // Create a basic profile with payment details
        storeProfile = {
          userId: user.id,
          name: "",
          description: "",
          location: "",
          contactPhone: "",
          contactEmail: "",
          socialFacebook: "",
          socialInstagram: "",
          logoUrl: "",
          coverUrl: "",
          categories: [],
          businessHours: [],
          paymentDetails: merchantDetails
        };
      } else {
        // Update existing profile with payment details
        storeProfile.paymentDetails = merchantDetails;
      }
      
      const result = await storeProfileService.saveStoreProfile(storeProfile);
      
      if (result) {
        toast({
          title: "Success",
          description: "Payment details saved successfully"
        });
      } else {
        throw new Error("Could not save payment information");
      }
    } catch (error) {
      console.error("Error saving payment details:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving payment information",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete payment details",
        variant: "destructive"
      });
      return;
    }
    
    setDeleting(true);
    
    try {
      // Get existing profile
      let storeProfile = await storeProfileService.getStoreProfile(user.id);
      
      if (storeProfile) {
        // Reset payment details
        storeProfile.paymentDetails = {
          bankName: "",
          accountNumber: "",
          accountHolder: "",
          routingNumber: "",
          paymentMethod: "bank",
          paypalEmail: "",
          currency: "USD"
        };
        
        const result = await storeProfileService.saveStoreProfile(storeProfile);
        
        if (result) {
          // Reset form state
          setMerchantDetails({
            bankName: "",
            accountNumber: "",
            accountHolder: "",
            routingNumber: "",
            paymentMethod: "bank",
            paypalEmail: "",
            currency: "USD"
          });
          
          setShowDeleteDialog(false);
          
          toast({
            title: "Success",
            description: "Payment details deleted successfully"
          });
        } else {
          throw new Error("Could not delete payment information");
        }
      }
    } catch (error) {
      console.error("Error deleting payment details:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting payment information",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading payment data...</span>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Bank Account Details</CardTitle>
        <CardDescription>
          Set up your account to receive payments from the marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select 
              value={merchantDetails.paymentMethod} 
              onValueChange={(value) => handleSelectChange("paymentMethod", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Account</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={merchantDetails.currency} 
              onValueChange={(value) => handleSelectChange("currency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {merchantDetails.paymentMethod === "bank" && (
            <>
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <div className="relative">
                  <Select
                    value={merchantDetails.bankName}
                    onValueChange={(value) => handleSelectChange("bankName", value)}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANZ">ANZ Bank</SelectItem>
                      <SelectItem value="Commonwealth">Commonwealth Bank</SelectItem>
                      <SelectItem value="Westpac">Westpac</SelectItem>
                      <SelectItem value="NAB">National Australia Bank</SelectItem>
                      <SelectItem value="Bendigo">Bendigo Bank</SelectItem>
                      <SelectItem value="Other">Other Bank</SelectItem>
                    </SelectContent>
                  </Select>
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input
                  id="accountHolder"
                  name="accountHolder"
                  placeholder="John Smith"
                  value={merchantDetails.accountHolder}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <div className="relative">
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    placeholder="123456789"
                    value={merchantDetails.accountNumber}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="routingNumber">BSB Number</Label>
                <Input
                  id="routingNumber"
                  name="routingNumber"
                  placeholder="123456"
                  value={merchantDetails.routingNumber}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}
          
          {merchantDetails.paymentMethod === "paypal" && (
            <div>
              <Label htmlFor="paypalEmail">PayPal Email</Label>
              <div className="relative">
                <Input
                  id="paypalEmail"
                  name="paypalEmail"
                  placeholder="your-email@example.com"
                  value={merchantDetails.paypalEmail}
                  onChange={handleInputChange}
                  className="pl-10"
                />
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
          )}
          
          <div className="flex gap-4 mt-4">
            <Button 
              type="button" 
              className="flex-1" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Payment Details
                </>
              )}
            </Button>
            
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive"
                  className="flex-1" 
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={
                    deleting || 
                    (!merchantDetails.bankName && !merchantDetails.paypalEmail)
                  }
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Details
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will delete your payment details. You cannot undo this action.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Your payment information is secure and encrypted. This information will be used to process marketplace payments.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
