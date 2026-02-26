import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const protect = (req, res, next) => {
    try {
        // support Authorization header or query string token
        let token = null;
        const auth = req.headers.authorization || req.headers.Authorization;
        if (auth && typeof auth === "string") {
            const parts = auth.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") token = parts[1];
        }
        if (!token && req.query && req.query.token) token = req.query.token;
        if (!token) return res.status(401).json({ error: "Missing token" });

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded || !decoded.userId) return res.status(401).json({ error: "Invalid token" });

        req.userId = decoded.userId;
        next();
    } catch (e) {
        return res.status(401).json({ error: "Unauthorized" });
    }
}

export default protect;
