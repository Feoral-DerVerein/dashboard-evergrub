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
    const [language, setLanguage] = useState<"es" | "en" | "ca" | "de">("es"); // Default to Spanish as per context

    const translations = {
        es: {
            title: "Importa tus Datos",
            subtitle: "Conecta tu fuente de datos para desbloquear el poder de la IA",
            pos: "Conectar TPV",
            posDesc: "Square, Shopify, Lightspeed, Toast",
            csv: "Subir CSV/Excel",
            csvDesc: "Importar desde hojas de cálculo",
            sheets: "Google Sheets",
            sheetsDesc: "Conecta tu hoja de cálculo",
            manual: "Entrada Manual",
            manualDesc: "Introduce los datos tú mismo",
            note: "Siempre puedes importar más datos tarde desde Configuración → Integraciones",
            back: "Atrás",
            skip: "Saltar por ahora",
            continue: "Continuar"
        },
        en: {
            title: "Import Your Data",
            subtitle: "Connect your data source to unlock AI-powered insights",
            pos: "Connect POS System",
            posDesc: "Square, Shopify, Lightspeed, Toast",
            csv: "Upload CSV/Excel",
            csvDesc: "Import from spreadsheets",
            sheets: "Google Sheets",
            sheetsDesc: "Connect your spreadsheet",
            manual: "Manual Entry",
            manualDesc: "Enter data yourself",
            note: "You can always import more data later from Settings → Integrations",
            back: "Back",
            skip: "Skip for Now",
            continue: "Continue"
        },
        ca: {
            title: "Importa les teves Dades",
            subtitle: "Connecta la teva font de dades per desbloquejar el poder de la IA",
            pos: "Connectar TPV",
            posDesc: "Square, Shopify, Lightspeed, Toast",
            csv: "Pujar CSV/Excel",
            csvDesc: "Importar des de fulls de càlcul",
            sheets: "Google Sheets",
            sheetsDesc: "Connecta el teu full de càlcul",
            manual: "Entrada Manual",
            manualDesc: "Introdueix les dades tu mateix",
            note: "Sempre pots importar més dades més tard des de Configuració → Integracions",
            back: "Enrere",
            skip: "Saltar per ara",
            continue: "Continuar"
        },
        de: {
            title: "Importieren Sie Ihre Daten",
            subtitle: "Verbinden Sie Ihre Datenquelle, um KI-Erkenntnisse freizuschalten",
            pos: "POS-System verbinden",
            posDesc: "Square, Shopify, Lightspeed, Toast",
            csv: "CSV/Excel hochladen",
            csvDesc: "Import aus Tabellenkalkulationen",
            sheets: "Google Sheets",
            sheetsDesc: "Verbinden Sie Ihre Tabelle",
            manual: "Manuelle Eingabe",
            manualDesc: "Daten selbst eingeben",
            note: "Sie können später unter Einstellungen → Integrationen weitere Daten importieren",
            back: "Zurück",
            skip: "Vorerst überspringen",
            continue: "Weiter"
        }
    };

    const t = translations[language];

    const handleMethodSelect = (methodId: string) => {
        setSelectedMethod(methodId);
    };

    const handleContinue = () => {
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
            <div className="absolute top-4 right-4 z-10">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {(["es", "en", "ca", "de"] as const).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === lang
                                    ? "bg-white text-green-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
                <p className="text-gray-600">{t.subtitle}</p>
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
                                    <h3 className="font-semibold text-gray-900">
                                        {method.id === 'pos' ? t.pos :
                                            method.id === 'csv' ? t.csv :
                                                method.id === 'sheets' ? t.sheets : t.manual}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {method.id === 'pos' ? t.posDesc :
                                            method.id === 'csv' ? t.csvDesc :
                                                method.id === 'sheets' ? t.sheetsDesc : t.manualDesc}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-500">
                    {t.note}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="h-12"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t.back}
                </Button>
                <Button
                    variant="ghost"
                    onClick={handleSkipStep}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <SkipForward className="h-4 w-4 mr-2" />
                    {t.skip}
                </Button>
                <Button
                    onClick={handleContinue}
                    disabled={!selectedMethod}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-12 px-8"
                >
                    {t.continue}
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

export default DataImportStep;
