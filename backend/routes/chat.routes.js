import { Router } from "express";
import { getConversation, sendMessage } from "../controllers/chat.controller.js";

const router = Router();

router.get("/:chatId", getConversation);
router.post("/:chatId", sendMessage);

export default router;
