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
    toast.success("¡Gracias! Nos pondremos en contacto contigo pronto.");
    setShowContactDialog(false);
    setContactForm({ name: "", email: "", company: "", message: "" });
  };

  const startedFeatures = [
    "Acceso al dashboard básico de residuos alimentarios",
    "Hasta 100 productos listados",
    "Reportes mensuales automatizados",
    "Integración básica con n8n",
    "Soporte por email",
    "Acceso al marketplace B2B/B2C",
    "Notificaciones automáticas de inventario",
  ];

  const enterpriseFeatures = [
    "Todo lo incluido en Started, con límites ampliados",
    "Productos ilimitados",
    "Dashboard avanzado con analíticas en tiempo real",
    "Reportes regulatorios automatizados (Bin Trim / NSW EPA)",
    "Integración completa n8n y APIs personalizadas",
    "Integraciones personalizadas ERP/POS",
    "Soporte prioritario 24/7",
    "Gerente de cuenta dedicado",
    "Whitelabel disponible",
    "Flujos de donación a ONGs automatizados",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground">
            Planes de Suscripción
          </h1>
          <p className="text-xl text-muted-foreground">
            Elige el plan perfecto para tu negocio y comienza a reducir el desperdicio de alimentos hoy
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <PricingCard
            title="Started"
            subtitle="Pequeñas Empresas"
            price={100}
            period="USD / mes"
            description="Suscripción mensual para minoristas y granjas pequeñas"
            features={startedFeatures}
            buttonText="Comenzar"
            onButtonClick={handleGetStarted}
            isPrimary={false}
          />

          <PricingCard
            title="Enterprise"
            subtitle="Grandes Empresas"
            price="Contáctanos"
            description="Solución personalizada para cadenas de supermercados y mayoristas"
            features={enterpriseFeatures}
            buttonText="Contactar Ventas"
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
              Modelos de Ingresos Adicionales
            </h2>
            <p className="text-muted-foreground">
              Fuentes de ingresos complementarias para tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <RevenueModelCard
              icon={Percent}
              title="Comisión por Transacción"
              concept="B2B - B2C"
              value="3%"
              description="Comisión sobre cada transacción en el marketplace"
            />

            <RevenueModelCard
              icon={Megaphone}
              title="Publicidad Premium"
              concept="ADS - Posicionamiento"
              value="$15"
              description="Por producto destacado en la plataforma (mensual)"
            />

            <RevenueModelCard
              icon={Mail}
              title="Plan Enterprise"
              concept="Personalización"
              value="Contactar"
              description="Soluciones a medida según necesidades del negocio"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-2xl font-semibold text-foreground">
            ¿Listo para comenzar?
          </h3>
          <p className="text-muted-foreground">
            Únete a cientos de negocios que ya están reduciendo el desperdicio de alimentos con Negentropy
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Comenzar Ahora
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleContactSales}
            >
              Hablar con Ventas
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contactar con Ventas</DialogTitle>
            <DialogDescription>
              Completa el formulario y nuestro equipo se pondrá en contacto contigo
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitContact} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
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
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Enviar Mensaje
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
