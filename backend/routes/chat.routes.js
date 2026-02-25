import { Router } from "express";
import {
    getAllConversations,
    getConversation,
    sendMessage,
    editConversationTitle,
    deleteConversation
} from "../controllers/chat.controller.js";

const router = Router();

router.get("/:userId", getAllConversations);
router.get("/:userId/:chatId", getConversation);
router.post("/:userId/:chatId", sendMessage);
router.put("/:userId/:chatId", editConversationTitle);
router.delete("/:userId/:chatId", deleteConversation);

export default router;
