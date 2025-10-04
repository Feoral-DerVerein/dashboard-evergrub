import { PricingCard } from "@/components/pricing/PricingCard";
import { RevenueModelCard } from "@/components/pricing/RevenueModelCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Percent, Megaphone, Mail } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleGetStarted = () => {
    // Redirect to registration or payment flow
    navigate("/payment");
  };

  const handleContactSales = () => {
    setShowContactDialog(true);
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the contact form data to your backend
    toast.success("Thank you! We'll get in touch with you soon.");
    setShowContactDialog(false);
    setContactForm({ name: "", email: "", company: "", message: "" });
  };

  const startedFeatures = [
    "Access to basic food waste dashboard",
    "Up to 100 listed products",
    "Automated monthly reports",
    "Basic n8n integration",
    "Email support",
    "Access to B2B/B2C marketplace",
    "Automated inventory notifications",
  ];

  const enterpriseFeatures = [
    "Everything in Started, with expanded limits",
    "Unlimited products",
    "Advanced dashboard with real-time analytics",
    "Automated regulatory reports (Bin Trim / NSW EPA)",
    "Full n8n integration and custom APIs",
    "Custom ERP/POS integrations",
    "24/7 priority support",
    "Dedicated account manager",
    "Whitelabel available",
    "Automated NGO donation workflows",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground">
            Subscription Plans
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your business and start reducing food waste today
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <PricingCard
            title="Started"
            subtitle="Small Business"
            price={100}
            period="USD / month"
            description="Monthly subscription for retailers and small farms"
            features={startedFeatures}
            buttonText="Get Started"
            onButtonClick={handleGetStarted}
            isPrimary={false}
          />

          <PricingCard
            title="Enterprise"
            subtitle="Big Business"
            price="Contact Us"
            description="Custom solution for supermarket chains and wholesalers"
            features={enterpriseFeatures}
            buttonText="Contact Sales"
            onButtonClick={handleContactSales}
            recommended={true}
            isPrimary={true}
          />
        </div>
      </div>

      {/* Revenue Model Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              Additional Revenue Streams
            </h2>
            <p className="text-muted-foreground">
              Complementary revenue sources for your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <RevenueModelCard
              icon={Percent}
              title="Transaction Fee"
              concept="B2B - B2C"
              value="3%"
              description="Commission on each marketplace transaction"
            />

            <RevenueModelCard
              icon={Megaphone}
              title="Premium Advertising"
              concept="ADS - Positioning"
              value="$15"
              description="Per featured product on platform (monthly)"
            />

            <RevenueModelCard
              icon={Mail}
              title="Enterprise Plan"
              concept="Customization"
              value="Contact"
              description="Tailored solutions based on business needs"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-2xl font-semibold text-foreground">
            Ready to get started?
          </h3>
          <p className="text-muted-foreground">
            Join hundreds of businesses already reducing food waste with Negentropy
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleContactSales}
            >
              Talk to Sales
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Sales</DialogTitle>
            <DialogDescription>
              Fill out the form and our team will get in touch with you
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitContact} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
