import mongoose from "mongoose";
import { ENV } from "./env.js";

// connects to MongoDB using the URI from env vars, kills the process if it fails
export const connectDB = async () => {
    if (!ENV.MONGO_URI) {
        console.error("MONGO_URI is not defined in environment variables.");
        process.exit(1);
    }
    try {
        await mongoose.connect(ENV.MONGO_URI);
        console.log("MongoDB connected");
    } catch (e) {
        console.error("Database connection failed:", e.message);
        process.exit(1);
    }
}
