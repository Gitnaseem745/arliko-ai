import User from "../models/user.model.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

// registers a new user — expects email, password, username in body
export const signUp = async (req, res, next) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ error: "Email, password, and username are required." });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters." });
        }

        const dbUser = await User.findOne({ email });
        if (dbUser) return res.status(409).json({ error: "User Already Exists" });

        const passwordHash = await hash(password, 10)

        const user = await User.create({ email, passwordHash, username });
        const token = jwt.sign({ userId: user._id }, ENV.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ userId: user._id, token, message: "User created successfully" });
    } catch (e) {
        next(e);
    }
}

// authenticates a user by email + password, returns userId and username
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(404).json({ error: "Email and password are requried." })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "Email is invalid." });
        }

        const isValid = await compare(password, user.passwordHash);

        if (!isValid) {
            return res.status(404).json({ error: "Password is invalid." })
        }

        const token = jwt.sign({ userId: user._id }, ENV.JWT_SECRET, { expiresIn: "7d" });
        res.json({ userId: user._id, username: user.username, token, message: "Login successfull." });
    } catch (e) {
        next(e);
    }
}
