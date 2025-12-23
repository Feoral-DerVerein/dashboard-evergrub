import { PricingCard } from "@/components/pricing/PricingCard";
import { RevenueModelCard } from "@/components/pricing/RevenueModelCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Percent, Megaphone, Mail, ArrowLeft, Loader2, Globe } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { stripePromise, STRIPE_PLANS } from "@/integrations/stripe/client";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error(t('pricing.login_required_toast'));
      navigate("/login");
      return;
    }

    setLoading(true);

    // SIMULATION MODE: Set to TRUE if you don't have real keys yet. Set to FALSE for production.
    const isSimulation = false;

    if (isSimulation) {
      setTimeout(() => {
        setLoading(false);
        toast.success("Simulation Mode: Subscription Successful! 🚀");
        navigate("/dashboard?payment=success");
      }, 2000);
      return;
    }

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize");

      const token = await user.getIdToken();
      // Placeholder for Firebase Cloud Function URL
      const functionUrl = "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/checkoutSession";

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          priceId: STRIPE_PLANS.ALL_IN_ONE.priceId,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/pricing?payment=cancelled`,
        }),
      });

      if (!response.ok) {
        // If function is not deployed yet, throw specific error or mock success if in dev
        console.log("Function fetch failed (expected if not deployed). Mocking success.");
        // Mock ID for testing
        // return;
        throw new Error("Checkout session creation failed (Cloud Function not deployed)");
      }

      const { sessionId, error } = await response.json();
      if (error) throw new Error(error);

      const { error: stripeError } = await (stripe as any).redirectToCheckout({
        sessionId,
      });

      if (stripeError) throw stripeError;

    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || t("pricing.payment_error_toast"));
    } finally {
      setLoading(false);
    }
  };

  const handleContactSales = () => {
    setShowContactDialog(true);
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('pricing.contact.success_toast'));
    setShowContactDialog(false);
    setContactForm({ name: "", email: "", company: "", message: "" });
  };

  const platformFeatures = [
    t('pricing.plan_card.features.smart_inventory'),
    t('pricing.plan_card.features.demand_forecasting'),
    t('pricing.plan_card.features.prescriptive_actions'),
    t('pricing.plan_card.features.compliance_hub'),
    t('pricing.plan_card.features.marketplace_access'),
    t('pricing.plan_card.features.analytics'),
    t('pricing.plan_card.features.support'),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => changeLanguage('en')}>🇺🇸 English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('es')}>🇪🇸 Español</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('ca')}>🏳️ Català</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('de')}>🇩🇪 Deutsch</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="flex justify-center">
            <img
              src="/negentropy-logo.png"
              alt="Negentropy AI"
              className="h-20 w-auto object-contain mb-4"
            />
          </div>
          <p className="text-xl text-muted-foreground">
            {t('pricing.subtitle')}
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <PricingCard
            title={t('pricing.plan_card.title')}
            subtitle={t('pricing.plan_card.subtitle')}
            price="€150"
            period={t('pricing.plan_card.period')}
            description={t('pricing.plan_card.description')}
            features={platformFeatures}
            buttonText={loading ? t('pricing.plan_card.button.processing') : t('pricing.plan_card.button.subscribe')}
            onButtonClick={handleSubscribe}
            isPrimary={true}
            recommended={true}
          />
        </div>
      </div>

      {/* Revenue Model Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              {t('pricing.roi_section.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('pricing.roi_section.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <RevenueModelCard
              icon={Percent}
              title={t('pricing.roi_section.less_waste.title')}
              concept={t('pricing.roi_section.less_waste.concept')}
              value="-30%"
              description={t('pricing.roi_section.less_waste.description')}
            />

            <RevenueModelCard
              icon={Mail}
              title={t('pricing.roi_section.more_sales.title')}
              concept={t('pricing.roi_section.more_sales.concept')}
              value="+15%"
              description={t('pricing.roi_section.more_sales.description')}
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4 py-8 text-center">
        <Button variant="ghost" onClick={handleContactSales}>{t('pricing.contact.text')}</Button>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('pricing.contact.dialog_title')}</DialogTitle>
            <DialogDescription>
              {t('pricing.contact.dialog_desc')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitContact} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('pricing.contact.name_label')}</Label>
              <Input
                id="name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('pricing.contact.email_label')}</Label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">{t('pricing.contact.company_label')}</Label>
              <Input
                id="company"
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t('pricing.contact.message_label')}</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t('pricing.contact.send_btn')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
