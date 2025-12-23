import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, User, Sparkles, TrendingUp, AlertCircle, Mic, FileText, Image as ImageIcon, File } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChatProductCard } from '@/components/chat/ChatProductCard';
import { ChatActionCard } from '@/components/chat/ChatActionCard';
import { ChatChartCard } from '@/components/chat/ChatChartCard';
import { toast } from 'sonner'
import { useNegentropyChat } from '@/context/NegentropyChatContext'
import { storageService } from '@/services/storageService'
import { useAuth } from '@/context/AuthContext'

// Interface definitions moved to context or kept if needed locally
interface NegentropyChatPanelProps {
    className?: string
}

export function NegentropyChatPanel({ className }: NegentropyChatPanelProps) {
    const { messages, loading, sendMessage, isListening, setIsListening } = useNegentropyChat();
    const { user } = useAuth();
    const [input, setInput] = useState('')
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [messages, loading])

    const handleSend = async () => {
        if (!input.trim() || loading) return
        const content = input;
        setInput('')
        await sendMessage(content);
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        toast.info(`Subiendo ${file.name}...`);
        try {
            const path = `chat-uploads/${user.uid}/${Date.now()}_${file.name}`;
            const url = await storageService.uploadFile(path, file);

            await sendMessage(`[Archivo subido: ${file.name}](${url})`);
            toast.success("Archivo subido correctamente");
        } catch (error) {
            console.error("Error uploading chat file:", error);
            toast.error("Error al subir el archivo");
        } finally {
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileClick = (acceptType: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = acceptType;
            fileInputRef.current.click();
        }
    };

    const handleMicClick = () => {
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'es-ES';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput((prev) => prev + (prev ? ' ' : '') + transcript);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
                toast.error('Error al escuchar. Intenta de nuevo.');
            };

            recognition.start();
        } else {
            toast.error('Tu navegador no soporta entrada de voz.');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const isChatStarted = messages.length > 0;

    return (
        <Card className={`flex flex-col border-none shadow-none bg-transparent relative ${className || 'h-[calc(100vh-100px)]'}`}>
            {/* Animated Dynamic Logo */}
            <div
                className={`absolute z-20 transition-all duration-700 ease-in-out ${!isChatStarted
                    ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-[180%]'
                    : 'top-4 left-4 translate-x-0 translate-y-0'
                    }`}
            >
                <img
                    src="/lovable-uploads/negentropy-icon-blue-sparkles.png"
                    alt="Negentropy AI"
                    className={`transition-all duration-700 ease-in-out object-contain ${!isChatStarted
                        ? 'h-16 opacity-100 drop-shadow-sm'
                        : 'h-8 opacity-100'
                        }`}
                />
            </div>

            <CardContent className={`flex-1 flex flex-col p-0 transition-all duration-500 ease-in-out ${isChatStarted ? 'justify-end' : 'justify-center items-center'}`}>

                {/* Messages Area */}
                {isChatStarted && (
                    <ScrollArea className="flex-1 w-full p-4 max-h-[400px] overflow-y-auto" ref={scrollAreaRef}>
                        <div className="space-y-6 pb-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div
                                        className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${message.role === 'user'
                                            ? 'bg-gray-200'
                                            : 'bg-white border border-gray-100'
                                            }`}
                                    >
                                        {message.role === 'user' ? (
                                            <User className="h-4 w-4 text-gray-700" />
                                        ) : (
                                            <img
                                                src="/lovable-uploads/negentropy-icon-blue-sparkles.png"
                                                alt="AI"
                                                className="h-5 w-auto object-contain"
                                            />
                                        )}
                                    </div>
                                    <div className={`flex flex-col gap-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`prose text-sm leading-relaxed ${message.role === 'user' ? 'text-gray-900 bg-gray-100 px-4 py-2 rounded-2xl' : 'text-gray-800'}`}>
                                            <div className="whitespace-pre-wrap font-medium">
                                                {message.content}
                                            </div>
                                            {/* Render Generative UI Components */}
                                            {message.component && message.component.type === 'product_card' && (
                                                <div className="mt-2 text-left">
                                                    <ChatProductCard product={message.component.data} />
                                                </div>
                                            )}
                                            {message.component && message.component.type === 'action_card' && (
                                                <div className="mt-2 text-left">
                                                    <ChatActionCard
                                                        action={message.component.data}
                                                        onExecute={async () => {
                                                            const { actionExecutorService } = await import('@/services/actionExecutorService');
                                                            if (user) {
                                                                await actionExecutorService.executeAction(message.component!.data, user.uid);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {message.component && message.component.type === 'chart_card' && (
                                                <div className="mt-2 text-left w-full">
                                                    <ChatChartCard
                                                        chartData={message.component.data}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-4">
                                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-green-600">
                                        <Sparkles className="h-4 w-4 text-white animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <div className="flex gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}

                {/* Greeting - Only when chat hasn't started - REMOVED (Replaced by dynamic header logo) */}

                {/* Input Area */}
                <div className={`w-full max-w-3xl px-4 ${isChatStarted ? 'mb-4' : 'mb-0'}`}>
                    <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-100 p-2 transition-shadow hover:shadow-xl focus-within:shadow-xl focus-within:border-gray-200">

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 ml-1 text-gray-400 hover:text-gray-600 rounded-full"
                                    disabled={loading}
                                >
                                    <span className="text-lg font-light">+</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" side="top">
                                <DropdownMenuItem onClick={() => handleFileClick("application/pdf")}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Documento PDF</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFileClick("image/*")}>
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    <span>Imagen</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleFileClick("*/*")}>
                                    <File className="mr-2 h-4 w-4" />
                                    <span>Cualquier archivo</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Input
                            placeholder="Pregunta lo que quieras"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent text-gray-600 placeholder:text-gray-400 h-10 px-4 text-lg"
                        />

                        <div className="flex items-center gap-1 pr-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleMicClick}
                                className={`h-8 w-8 rounded-full transition-all duration-300 relative ${isListening ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {isListening && (
                                    <>
                                        <div className="voice-wave" />
                                        <div className="voice-wave voice-wave-delayed" />
                                    </>
                                )}
                                <Mic className={`h-4 w-4 z-10 ${isListening ? 'fill-current' : ''}`} />
                            </Button>

                            <Button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                size="icon"
                                className={`h-8 w-8 rounded-full transition-all duration-200 ${input.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                {loading ? <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
