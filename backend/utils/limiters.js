import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Too many requests. Try again later." }
});

export const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5, // updated accordingly to gemini-2.5-flash free tier that is 5 (RPM) 
    message: { error: "AI rate limit reached. Wait a moment." }
});
