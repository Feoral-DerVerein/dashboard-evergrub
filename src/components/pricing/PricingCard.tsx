import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string | number;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  onButtonClick: () => void;
  recommended?: boolean;
  isPrimary?: boolean;
}

export const PricingCard = ({
  title,
  subtitle,
  price,
  period = "USD / mes",
  description,
  features,
  buttonText,
  onButtonClick,
  recommended = false,
  isPrimary = false,
}: PricingCardProps) => {
  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
        recommended 
          ? "border-2 border-primary shadow-lg scale-105" 
          : "hover:scale-[1.02]"
      }`}
    >
      {recommended && (
        <Badge 
          className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0"
        >
          RECOMENDADO
        </Badge>
      )}
      
      <CardHeader className="space-y-4 pb-8">
        <div>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base mt-2">{subtitle}</CardDescription>
        </div>
        
        <div className="flex items-baseline gap-2">
          {typeof price === "number" ? (
            <>
              <span className="text-5xl font-bold text-foreground">${price}</span>
              <span className="text-muted-foreground">{period}</span>
            </>
          ) : (
            <span className="text-4xl font-bold text-foreground">{price}</span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground pt-2">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4 pb-8">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onButtonClick}
          className={`w-full h-12 text-base font-medium transition-all ${
            isPrimary
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg"
              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          }`}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};
