import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { geminiService, ChatMessage } from '@/services/geminiService';

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    component?: {
        type: 'product_card' | 'action_card' | 'chart_card';
        data: any;
    }
}

interface NegentropyChatContextType {
    messages: Message[];
    loading: boolean;
    sendMessage: (content: string) => Promise<void>;
    isListening: boolean;
    setIsListening: (val: boolean) => void;
}

const NegentropyChatContext = createContext<NegentropyChatContextType | undefined>(undefined);

export const NegentropyChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Initial load from Firestore
    useEffect(() => {
        const loadHistory = async () => {
            if (!user?.uid) {
                setMessages([]);
                return;
            };

            try {
                const history = await geminiService.loadChatHistory(user.uid);
                if (history.length > 0) {
                    const mappedMessages: Message[] = history.map(msg => ({
                        role: msg.role === 'model' ? 'assistant' : 'user',
                        content: msg.text,
                        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date()
                    }));
                    setMessages(mappedMessages);
                }
            } catch (error) {
                console.error("Error loading chat history in context:", error);
            }
        };

        loadHistory();
    }, [user?.uid]);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            // Map history for service
            const chatHistory: ChatMessage[] = messages.map(m => ({
                id: m.timestamp.getTime().toString(),
                role: m.role as 'user' | 'model',
                text: m.content,
                timestamp: m.timestamp
            }));

            const response = await geminiService.sendMessage(chatHistory, content, user?.uid);

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.text,
                timestamp: new Date(),
                component: response.component
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Negentropy AI error in context:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: '❌ Lo siento, hubo un error al procesar tu pregunta.',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <NegentropyChatContext.Provider value={{ messages, loading, sendMessage, isListening, setIsListening }}>
            {children}
        </NegentropyChatContext.Provider>
    );
};

export const useNegentropyChat = () => {
    const context = useContext(NegentropyChatContext);
    if (context === undefined) {
        throw new Error('useNegentropyChat must be used within an NegentropyChatProvider');
    }
    return context;
};
