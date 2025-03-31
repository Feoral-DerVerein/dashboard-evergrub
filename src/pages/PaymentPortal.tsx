
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, CheckCircle, Loader2 } from "lucide-react";
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

const PaymentPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStep, setPaymentStep] = useState("details"); // details, processing, success
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvc: "",
  });
  
  // Get the plan information from location state
  const plan = location.state?.plan;
  
  useEffect(() => {
    if (!plan) {
      toast.error("No plan selected. Redirecting to ad creation page.");
      navigate("/ads/create");
    }
  }, [plan, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
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
  };

  const handlePayment = () => {
    // Basic validation
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
  };
  
  const handleBackToAds = () => {
    navigate("/ads");
  };

  if (!plan) {
    return <div className="flex justify-center items-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 flex items-center">
          <button 
            onClick={() => navigate("/ads/create")}
            className="text-gray-600 mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Payment Portal</h1>
        </div>
        
        <div className="p-6">
          {paymentStep === "details" && (
            <>
              <div className="mb-6">
                <Card className="bg-gray-50 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{plan.name} Plan</CardTitle>
                    <CardDescription>Duration: {plan.duration}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold mb-2">${plan.price}</p>
                    <ul className="text-xs space-y-1">
                      {plan.features.map((feature: string, index: number) => (
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
                    Pay ${plan.price}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Your payment information is encrypted and secure. We do not store your card details.
                  </p>
                </div>
              </form>
            </>
          )}
          
          {paymentStep === "processing" && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-medium mb-2">Processing Payment</h2>
              <p className="text-gray-500 text-center">
                Please wait while we process your payment. This may take a few seconds.
              </p>
            </div>
          )}
          
          {paymentStep === "success" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-xl font-medium mb-2">Payment Successful!</h2>
              <p className="text-gray-500 text-center mb-6">
                Thank you for your payment. Your ad has been published successfully.
              </p>
              <Button onClick={handleBackToAds}>
                Go to My Ads
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;
