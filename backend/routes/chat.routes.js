import { Router } from "express";
import { getAllConversations, getConversation, sendMessage } from "../controllers/chat.controller.js";

const router = Router();

router.get("/:userId", getAllConversations);
router.get("/:userId/:chatId", getConversation);
router.post("/:userId/:chatId", sendMessage);

export default router;
