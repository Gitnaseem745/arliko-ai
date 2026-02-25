import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env.js";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

// takes the chat history + new message, sends it to Gemini, returns the AI's text response
export const generateAIResponse = async (history, userMessage) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
    });

    const chat = model.startChat({
        history: history.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }))
    });

    const result = await chat.sendMessage(userMessage);
    console.log("Gemini Results: ", result.response)
    return result.response.text();
}
