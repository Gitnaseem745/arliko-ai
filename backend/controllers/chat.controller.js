import Conversation from "../models/conversation.model.js";
import { generateAIResponse, generateAIResponseStream, generateTitle } from "../services/ai.service.js";
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

        if (chat.messages.length === 0) {
            chat.title = await generateTitle(message);
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

// handles sending a message in stream — creates the convo if it doesn't exist, gets AI reply in chunks, saves both
export const sendMessageStream = async (req, res, next) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const message = req.query.message || req.body.message;
    const { userId, chatId } = req.params;
    checkParams.objectId(userId, "userId");
    checkParams.required(chatId, "chatId");
    checkParams.required(message, "message");

    let chat = await Conversation.findOne({ _id: chatId, userId });

    if (!chat) {
        chat = await Conversation.create({ userId, messages: [] });
    }

    if (chat.messages.length === 0) {
        chat.title = await generateTitle(message);
    }

    const fullReply = await generateAIResponseStream(chat.messages, message,
        (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
    );

    chat.messages.push(
        {
            role: "user",
            content: message
        },
        {
            role: "assistant",
            content: fullReply
        }
    );

    await chat.save();

    res.write(`data: ${JSON.stringify({ done: true, chatId: chat._id })}\n\n`);
    res.end();
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

        const chat = await Conversation.findOneAndUpdate({ _id: chatId, userId }, { title: newTitle }, { returnDocument: true });

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
