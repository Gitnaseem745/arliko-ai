import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import { generateAIResponse } from "../services/ai.service.js";

// fetches a single conversation by chatId, scoped to the user
export const getConversation = async (req, res, next) => {
    try {
        const { userId, chatId } = req.params;

        if (!chatId || chatId === "null" ||
            !mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(404).json({ error: "Invalid chatId" });
        }

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const chat = await Conversation.findOne({ _id: chatId, userId });
        res.json(chat || { messages: [] });
    } catch (e) {
        next(e);
    }
};

// handles sending a message — creates the convo if it doesn't exist, gets AI reply, saves both
export const sendMessage = async (req, res, next) => {
    try {
        const { message } = req.body;
        const { userId, chatId } = req.params;

        if (!message || !chatId) {
            return res.status(400).json({ error: "Please provide a message and chatId." });
        }

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        let chat = await Conversation.findOne({ _id: chatId, userId });

        if (!chat) {
            chat = await Conversation.create({ userId, messages: [] });
        }

        const reply = await generateAIResponse(chat.messages, message);

        chat.messages.push(
            {
                role: "user",
                content: message
            },
            {
                role: "assistant",
                content: reply
            }
        );

        await chat.save();

        res.json({ reply, chatId: chat._id });
    } catch (e) {
        next(e);
    }
}


// returns all conversation titles for a given user (sorted newest first)
export const getAllConversations = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const chats = await Conversation.find({ userId }).select("_id title").sort({ updatedAt: -1 });
        res.json({ chats, totalChats: chats.length });
    } catch (e) {
        next(e);
    }
}
