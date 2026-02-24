import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import { generateAIResponse } from "../services/ai.service.js";

export const getConversation = async (req, res, next) => {
    try {
        const { chatId } = req.params;

        if (!chatId || chatId === "null" ||
            !mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(404).json({ error: "Invalid chatId" });
        }

        const chat = await Conversation.findById(chatId);
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


export const getAllConversations = async (req, res, next) => {
    try {
        const chats = await Conversation.find().select("_id title").sort({ updatedAt: -1 });
        res.json({ chats, totalChats: chats.length });
    } catch (e) {
        next(e);
    }
}
