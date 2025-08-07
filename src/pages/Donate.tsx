
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/Dashboard";
import { ArrowLeft, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DonationForm } from "@/components/DonationForm";

type CharityProps = {
  name: string;
  description: string;
};

// Bancos de comida de Australia
const charities: CharityProps[] = [
  {
    name: "OzHarvest",
    description: "Rescues quality surplus food and delivers it to charities that feed vulnerable Australians."
  },
  {
    name: "Foodbank Australia",
    description: "Australia’s largest food relief organization, providing food to charities and school programs nationwide."
  },
  {
    name: "SecondBite",
    description: "Rescues surplus fresh food and redistributes it to community food programs across Australia."
  },
  {
    name: "FareShare",
    description: "Cooks rescued food into free, nutritious meals for people in need in Melbourne, Brisbane and Sydney."
  },
  {
    name: "The Salvation Army – Doorways",
    description: "Provides emergency relief including food assistance to individuals and families in crisis."
  },
  {
    name: "St Vincent de Paul (Vinnies)",
    description: "Supports communities with food relief and assistance through local conferences and services."
  }
];

const CharityCard = ({
  charity
}: {
  charity: CharityProps;
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {charity.name}
          </CardTitle>
          <CardDescription>{charity.description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleOpenForm} size="sm" className="w-auto">
            Donate
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Donate to {charity.name}</DialogTitle>
          </DialogHeader>
          <DonationForm onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

const Donate = () => {
  return <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex md:items-center md:justify-center">
      <div className="max-w-md md:max-w-7xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-sm md:my-0">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center mb-1">
            <Link to="/dashboard" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">Donate</h1>
          </div>
        </header>

        <main className="px-6 py-4">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Support Food Charity</h2>
            <p className="text-gray-600 text-sm">
              Help those in need by donating to OzHarvest making a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {charities.map((charity) => (
              <CharityCard key={charity.name} charity={charity} />
            ))}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>;
};

export default Donate;
