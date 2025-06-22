import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building, Hotel, Store, ShoppingCart, Check, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Partner extends PartnerForm {
  id: string;
  dateAdded: string;
  type: PartnerType; // This should always be a valid PartnerType, not empty string
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
  const [partners, setPartners] = useState<Partner[]>([]);
  const { toast } = useToast();

  const partnerTypes = [
    { value: "restaurant", label: "Restaurant", icon: Building },
    { value: "hotel", label: "Hotel", icon: Hotel },
    { value: "supermarket", label: "Supermarket", icon: ShoppingCart },
    { value: "market", label: "Market", icon: Store }
  ];

  const getPartnerTypeLabel = (type: PartnerType | "") => {
    if (!type) return "";
    return partnerTypes.find(pt => pt.value === type)?.label || type;
  };

  const getPartnerTypeIcon = (type: PartnerType | "") => {
    if (!type) return Building;
    return partnerTypes.find(pt => pt.value === type)?.icon || Building;
  };

  const handleInputChange = (field: keyof PartnerForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleTypeChange = (value: PartnerType) => {
    setForm(prev => ({ ...prev, type: value }));
  };

  const handleContactPartner = (partner: Partner) => {
    if (partner.phone) {
      window.open(`tel:${partner.phone}`, '_self');
    } else if (partner.email) {
      window.open(`mailto:${partner.email}`, '_self');
    } else {
      toast({
        title: "Contact Information",
        description: `Contact ${partner.contactPerson} at ${partner.name}`,
      });
    }
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
      
      // Add partner to local list
      const newPartner: Partner = {
        ...form,
        id: Math.random().toString(36).substr(2, 9),
        dateAdded: new Date().toLocaleDateString(),
        type: form.type as PartnerType // Safe cast since we validated above
      };
      
      setPartners(prev => [...prev, newPartner]);
      
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

        <main className="px-6 py-6 space-y-6">
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

          {/* Partners Added Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-green-600" />
                Partners Added ({partners.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partners.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No partners added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {partners.map((partner) => {
                    const Icon = getPartnerTypeIcon(partner.type);
                    return (
                      <div key={partner.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Icon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {partner.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {getPartnerTypeLabel(partner.type)} • {partner.contactPerson}
                          </p>
                          <p className="text-xs text-gray-400">
                            Added on {partner.dateAdded}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContactPartner(partner)}
                          className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Phone className="w-3 h-3" />
                          Contact
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Partners;
