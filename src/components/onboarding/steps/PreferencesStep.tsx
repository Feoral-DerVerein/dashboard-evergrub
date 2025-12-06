import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Bell, Moon, Globe, Shield } from "lucide-react";
import { OnboardingData, UserPreferences } from "@/services/onboardingService";

interface PreferencesStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack: () => void;
}

const languages = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
    { value: "pt", label: "Português" }
];

const complianceRegions = [
    { value: "spain_ley1_2025", label: "Spain - Ley 1/2025" },
    { value: "australia_epa", label: "Australia - EPA Guidelines" },
    { value: "eu_general", label: "EU General Waste Directive" },
    { value: "none", label: "No specific compliance" }
];

const PreferencesStep = ({ data, onNext, onBack }: PreferencesStepProps) => {
    const [preferences, setPreferences] = useState<UserPreferences>({
        notificationAlerts: data.preferences?.notificationAlerts ?? true,
        notificationReports: data.preferences?.notificationReports ?? true,
        language: data.preferences?.language ?? "es",
        theme: data.preferences?.theme ?? "light",
        complianceRegion: data.preferences?.complianceRegion ?? "spain_ley1_2025"
    });

    const handleNext = () => {
        onNext({ preferences });
    };

    const updatePreference = <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Set Your Preferences</h2>
                <p className="text-gray-600">Customize your Negentropy AI experience</p>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
                {/* Notifications Section */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Bell className="h-5 w-5 text-green-600" />
                        Notifications
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="alerts" className="text-sm text-gray-600">
                            Daily Alerts (expiring products)
                        </Label>
                        <Switch
                            id="alerts"
                            checked={preferences.notificationAlerts}
                            onCheckedChange={(checked) => updatePreference("notificationAlerts", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="reports" className="text-sm text-gray-600">
                            Weekly Reports
                        </Label>
                        <Switch
                            id="reports"
                            checked={preferences.notificationReports}
                            onCheckedChange={(checked) => updatePreference("notificationReports", checked)}
                        />
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Moon className="h-5 w-5 text-green-600" />
                        Appearance
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Theme</Label>
                        <Select
                            value={preferences.theme}
                            onValueChange={(value: 'light' | 'dark' | 'system') => updatePreference("theme", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Language Section */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Globe className="h-5 w-5 text-green-600" />
                        Language
                    </div>

                    <Select
                        value={preferences.language}
                        onValueChange={(value) => updatePreference("language", value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Compliance Section */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Shield className="h-5 w-5 text-green-600" />
                        Compliance Region
                    </div>

                    <Select
                        value={preferences.complianceRegion}
                        onValueChange={(value) => updatePreference("complianceRegion", value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {complianceRegions.map((region) => (
                                <SelectItem key={region.value} value={region.value}>
                                    {region.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                        This helps us provide relevant compliance monitoring
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="h-12"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-12 px-8"
                >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

export default PreferencesStep;
