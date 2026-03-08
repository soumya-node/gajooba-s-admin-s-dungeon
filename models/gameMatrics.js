import mongoose from "mongoose";

const gameMetricsSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
    },
    date: Date, // per day
    installs: Number,
    dau: Number,
    sessions: Number,
    crashes: Number,

}, {
    timestamps: true
});

const GameMetrics = mongoose.model("GameMetrics", gameMetricsSchema);

export { GameMetrics };