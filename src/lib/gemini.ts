import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!API_KEY) {
    console.warn("Missing VITE_GOOGLE_API_KEY in environment variables. AI features will not work.");
}

export const genAI = new GoogleGenerativeAI(API_KEY || "dummy-key");

// Verified working model via test-gemini.ts (1.5 returns 404 for this key)
export const MODEL_NAME = "gemini-2.0-flash";

export const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
    }
});
