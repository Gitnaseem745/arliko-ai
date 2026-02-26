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
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(protect);

router.get("/stream/:chatId", aiLimiter, sendMessageStream);
router.get("/", getAllConversations);
router.get("/:chatId", getConversation);
router.post("/:chatId", aiLimiter, sendMessage);
router.put("/:chatId", editConversationTitle);
router.delete("/:chatId", deleteConversation);

export default router;
