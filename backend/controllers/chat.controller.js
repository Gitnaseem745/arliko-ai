import Conversation from "../models/conversation.model.js";
import { generateAIResponse } from "../services/ai.service.js";

export const getConversation = async (req, res, next) => {
    try {
        const chat = await Conversation.findById(req.params.chatId);
        res.json(chat || { messages: [] });
    } catch (e) {
        next(e);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { message } = req.body;
        const { chatId } = req.params;

        if (!message || !chatId) {
            return res.status(400).json({ error: "Please provide a message and chatId." });
        }

        let chat = await Conversation.findById(chatId);

        if (!chat) {
            chat = await Conversation.create({ messages: [] });
        }

        chat.messages.push({ role: "user", content: message });

        const reply = await generateAIResponse(chat.messages, message);

        chat.messages.push({ role: "assistant", content: reply });

        await chat.save();

        res.json({ reply, chatId: chat._id });
    } catch (e) {
        next(e);
    }
}
