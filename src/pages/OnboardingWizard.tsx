import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { onboardingService, OnboardingData } from "@/services/onboardingService";
import WelcomeStep from "@/components/onboarding/steps/WelcomeStep";
import DataImportStep from "@/components/onboarding/steps/DataImportStep";
import PreferencesStep from "@/components/onboarding/steps/PreferencesStep";
import CompletionStep from "@/components/onboarding/steps/CompletionStep";
import { Loader2 } from "lucide-react";

const TOTAL_STEPS = 4;

const OnboardingWizard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
    const [isLoading, setIsLoading] = useState(true);

    // Load existing onboarding state
    useEffect(() => {
        const loadOnboardingStatus = async () => {
            if (!user?.id) return;

            try {
                const status = await onboardingService.getOnboardingStatus(user.id);

                if (status.completed) {
                    // Already completed, redirect to dashboard
                    navigate("/dashboard", { replace: true });
                    return;
                }

                // Resume from last step
                setCurrentStep(status.currentStep || 0);
                setOnboardingData(status.data || {});
            } catch (error) {
                console.error("Error loading onboarding status:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadOnboardingStatus();
    }, [user?.id, navigate]);

    const handleStepComplete = async (stepData: Partial<OnboardingData>) => {
        if (!user?.id) return;

        const newData = { ...onboardingData, ...stepData };
        setOnboardingData(newData);

        try {
            if (currentStep < TOTAL_STEPS - 1) {
                await onboardingService.saveStepData(user.id, currentStep + 1, newData);
                setCurrentStep((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error saving step data:", error);
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(0, prev - 1));
    };

    const handleSkipOnboarding = async () => {
        if (!user?.id) return;

        try {
            await onboardingService.skipOnboarding(user.id);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("Error skipping onboarding:", error);
        }
    };

    const handleComplete = async () => {
        if (!user?.id) return;

        try {
            await onboardingService.completeOnboarding(user.id, onboardingData);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("Error completing onboarding:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    const stepIndicators = ["Welcome", "Data", "Preferences", "Complete"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Progress Header */}
            <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b z-50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img
                                src="/lovable-uploads/0f7e7e81-92c8-4655-88b7-fef69d30e950.png"
                                alt="Negentropy"
                                className="h-8 w-auto"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {stepIndicators.map((label, index) => (
                                <div key={label} className="flex items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${index < currentStep
                                                ? "bg-green-500 text-white"
                                                : index === currentStep
                                                    ? "bg-green-100 text-green-700 ring-2 ring-green-500"
                                                    : "bg-gray-100 text-gray-400"
                                            }`}
                                    >
                                        {index + 1}
                                    </div>
                                    {index < stepIndicators.length - 1 && (
                                        <div
                                            className={`w-8 h-0.5 mx-1 ${index < currentStep ? "bg-green-500" : "bg-gray-200"
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-24 pb-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                        {currentStep === 0 && (
                            <WelcomeStep
                                key="welcome"
                                data={onboardingData}
                                onNext={handleStepComplete}
                                onSkip={handleSkipOnboarding}
                            />
                        )}
                        {currentStep === 1 && (
                            <DataImportStep
                                key="data"
                                data={onboardingData}
                                onNext={handleStepComplete}
                                onBack={handleBack}
                                onSkip={handleSkipOnboarding}
                            />
                        )}
                        {currentStep === 2 && (
                            <PreferencesStep
                                key="preferences"
                                data={onboardingData}
                                onNext={handleStepComplete}
                                onBack={handleBack}
                            />
                        )}
                        {currentStep === 3 && (
                            <CompletionStep
                                key="completion"
                                onComplete={handleComplete}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
