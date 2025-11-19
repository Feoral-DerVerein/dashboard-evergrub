import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MapPin } from "lucide-react";
import { toast } from "sonner";

interface QuickDonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
}

const charitiesByState = {
  "All States": [
    { name: "OzHarvest", description: "Rescues quality surplus food and delivers it to charities that feed vulnerable Australians." },
    { name: "Foodbank Australia", description: "Australia's largest food relief organization, providing food to charities and school programs nationwide." },
    { name: "SecondBite", description: "Rescues surplus fresh food and redistributes it to community food programs across Australia." }
  ],
  "New South Wales": [
    { name: "OzHarvest Sydney", description: "Rescues quality surplus food and delivers it to charities that feed vulnerable Australians in NSW." },
    { name: "Foodbank NSW & ACT", description: "Provides food relief across New South Wales and Australian Capital Territory." }
  ],
  "Victoria": [
    { name: "FareShare", description: "Cooks rescued food into free, nutritious meals for people in need in Melbourne, Brisbane and Sydney." },
    { name: "Foodbank Victoria", description: "Provides food relief to Victorian communities through local charities and programs." }
  ],
  "Queensland": [
    { name: "Foodbank Queensland", description: "Provides food relief across Queensland through community partnerships." },
    { name: "OzHarvest Brisbane", description: "Rescues quality surplus food and delivers it to charities in Queensland." }
  ],
  "Western Australia": [
    { name: "Foodbank Western Australia", description: "WA's largest food relief organization, providing food assistance across the state." },
    { name: "OzHarvest Perth", description: "Rescues quality surplus food and delivers it to charities in Western Australia." }
  ],
  "South Australia": [
    { name: "Foodbank South Australia", description: "Provides food relief to South Australian communities through local partnerships." }
  ],
  "Tasmania": [
    { name: "Foodbank Tasmania", description: "Provides food relief across Tasmania through community partnerships." }
  ],
  "Northern Territory": [
    { name: "Foodbank Northern Territory", description: "Provides food relief across the Northern Territory through community partnerships." }
  ]
};

const australianStates = [
  "All States",
  "New South Wales", 
  "Victoria",
  "Queensland",
  "Western Australia",
  "South Australia",
  "Tasmania",
  "Northern Territory"
];

export const QuickDonationDialog = ({ open, onOpenChange, productName }: QuickDonationDialogProps) => {
  const [selectedState, setSelectedState] = useState<string>("All States");

  const handleDonate = (charity: string) => {
    toast.success(`Donación programada`, {
      description: `${productName ? `${productName} será donado a` : 'Tu donación será enviada a'} ${charity}`
    });
    onOpenChange(false);
  };

  const currentCharities = charitiesByState[selectedState as keyof typeof charitiesByState] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Seleccionar organización de donación
          </DialogTitle>
          <DialogDescription>
            {productName ? `Donar "${productName}" a una organización benéfica` : 'Selecciona una organización para realizar tu donación'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Selecciona tu estado
            </label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {australianStates.map(state => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {currentCharities.map((charity, index) => (
              <Card key={index} className="hover:border-primary transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{charity.name}</CardTitle>
                  <CardDescription className="text-sm">{charity.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleDonate(charity.name)}
                    className="w-full"
                    variant="outline"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Donar aquí
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
