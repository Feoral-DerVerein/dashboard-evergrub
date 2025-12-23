import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Tag, HeartHandshake } from "lucide-react";

interface ActionData {
    type: 'discount' | 'donation' | 'general';
    title: string;
    description: string;
    actionLabel: string;
    actionValue: string;
}

interface ChatActionCardProps {
    action: ActionData;
    onExecute?: (value: string) => void;
}

export function ChatActionCard({ action, onExecute }: ChatActionCardProps) {
    const Icon = action.type === 'discount' ? Tag : action.type === 'donation' ? HeartHandshake : Check;
    const colorClass = action.type === 'discount' ? 'text-blue-500' : action.type === 'donation' ? 'text-pink-500' : 'text-green-500';

    return (
        <Card className="w-64 shadow-md bg-white border-gray-200 my-2">
            <CardHeader className="p-3 flex flex-row items-center gap-2 space-y-0">
                <div className={`p-2 rounded-full bg-gray-50 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm font-semibold">{action.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <p className="text-xs text-gray-500 mb-3">{action.description}</p>
                <div className="flex gap-2">
                    <Button size="sm" className="w-full h-8 text-xs" onClick={() => onExecute?.(action.actionValue)}>
                        {action.actionLabel}
                    </Button>
                    <Button size="sm" variant="outline" className="w-auto h-8 text-xs px-2">
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
