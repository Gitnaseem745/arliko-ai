import { Router } from "express";
import { getAllConversations, getConversation, sendMessage } from "../controllers/chat.controller.js";

const router = Router();

router.get("/", getAllConversations);
router.get("/:chatId", getConversation);
router.post("/:chatId", sendMessage);

export default router;
