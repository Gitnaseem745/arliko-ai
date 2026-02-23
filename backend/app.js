import e from "express";
import cors from "cors";
import path from "path";
import chatRoutes from "./routes/chat.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = e();

app.use(cors());
app.use(e.json());
app.use(e.static("public"));

app.use("/api/chat", chatRoutes);

// Serve index.html for /chat/:chatId routes (SPA)
app.get("/chat/:chatId", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

app.use(errorHandler);

export default app;
