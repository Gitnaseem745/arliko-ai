import app from "./app.js";
import { connectDB } from "./config/database.js";
import { ENV } from "./config/env.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const startServer = async () => {
    await connectDB();

    app.listen(ENV.PORT, () => {
        console.log(`Server running on port ${ENV.PORT}`);
    });
};

startServer();
