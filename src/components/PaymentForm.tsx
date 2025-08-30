import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock, Calendar, User } from "lucide-react";

interface PaymentFormProps {
  offer: any;
  products: any[];
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ offer, products, onPaymentSuccess, onCancel }: PaymentFormProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    email: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      postcode: "",
      country: "Australia"
    }
  });

  const totalAmount = products.reduce((sum, product) => sum + product.totalPrice, 0);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('billing.')) {
      const billingField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [billingField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      handleInputChange('cardNumber', formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      handleInputChange('cvv', value);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      errors.push("Invalid card number");
    }
    if (!formData.cardName.trim()) {
      errors.push("Cardholder name required");
    }
    if (!formData.expiryMonth || !formData.expiryYear) {
      errors.push("Expiry date required");
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      errors.push("Invalid CVV");
    }
    if (!formData.email.includes('@')) {
      errors.push("Invalid email");
    }
    if (!formData.billingAddress.street.trim()) {
      errors.push("Address required");
    }
    if (!formData.billingAddress.city.trim()) {
      errors.push("City required");
    }
    if (!formData.billingAddress.postcode.trim()) {
      errors.push("Postcode required");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Form Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful!",
        description: `Your payment of $${totalAmount.toLocaleString()} AUD has been processed successfully.`,
      });
      
      onPaymentSuccess();
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            Secure Payment
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="space-y-2">
              {products.map((product, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{product.name}</span>
                  <span>${product.totalPrice.toLocaleString()} AUD</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>${totalAmount.toLocaleString()} AUD</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Card Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    type="text"
                    placeholder="As it appears on card"
                    value={formData.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Month</Label>
                    <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Year</Label>
                    <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleCvvChange}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="font-semibold">Billing Address</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="street">Address</Label>
                  <Input
                    id="street"
                    type="text"
                    placeholder="Street and number"
                    value={formData.billingAddress.street}
                    onChange={(e) => handleInputChange('billing.street', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="City"
                      value={formData.billingAddress.city}
                      onChange={(e) => handleInputChange('billing.city', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.billingAddress.state} onValueChange={(value) => handleInputChange('billing.state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nsw">New South Wales (NSW)</SelectItem>
                        <SelectItem value="vic">Victoria (VIC)</SelectItem>
                        <SelectItem value="qld">Queensland (QLD)</SelectItem>
                        <SelectItem value="wa">Western Australia (WA)</SelectItem>
                        <SelectItem value="sa">South Australia (SA)</SelectItem>
                        <SelectItem value="tas">Tasmania (TAS)</SelectItem>
                        <SelectItem value="act">Australian Capital Territory (ACT)</SelectItem>
                        <SelectItem value="nt">Northern Territory (NT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      type="text"
                      placeholder="1234"
                      value={formData.billingAddress.postcode}
                      onChange={(e) => handleInputChange('billing.postcode', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Country</Label>
                    <Input value="Australia" disabled />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Pay $${totalAmount.toLocaleString()} AUD`}
              </Button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="text-center text-sm text-muted-foreground">
            <Lock className="h-4 w-4 inline mr-1" />
            Your information is protected with SSL encryption
          </div>
        </CardContent>
      </Card>
    </div>
  );
}