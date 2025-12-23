import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Users, ArrowRight, SkipForward } from "lucide-react";
import { OnboardingData } from "@/services/onboardingService";

interface WelcomeStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onSkip: () => void;
}

const businessTypes = [
    { value: "cafe", label: "Café" },
    { value: "restaurant", label: "Restaurant" },
    { value: "hotel", label: "Hotel" },
    { value: "supermarket", label: "Supermarket" },


    { value: "bakery", label: "Bakery" },
    { value: "catering", label: "Catering Service" },
    { value: "other", label: "Other" }
];

const businessSizes = [
    { value: "small", label: "Small (1-10 employees)" },
    { value: "medium", label: "Medium (11-50 employees)" },
    { value: "large", label: "Large (51-200 employees)" },
    { value: "enterprise", label: "Enterprise (200+ employees)" }
];

const countries = [
    { value: "ES", label: "España" },
    { value: "AU", label: "Australia" },
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "MX", label: "México" },
    { value: "other", label: "Other" }
];

const WelcomeStep = ({ data, onNext, onSkip }: WelcomeStepProps) => {
    const [businessName, setBusinessName] = useState(data.businessName || "");
    const [businessType, setBusinessType] = useState(data.businessType || "");
    const [businessSize, setBusinessSize] = useState(data.businessSize || "");
    const [country, setCountry] = useState(data.country || "");

    const handleNext = () => {
        if (!businessName || !businessType || !country) {
            return;
        }
        onNext({
            businessName,
            businessType,
            businessSize,
            country
        });
    };

    const isValid = businessName && businessType && country;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Welcome to Negentropy AI</h2>
                <p className="text-gray-600">Let's get your business set up in just a few steps</p>
            </div>

            <div className="grid gap-6 max-w-md mx-auto">
                <div className="space-y-2">
                    <Label htmlFor="businessName" className="flex items-center gap-2 text-sm font-medium">
                        <Building2 className="h-4 w-4 text-green-600" />
                        Business Name
                    </Label>
                    <Input
                        id="businessName"
                        placeholder="e.g. Central Café"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="h-12"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                        <Building2 className="h-4 w-4 text-green-600" />
                        Business Type
                    </Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select your business type" />
                        </SelectTrigger>
                        <SelectContent>
                            {businessTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4 text-green-600" />
                        Business Size
                    </Label>
                    <Select value={businessSize} onValueChange={setBusinessSize}>
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select your business size" />
                        </SelectTrigger>
                        <SelectContent>
                            {businessSizes.map((size) => (
                                <SelectItem key={size.value} value={size.value}>
                                    {size.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-green-600" />
                        Country
                    </Label>
                    <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Skip Onboarding
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!isValid}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-12 px-8"
                >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

export default WelcomeStep;
