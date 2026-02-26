import e from "express";
import cors from "cors";
import path from "path";
import chatRoutes from "./routes/chat.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import morgan from "morgan";
import { limiter } from "./utils/limiters.js";
import { ENV } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js"

const app = e();

// set environment on express app
app.set("env", ENV.NODE_ENV || process.env.NODE_ENV || "development");

app.use(cors({
    origin: ENV.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));

// logging: verbose in development, common in production
if (ENV.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("common"));
}

app.use(e.json());

// serve static with basic caching in production
if (ENV.NODE_ENV === "production") {
    app.use(e.static("public", { maxAge: "1d" }));
} else {
    app.use(e.static("public"));
}

app.use("/", healthRoutes)
app.use("/api", limiter, authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chats", chatRoutes);

// serve index.html for /chat/:chatId routes
app.get("/chat/:chatId", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

app.use(errorHandler);

export default app;
