import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/Dashboard";
import { ArrowLeft, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DonationForm } from "@/components/DonationForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type CharityProps = {
  name: string;
  description: string;
};

// Bancos de comida de Australia por estado
const charitiesByState = {
  "All States": [
    {
      name: "OzHarvest",
      description: "Rescues quality surplus food and delivers it to charities that feed vulnerable Australians."
    },
    {
      name: "Foodbank Australia",
      description: "Australia's largest food relief organization, providing food to charities and school programs nationwide."
    },
    {
      name: "SecondBite",
      description: "Rescues surplus fresh food and redistributes it to community food programs across Australia."
    },
    {
      name: "Food Bank",
      description: "Community-based food bank helping distribute food to those in need across Australia."
    }
  ],
  "New South Wales": [
    {
      name: "OzHarvest Sydney",
      description: "Rescues quality surplus food and delivers it to charities that feed vulnerable Australians in NSW."
    },
    {
      name: "Foodbank NSW & ACT",
      description: "Provides food relief across New South Wales and Australian Capital Territory."
    },
    {
      name: "Food Bank NSW",
      description: "Local food bank serving communities across New South Wales."
    }
  ],
  "Victoria": [
    {
      name: "FareShare",
      description: "Cooks rescued food into free, nutritious meals for people in need in Melbourne, Brisbane and Sydney."
    },
    {
      name: "Foodbank Victoria",
      description: "Provides food relief to Victorian communities through local charities and programs."
    },
    {
      name: "SecondBite Melbourne",
      description: "Rescues surplus fresh food and redistributes it to community food programs in Victoria."
    }
  ],
  "Queensland": [
    {
      name: "Foodbank Queensland",
      description: "Provides food relief across Queensland through community partnerships."
    },
    {
      name: "OzHarvest Brisbane",
      description: "Rescues quality surplus food and delivers it to charities in Queensland."
    },
    {
      name: "Food Bank QLD",
      description: "Local food bank serving communities across Queensland."
    }
  ],
  "Western Australia": [
    {
      name: "Foodbank Western Australia",
      description: "WA's largest food relief organization, providing food assistance across the state."
    },
    {
      name: "OzHarvest Perth",
      description: "Rescues quality surplus food and delivers it to charities in Western Australia."
    }
  ],
  "South Australia": [
    {
      name: "Foodbank South Australia",
      description: "Provides food relief to South Australian communities through local partnerships."
    },
    {
      name: "Food Bank SA",
      description: "Local food bank serving communities across South Australia."
    }
  ],
  "Tasmania": [
    {
      name: "Foodbank Tasmania",
      description: "Provides food relief across Tasmania through community partnerships."
    }
  ],
  "Northern Territory": [
    {
      name: "Foodbank Northern Territory",
      description: "Provides food relief across the Northern Territory through community partnerships."
    }
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
          <DonationForm onClose={() => setIsFormOpen(false)} ngoName={charity.name} />
        </DialogContent>
      </Dialog>
    </>
  );
};

const Donate = () => {
  const [selectedState, setSelectedState] = useState("All States");
  const charities = charitiesByState[selectedState as keyof typeof charitiesByState];
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDonations();
    }
  }, [user]);

  const fetchDonations = async () => {
    try {
      // Fetch both history and pending to show all
      const { donationService } = await import('@/services/donationService');
      const [history, pending] = await Promise.all([
        donationService.getHistory(user?.id || 'demo-user'),
        donationService.getPendingProposals(user?.id || 'demo-user')
      ]);
      const allDonations = [...pending, ...history].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setDonations(allDonations);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex md:items-center md:justify-center">
    <div className="max-w-md md:max-w-7xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-sm md:my-0 w-full">
      <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10 border-b">
        <div className="flex items-center mb-1">
          <Link to="/dashboard" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Donate</h1>
        </div>
      </header>

      <main className="px-6 py-4 space-y-8">
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Support Food Charity</h2>
            <p className="text-gray-600 text-sm mb-4">
              Help those in need by donating to food banks making a difference.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select your state:</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your state" />
                </SelectTrigger>
                <SelectContent>
                  {australianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {charities.map((charity) => (
              <CharityCard key={charity.name} charity={charity} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-4">Your Donations</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NGO</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
                    </TableRow>
                  ) : donations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">No donations yet.</TableCell>
                    </TableRow>
                  ) : (
                    donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">{donation.ngo}</TableCell>
                        <TableCell>{donation.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={donation.status === 'delivered' ? 'default' : 'secondary'}>
                            {donation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(donation.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  </div>;
};

export default Donate;