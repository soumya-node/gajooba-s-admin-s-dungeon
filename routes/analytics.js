import express from "express";
import { Analytics } from "../models/analytics.js";
import { asyncHandler } from "../utils/asyncErrorHandler.js";
import { sendResponse } from "../utils/responce.js";
import { authenticateAdmin } from "../middlewares/adminAuth.js";

const analyticsRoute = express.Router({mergeParams: true});

analyticsRoute.post("/track", authenticateAdmin, asyncHandler(async (req, res) => {
    const { gameId, eventType, userId, sessionDuration } = req.body;

    if (!gameId || !eventType) {
        return sendResponse(res, {
            status: 400,
            message: "Missing fields",
            success: false,
        });
    }

    const event = await Analytics.create({
        gameId,
        eventType,
        userId,
        sessionDuration,
    });

    return sendResponse(res, {
        status: 200,
        message: "Event tracked",
        success: true,
        data: event
    });
}));

export { analyticsRoute };