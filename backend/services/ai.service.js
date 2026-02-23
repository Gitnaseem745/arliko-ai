import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env.js";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export const generateAIResponse = async (history, userMessage) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
    });

    const pastHistory = history.slice(0, -1);
    const chat = model.startChat({
        history: pastHistory.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }))
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
}
