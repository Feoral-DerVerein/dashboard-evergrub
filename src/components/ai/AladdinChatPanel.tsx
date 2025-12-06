import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, User, Sparkles, TrendingUp, AlertCircle, Mic } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    metadata?: {
        provider?: string
        model?: string
        tokens?: number
        cost_usd?: number
    }
}

interface ActionableIntent {
    type: string
    label: string
    endpoint: string
}

export function AladdinChatPanel() {
    const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [contextSummary, setContextSummary] = useState<any>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [messages])

    // Helper to get user name
    const getUserName = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name.split(' ')[0]
        }
        if (user?.email) {
            return user.email.split('@')[0]
        }
        return 'Felipe' // Fallback fallback
    }

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error('No estás autenticado')
                return
            }

            // Call Aladdin AI Edge Function
            const { data, error } = await supabase.functions.invoke('aladdin-ai/query', {
                body: {
                    query: input,
                    conversation_history: messages.slice(-4) // Last 2 exchanges for context
                }
            })

            if (error) throw error

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.answer,
                timestamp: new Date(),
                metadata: data.metadata
            }

            setMessages((prev) => [...prev, assistantMessage])

            // Store context summary if provided
            if (data.context_used) {
                setContextSummary(data.context_used)
            }

            // Show actionable intents as toast
            if (data.actionable_intents && data.actionable_intents.length > 0) {
                data.actionable_intents.forEach((intent: ActionableIntent) => {
                    toast.success(intent.label, {
                        description: 'Haz clic para ejecutar esta acción',
                        action: {
                            label: 'Ir',
                            onClick: () => {
                                // Navigate to relevant page
                                window.location.href = '/legal' // Simplified
                            }
                        }
                    })
                })
            }

            // Log if fallback was used
            if (data.fallback) {
                toast.warning('El asistente AI no está disponible, usando modo básico')
            }

        } catch (error: any) {
            console.error('Aladdin AI error:', error)
            toast.error('Error al procesar tu pregunta')

            const errorMessage: Message = {
                role: 'assistant',
                content: '❌ Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.',
                timestamp: new Date()
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const isChatStarted = messages.length > 0

    return (
        <Card className="flex flex-col h-[calc(100vh-100px)] border-none shadow-none bg-transparent">
            {/* Context Badges - Only show when chat started or if we have context */}
            {contextSummary && isChatStarted && (
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {contextSummary.inventory_items} items
                    </Badge>
                    {contextSummary.critical_items > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {contextSummary.critical_items} en riesgo
                        </Badge>
                    )}
                </div>
            )}

            <CardContent className={`flex-1 flex flex-col p-0 transition-all duration-500 ease-in-out ${isChatStarted ? 'justify-end' : 'justify-center items-center'}`}>

                {/* Messages Area */}
                {isChatStarted && (
                    <ScrollArea className="flex-1 w-full p-4 md:px-20 lg:px-40" ref={scrollAreaRef}>
                        <div className="space-y-6 pb-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div
                                        className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${message.role === 'user'
                                            ? 'bg-gray-200'
                                            : 'bg-green-600'
                                            }`}
                                    >
                                        {message.role === 'user' ? (
                                            <User className="h-4 w-4 text-gray-700" />
                                        ) : (
                                            <Sparkles className="h-4 w-4 text-white" />
                                        )}
                                    </div>
                                    <div className={`flex flex-col gap-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`prose text-sm leading-relaxed ${message.role === 'user' ? 'text-gray-900 bg-gray-100 px-4 py-2 rounded-2xl' : 'text-gray-800'}`}>
                                            <div className="whitespace-pre-wrap font-medium">
                                                {message.content}
                                            </div>
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

                {/* Greeting - Only when chat hasn't started */}
                {!isChatStarted && (
                    <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <img
                            src="/lovable-uploads/negentropy-logo.png"
                            alt="Negentropy Logo"
                            className="h-20 w-auto object-contain opacity-90"
                        />
                    </div>
                )}

                {/* Input Area */}
                <div className={`w-full max-w-3xl px-4 ${isChatStarted ? 'mb-4' : 'mb-0'}`}>
                    <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-100 p-2 transition-shadow hover:shadow-xl focus-within:shadow-xl focus-within:border-gray-200">

                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-1 text-gray-400 hover:text-gray-600 rounded-full">
                            <span className="text-lg font-light">+</span>
                        </Button>

                        <Input
                            placeholder="Pregunta lo que quieras"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent text-gray-600 placeholder:text-gray-400 h-10 px-4 text-lg"
                        />

                        <div className="flex items-center gap-1 pr-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 rounded-full">
                                <Mic className="h-4 w-4" />
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
