import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, SkipForward, Upload, Link, FileSpreadsheet, Edit3 } from "lucide-react";
import { OnboardingData } from "@/services/onboardingService";

interface DataImportStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack: () => void;
    onSkip: () => void;
}

const importMethods = [
    {
        id: "pos",
        title: "Connect POS System",
        description: "Square, Shopify, Lightspeed, Toast",
        icon: Link,
        color: "from-blue-500 to-blue-600"
    },
    {
        id: "csv",
        title: "Upload CSV/Excel",
        description: "Import from spreadsheets",
        icon: Upload,
        color: "from-green-500 to-green-600"
    },
    {
        id: "sheets",
        title: "Google Sheets",
        description: "Connect your spreadsheet",
        icon: FileSpreadsheet,
        color: "from-yellow-500 to-yellow-600"
    },
    {
        id: "manual",
        title: "Manual Entry",
        description: "Enter data yourself",
        icon: Edit3,
        color: "from-purple-500 to-purple-600"
    }
];

const DataImportStep = ({ data, onNext, onBack, onSkip }: DataImportStepProps) => {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(data.dataImportMethod || null);

    const handleMethodSelect = (methodId: string) => {
        setSelectedMethod(methodId);
    };

    const handleContinue = () => {
        // For now, we'll just mark as selected and move on
        // In a full implementation, each method would have its own flow
        onNext({
            dataImportMethod: selectedMethod || "skipped",
            dataImported: !!selectedMethod
        });
    };

    const handleSkipStep = () => {
        onNext({
            dataImportMethod: "skipped",
            dataImported: false
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Import Your Data</h2>
                <p className="text-gray-600">Connect your data source to unlock AI-powered insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {importMethods.map((method) => (
                    <motion.div
                        key={method.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card
                            className={`cursor-pointer transition-all duration-300 ${selectedMethod === method.id
                                    ? "ring-2 ring-green-500 shadow-lg"
                                    : "hover:shadow-md"
                                }`}
                            onClick={() => handleMethodSelect(method.id)}
                        >
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${method.color}`}>
                                    <method.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{method.title}</h3>
                                    <p className="text-sm text-gray-500">{method.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-500">
                    You can always import more data later from Settings → Integrations
                </p>
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
                    variant="ghost"
                    onClick={handleSkipStep}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Skip for Now
                </Button>
                <Button
                    onClick={handleContinue}
                    disabled={!selectedMethod}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-12 px-8"
                >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

export default DataImportStep;
