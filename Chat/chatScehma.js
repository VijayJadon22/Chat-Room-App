import mongoose from "mongoose";

const chatScehma = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now(),
    }
}, { timestamps: true });

export const chatModel = mongoose.model("chats", chatScehma);