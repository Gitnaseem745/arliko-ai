import Conversation from "../models/conversation.model.js";
import { generateAIResponse } from "../services/ai.service.js";
import checkParams from "../utils/checkParams.js";

// fetches a single conversation by chatId, scoped to the user
export const getConversation = async (req, res, next) => {
    try {
        const { userId, chatId } = req.params;
        checkParams.objectId(userId, "userId");
        checkParams.objectId(chatId, "chatId");

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
        checkParams.objectId(userId, "userId");
        checkParams.required(chatId, "chatId");
        checkParams.required(message, "message");

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
        checkParams.objectId(userId, "userId");

        const chats = await Conversation.find({ userId }).select("_id title").sort({ updatedAt: -1 });
        res.json({ chats, totalChats: chats.length });
    } catch (e) {
        next(e);
    }
}

export const editConversationTitle = async (req, res, next) => {
    try {
        const { userId, chatId } = req.params;
        const { newTitle } = req.body;
        checkParams.objectId(userId, "userId");
        checkParams.objectId(chatId, "chatId");
        checkParams.required(newTitle, "title");

        const chat = await Conversation.findOneAndUpdate({ _id: chatId, userId }, { title: newTitle }, { new: true });

        if (!chat) return res.status(404).json({ error: "Conversation not found" });

        res.json({ message: "title updated successfully" });
    } catch (e) {
        next(e)
    }
}

export const deleteConversation = async (req, res, next) => {
    try {
        const { userId, chatId } = req.params;
        checkParams.objectId(userId, "userId");
        checkParams.objectId(chatId, "chatId");

        const chat = await Conversation.findOneAndDelete({ _id: chatId, userId });

        if (!chat) return res.status(404).json({ error: "Conversation not found" });

        res.json({ message: "conversation deleted successfully" });
    } catch (e) {
        next(e)
    }
}
