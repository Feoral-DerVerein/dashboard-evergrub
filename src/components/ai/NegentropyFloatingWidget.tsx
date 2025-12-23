import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import { NegentropyChatPanel } from './NegentropyChatPanel';
import { useTranslation } from 'react-i18next';

export function NegentropyFloatingWidget() {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="fixed top-20 right-6 z-50 cursor-pointer group">
                    {/* Pulsing ring effect - Radial & Slower */}
                    <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-400 via-blue-500 to-indigo-600 rounded-full opacity-70 blur-md group-hover:opacity-100 transition-opacity animate-pulse"
                        style={{ animationDuration: '3s' }}
                    ></div>



                    {/* Main floating bubble */}
                    <div className="relative h-16 w-16 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 shadow-2xl flex items-center justify-center transform transition-transform duration-500 group-hover:scale-105 overflow-hidden">
                        {open ? (
                            <X className="h-6 w-6 text-gray-800" />
                        ) : (
                            <img
                                src="/lovable-uploads/negentropy-icon-blue-sparkles.png"
                                alt="Chat"
                                className="h-10 w-10 object-contain animate-in fade-in zoom-in duration-500"
                            />
                        )}
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="end"
                sideOffset={20}
                className="w-[380px] sm:w-[450px] h-[600px] p-0 border border-gray-100 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden"
            >
                <NegentropyChatPanel className="h-full" />
            </PopoverContent>
        </Popover>
    );
}
