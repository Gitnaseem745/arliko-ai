import { Router } from "express";
import {
    getAllConversations,
    getConversation,
    sendMessage,
    sendMessageStream,
    editConversationTitle,
    deleteConversation
} from "../controllers/chat.controller.js";
import { aiLimiter } from "../utils/limiters.js"

const router = Router();

router.get("/stream/:userId/:chatId", aiLimiter, sendMessageStream);
router.get("/:userId", getAllConversations);
router.get("/:userId/:chatId", getConversation);
router.post("/:userId/:chatId", aiLimiter, sendMessage);
router.put("/:userId/:chatId", editConversationTitle);
router.delete("/:userId/:chatId", deleteConversation);

export default router;
