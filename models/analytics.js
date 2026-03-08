import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true,
    },

    eventType: {
        type: String,
        enum: ["install", "session_start", "session_end", "crash"],
        required: true,
    },
    userId: String,
    sessionDuration: Number, // in seconds
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

analyticsSchema.index({gameId : 1, createdAt: 1});
analyticsSchema.index({createdAt: 1}, {expireAfterSeconds : 60 * 60 * 24 * 30});

const Analytics = mongoose.model("Analytics", analyticsSchema);

export {Analytics}