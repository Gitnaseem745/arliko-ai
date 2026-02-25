import e from "express";
import cors from "cors";
import path from "path";
import chatRoutes from "./routes/chat.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import morgan from "morgan";

const app = e();

app.use(cors());
app.use(morgan("dev"))
app.use(e.json());
app.use(e.static("public"));

app.use("/api", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chats", chatRoutes);

// serve index.html for /chat/:chatId routes
app.get("/chat/:chatId", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

app.use(errorHandler);

export default app;
