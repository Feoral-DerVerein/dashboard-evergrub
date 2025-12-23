import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { kpiDefinitions } from "@/utils/kpiDefinitions";

interface HelpTooltipProps {
    kpiName: string;
    description?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ kpiName, description }) => {
    const definition = description || kpiDefinitions[kpiName] || "No definition available for this metric.";

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="ml-1.5 p-0.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 group"
                    aria-label={`More info about ${kpiName}`}
                    onClick={(e) => e.stopPropagation()} // Prevent card click events if any
                >
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-64 p-3 shadow-xl border-blue-100 bg-white/95 backdrop-blur-md">
                <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                        {kpiName}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        {definition}
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
};
