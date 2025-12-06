import { AladdinChatPanel } from "@/components/ai/AladdinChatPanel"

const AladdinAI = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4">
                <AladdinChatPanel />
            </div>
        </div>
    )
}

export default AladdinAI
