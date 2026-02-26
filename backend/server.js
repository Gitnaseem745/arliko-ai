import app from "./app.js";
import { connectDB } from "./config/database.js";
import { ENV } from "./config/env.js";
import dns from "dns";

// Optionally override DNS servers via DNS_SERVERS env var (comma-separated)
if (process.env.DNS_SERVERS) {
    try {
        const servers = process.env.DNS_SERVERS.split(",").map(s => s.trim()).filter(Boolean);
        if (servers.length) {
            dns.setServers(servers);
            console.log("Using custom DNS servers:", servers);
        }
    } catch (e) {
        console.warn("Failed to set custom DNS servers:", e);
    }
}

// boots up the server — connects to DB first, then starts listening
const startServer = async () => {
    await connectDB();
    app.listen(ENV.PORT, () => {
        console.log(`Server running on port http://localhost:${ENV.PORT} (env=${ENV.NODE_ENV})`);
    });
};

startServer();
