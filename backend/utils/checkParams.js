import mongoose from "mongoose";

class ValidationError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = "ValidationError";
        this.status = status;
    }
}

const checkParams = {
    // validates a MongoDB ObjectId (userId, chatId, etc.)
    objectId(value, name = "id") {
        if (!value || value === "null" || !mongoose.Types.ObjectId.isValid(value)) {
            throw new ValidationError(`Invalid ${name}`, 400);
        }
    },

    // checks that a value is present and non-empty
    required(value, name = "field") {
        if (!value) {
            throw new ValidationError(`${name} is required`, 400);
        }
    },

    // validates minimum string length
    minLength(value, min, name = "field") {
        if (!value || value.length < min) {
            throw new ValidationError(`${name} must be at least ${min} characters`, 400);
        }
    }
};

export { ValidationError };
export default checkParams;
