
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building, Hotel, Store, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PartnerType = "restaurant" | "hotel" | "supermarket" | "market";

interface PartnerForm {
  name: string;
  type: PartnerType | "";
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
}

const Partners = () => {
  const [form, setForm] = useState<PartnerForm>({
    name: "",
    type: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const partnerTypes = [
    { value: "restaurant", label: "Restaurante", icon: Building },
    { value: "hotel", label: "Hotel", icon: Hotel },
    { value: "supermarket", label: "Supermercado", icon: ShoppingCart },
    { value: "market", label: "Mercado", icon: Store }
  ];

  const handleInputChange = (field: keyof PartnerForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleTypeChange = (value: PartnerType) => {
    setForm(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.type || !form.email || !form.contactPerson) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call to save partner
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Partner added successfully",
        description: `${form.name} has been registered as a B2B partner`
      });
      
      // Reset form
      setForm({
        name: "",
        type: "",
        email: "",
        phone: "",
        address: "",
        contactPerson: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add partner. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Add B2B Partner</h1>
              <p className="text-gray-500 text-sm">Register a new business partner</p>
            </div>
          </div>
        </header>

        <main className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Business Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={form.name}
                onChange={handleInputChange("name")}
                placeholder="Enter business name"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                Business Type *
              </Label>
              <Select value={form.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {partnerTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">
                Contact Person *
              </Label>
              <Input
                id="contactPerson"
                type="text"
                value={form.contactPerson}
                onChange={handleInputChange("contactPerson")}
                placeholder="Enter contact person name"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleInputChange("email")}
                placeholder="Enter business email"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={handleInputChange("phone")}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Address
              </Label>
              <Input
                id="address"
                type="text"
                value={form.address}
                onChange={handleInputChange("address")}
                placeholder="Enter business address"
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding Partner...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Add Partner
                </div>
              )}
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Partners;
