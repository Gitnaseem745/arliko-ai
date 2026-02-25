import e from "express";
import cors from "cors";
import path from "path";
import chatRoutes from "./routes/chat.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import morgan from "morgan";
import { limiter } from "./utils/limiters.js";
import { ENV } from "./config/env.js";

const app = e();

app.use(cors({
    origin: ENV.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use(morgan("dev"))
app.use(e.json());
app.use(e.static("public"));

app.use("/api", limiter, authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chats", chatRoutes);

// serve index.html for /chat/:chatId routes
app.get("/chat/:chatId", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

app.use(errorHandler);

export default app;
