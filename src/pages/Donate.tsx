
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

const charities: CharityProps[] = [{
  name: "Foodbank Australia",
  description: "Australia's largest food relief organization, providing over 70 million meals annually to people in need."
}, {
  name: "OzHarvest",
  description: "Rescues quality surplus food and delivers it to charities that feed vulnerable Australians."
}, {
  name: "SecondBite",
  description: "Rescues fresh, nutritious food that would otherwise go to waste and redistributes it to people in need."
}, {
  name: "FareShare",
  description: "Rescues surplus food and cooks free, nutritious meals for people experiencing food insecurity."
}, {
  name: "Loaves and Fishes Tasmania",
  description: "Collects and distributes food to Tasmanians in need through a network of community organizations."
}];

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
          <Button onClick={handleOpenForm} className="w-full bg-emerald-700 hover:bg-emerald-600">
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
  return <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
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
            <h2 className="text-lg font-medium mb-2">Support Food Charity Organizations</h2>
            <p className="text-gray-600 text-sm">
              Help those in need by donating to these food charity organizations making a difference.
            </p>
          </div>

          <div className="space-y-4">
            {charities.map(charity => <CharityCard key={charity.name} charity={charity} />)}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>;
};

export default Donate;
