import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, CheckCircle, Loader2, Building, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { storeProfileService } from "@/services/storeProfileService";

const PaymentPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentStep, setPaymentStep] = useState("details"); // details, processing, success
  const [activeTab, setActiveTab] = useState("customer"); // customer, merchant
  
  // Customer payment details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvc: "",
  });
  
  // Merchant payment details
  const [merchantDetails, setMerchantDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    routingNumber: "",
    paymentMethod: "bank", // bank, paypal
    paypalEmail: "",
    currency: "USD",
  });
  
  // Get the plan information from location state
  const plan = location.state?.plan;
  
  useEffect(() => {
    if (!plan && activeTab === "customer") {
      toast.error("No plan selected. Redirecting to ad creation page.");
      navigate("/ads/create");
    }
    
    // If we're in merchant mode, try to load existing payment details
    if (activeTab === "merchant" && user) {
      loadMerchantDetails();
    }
  }, [plan, navigate, activeTab, user]);

  const loadMerchantDetails = async () => {
    if (!user?.id) return;
    
    try {
      const storeProfile = await storeProfileService.getStoreProfile(user.id);
      
      if (storeProfile && storeProfile.paymentDetails) {
        // If the profile has payment details, load them
        setMerchantDetails({
          ...merchantDetails,
          ...storeProfile.paymentDetails
        });
      }
    } catch (error) {
      console.error("Error loading merchant details:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (activeTab === "customer") {
      // Format card number with spaces every 4 digits
      if (name === "cardNumber") {
        const formattedValue = value
          .replace(/\s/g, '') // Remove existing spaces
          .replace(/\D/g, '') // Remove non-digits
          .slice(0, 16) // Limit to 16 digits
          .replace(/(\d{4})(?=\d)/g, '$1 '); // Add space every 4 digits
        
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
        return;
      }
      
      // Format expiry date as MM/YY
      if (name === "expiryDate") {
        const cleaned = value.replace(/\D/g, '').slice(0, 4);
        let formattedValue = cleaned;
        if (cleaned.length > 2) {
          formattedValue = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
        return;
      }
      
      // Limit CVC to 3-4 digits
      if (name === "cvc") {
        const formattedValue = value.replace(/\D/g, '').slice(0, 4);
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
        return;
      }
      
      setCardDetails(prev => ({ ...prev, [name]: value }));
    } else {
      // For merchant tab
      // Format account number to only allow digits
      if (name === "accountNumber" || name === "routingNumber") {
        const formattedValue = value.replace(/\D/g, '');
        setMerchantDetails(prev => ({ ...prev, [name]: formattedValue }));
        return;
      }
      
      setMerchantDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setMerchantDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = () => {
    if (activeTab === "customer") {
      // Customer payment validation
      if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
        toast.error("Please enter a valid card number");
        return;
      }
      
      if (!cardDetails.cardName) {
        toast.error("Please enter the name on the card");
        return;
      }
      
      if (!cardDetails.expiryDate || cardDetails.expiryDate.length < 5) {
        toast.error("Please enter a valid expiry date");
        return;
      }
      
      if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
        toast.error("Please enter a valid CVC");
        return;
      }
      
      // Simulate payment processing
      setPaymentStep("processing");
      
      setTimeout(() => {
        setPaymentStep("success");
      }, 3000);
    } else {
      // Merchant payment details validation
      if (merchantDetails.paymentMethod === "bank") {
        if (!merchantDetails.bankName) {
          toast.error("Please enter a bank name");
          return;
        }
        
        if (!merchantDetails.accountNumber) {
          toast.error("Please enter an account number");
          return;
        }
        
        if (!merchantDetails.accountHolder) {
          toast.error("Please enter the account holder name");
          return;
        }
        
        if (!merchantDetails.routingNumber) {
          toast.error("Please enter a routing number");
          return;
        }
      } else if (merchantDetails.paymentMethod === "paypal") {
        if (!merchantDetails.paypalEmail) {
          toast.error("Please enter your PayPal email");
          return;
        }
      }
      
      // Save merchant payment details
      saveMerchantDetails();
    }
  };
  
  const saveMerchantDetails = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to save payment details");
      return;
    }
    
    setPaymentStep("processing");
    
    try {
      // Get current profile or create a new one
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
        setTimeout(() => {
          setPaymentStep("success");
          toast.success("Payment information saved successfully");
        }, 1000);
      } else {
        setPaymentStep("details");
        toast.error("Failed to save payment information");
      }
    } catch (error) {
      console.error("Error saving merchant details:", error);
      setPaymentStep("details");
      toast.error("An error occurred while saving payment information");
    }
  };
  
  const handleBackToAds = () => {
    navigate("/ads");
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset payment step when changing tabs
    setPaymentStep("details");
  };

  if (!plan && activeTab === "customer") {
    return <div className="flex justify-center items-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600 mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Payment Portal</h1>
        </div>
        
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="customer">Pay for Ads</TabsTrigger>
              <TabsTrigger value="merchant">Receive Payments</TabsTrigger>
            </TabsList>
            
            {paymentStep === "details" && (
              <>
                <TabsContent value="customer">
                  <div className="mb-6">
                    <Card className="bg-gray-50 border-dashed">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{plan?.name} Plan</CardTitle>
                        <CardDescription>Duration: {plan?.duration}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold mb-2">${plan?.price}</p>
                        <ul className="text-xs space-y-1">
                          {plan?.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="text-green-500 text-[10px]">✓</span> {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <form>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.cardNumber}
                            onChange={handleInputChange}
                          />
                          <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          placeholder="John Doe"
                          value={cardDetails.cardName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={cardDetails.expiryDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            name="cvc"
                            placeholder="123"
                            value={cardDetails.cvc}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        type="button" 
                        className="w-full" 
                        onClick={handlePayment}
                      >
                        Pay ${plan?.price}
                      </Button>
                      
                      <p className="text-xs text-center text-gray-500 mt-4">
                        Your payment information is encrypted and secure. We do not store your card details.
                      </p>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="merchant">
                  <div className="mb-6">
                    <Card className="bg-gray-50 border-dashed">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Receive Marketplace Payments</CardTitle>
                        <CardDescription>Set up your payment information to receive funds from marketplace sales</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                  
                  <form>
                    <div className="space-y-4">
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
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {merchantDetails.paymentMethod === "bank" && (
                        <>
                          <div>
                            <Label htmlFor="bankName">Bank Name</Label>
                            <div className="relative">
                              <Input
                                id="bankName"
                                name="bankName"
                                placeholder="Your Bank"
                                value={merchantDetails.bankName}
                                onChange={handleInputChange}
                              />
                              <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="accountHolder">Account Holder Name</Label>
                            <Input
                              id="accountHolder"
                              name="accountHolder"
                              placeholder="John Doe"
                              value={merchantDetails.accountHolder}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <Input
                              id="accountNumber"
                              name="accountNumber"
                              placeholder="123456789"
                              value={merchantDetails.accountNumber}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="routingNumber">Routing Number</Label>
                            <Input
                              id="routingNumber"
                              name="routingNumber"
                              placeholder="123456789"
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
                            />
                            <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        type="button" 
                        className="w-full" 
                        onClick={handlePayment}
                      >
                        Save Payment Information
                      </Button>
                      
                      <p className="text-xs text-center text-gray-500 mt-4">
                        Your payment information is encrypted and secure. This will be used to process your marketplace payouts.
                      </p>
                    </div>
                  </form>
                </TabsContent>
              </>
            )}
            
            {paymentStep === "processing" && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-medium mb-2">
                  {activeTab === "customer" ? "Processing Payment" : "Saving Payment Information"}
                </h2>
                <p className="text-gray-500 text-center">
                  {activeTab === "customer"
                    ? "Please wait while we process your payment. This may take a few seconds."
                    : "Please wait while we save your payment information. This may take a few seconds."}
                </p>
              </div>
            )}
            
            {paymentStep === "success" && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <h2 className="text-xl font-medium mb-2">
                  {activeTab === "customer" ? "Payment Successful!" : "Payment Information Saved!"}
                </h2>
                <p className="text-gray-500 text-center mb-6">
                  {activeTab === "customer"
                    ? "Thank you for your payment. Your ad has been published successfully."
                    : "Your payment information has been saved successfully. You are now ready to receive payments from marketplace sales."}
                </p>
                <Button onClick={activeTab === "customer" ? handleBackToAds : () => navigate("/profile")}>
                  {activeTab === "customer" ? "Go to My Ads" : "Go to Profile"}
                </Button>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;
