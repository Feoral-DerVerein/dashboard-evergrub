import { GoogleGenerativeAI } from "@google/generative-ai";

// Hardcoded for test script only
const API_KEY = "AIzaSyAlYRNH2FunuAe64QATjsxMSJx4xz3IQTo";

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        console.log("Fetching available models...");

        const candidates = [
            "gemini-2.5-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash-002",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
        ];

        for (const modelName of candidates) {
            console.log(`Testing ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`✅ SUCCESS: ${modelName}`);
                break; // Found one!
            } catch (error: any) {
                console.log(`❌ FAILED: ${modelName}`);
                console.log(error);
            }
        }

    } catch (error) {
        console.error("Global Error", error);
    }
}

listModels();
