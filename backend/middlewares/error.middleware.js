import { ValidationError } from "../utils/checkParams.js";

// global error handler — catches anything that slips through
export const errorHandler = (err, req, res, next) => {
    if (err instanceof ValidationError) {
        return res.status(err.status).json({ error: err.message });
    }

    console.error(err.stack);

    res.status(500).json({
        message: "Internal Server Error"
    });
}
