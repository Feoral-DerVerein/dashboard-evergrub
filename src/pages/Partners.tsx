
import { useState, useEffect } from "react";
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
import { partnersService, PartnerData, Partner } from "@/services/partnersService";

type PartnerType = "restaurant" | "hotel" | "supermarket" | "market";

interface PartnerForm {
  name: string;
  type: PartnerType | "";
  email: string;
  phone: string;
  address: string;
  contact_person: string;
}

const Partners = () => {
  const [form, setForm] = useState<PartnerForm>({
    name: "",
    type: "",
    email: "",
    phone: "",
    address: "",
    contact_person: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const partnerTypes = [
    { value: "restaurant", label: "Restaurant", icon: Building },
    { value: "hotel", label: "Hotel", icon: Hotel },
    { value: "supermarket", label: "Supermarket", icon: ShoppingCart },
    { value: "market", label: "Market", icon: Store }
  ];

  // Load partners when component mounts
  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      const data = await partnersService.getPartners();
      setPartners(data);
    } catch (error) {
      console.error("Error loading partners:", error);
      toast({
        title: "Error",
        description: "Failed to load partners",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        description: `Contact ${partner.contact_person} at ${partner.name}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.type || !form.email || !form.contact_person) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const partnerData: PartnerData = {
        name: form.name,
        type: form.type as PartnerType,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        contact_person: form.contact_person
      };

      await partnersService.createPartner(partnerData);
      
      toast({
        title: "Partner added successfully",
        description: `${form.name} has been registered as a B2B partner`
      });
      
      // Reset form and reload partners
      setForm({
        name: "",
        type: "",
        email: "",
        phone: "",
        address: "",
        contact_person: ""
      });

      await loadPartners();
    } catch (error) {
      console.error("Error adding partner:", error);
      toast({
        title: "Error",
        description: "Failed to add partner. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex md:items-center md:justify-center">
      <div className="max-w-md md:max-w-6xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-sm md:my-0">
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
              <Label htmlFor="contact_person" className="text-sm font-medium text-gray-700">
                Contact Person *
              </Label>
              <Input
                id="contact_person"
                type="text"
                value={form.contact_person}
                onChange={handleInputChange("contact_person")}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                </div>
              ) : partners.length === 0 ? (
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
                            {getPartnerTypeLabel(partner.type)} • {partner.contact_person}
                          </p>
                          <p className="text-xs text-gray-400">
                            Added on {formatDate(partner.date_added)}
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
