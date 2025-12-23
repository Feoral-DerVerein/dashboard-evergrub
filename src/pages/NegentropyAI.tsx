import { NegentropyChatPanel } from "@/components/ai/NegentropyChatPanel"

const NegentropyAI = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4">
                <NegentropyChatPanel />
            </div>
        </div>
    )
}

export default NegentropyAI
