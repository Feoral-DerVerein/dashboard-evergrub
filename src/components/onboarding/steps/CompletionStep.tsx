import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Rocket, BarChart3, Shield, BrainCircuit } from "lucide-react";
import confetti from "canvas-confetti";

interface CompletionStepProps {
    onComplete: () => void;
}

const features = [
    { icon: BarChart3, title: "AI Forecasting", description: "Smart demand predictions" },
    { icon: Shield, title: "Compliance Hub", description: "Legal monitoring" },
    { icon: BrainCircuit, title: "Aladdin AI", description: "Your AI assistant" }
];

const CompletionStep = ({ onComplete }: CompletionStepProps) => {
    const [showFeatures, setShowFeatures] = useState(false);

    useEffect(() => {
        // Trigger confetti animation
        const duration = 2000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval: NodeJS.Timeout = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                setShowFeatures(true);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"
            >
                <CheckCircle className="h-12 w-12 text-white" />
            </motion.div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">You're All Set!</h2>
                <p className="text-gray-600">
                    Your Negentropy AI dashboard is ready to help you reduce waste and optimize your business
                </p>
            </div>

            {showFeatures && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-gray-50 rounded-xl"
                        >
                            <feature.icon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                            <p className="text-sm text-gray-500">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="pt-4"
            >
                <Button
                    onClick={onComplete}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-14 px-10 text-lg shadow-lg"
                >
                    <Rocket className="h-5 w-5 mr-2" />
                    Go to Dashboard
                </Button>
            </motion.div>
        </motion.div>
    );
};

export default CompletionStep;
