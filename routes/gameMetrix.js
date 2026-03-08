import express from "express";
import { GameMetrics } from "../models/gameMatrics.js";
import { asyncHandler } from "../utils/asyncErrorHandler.js";
import { sendResponse } from "../utils/responce.js";
import { aggregateDailyMetrics } from "../jobs/analyticsJob.js";
import { authenticateAdmin } from "../middlewares/adminAuth.js";

let gameMatrixRoute = express.Router({mergeParams: true});

gameMatrixRoute.get("/:gameId/today", authenticateAdmin, asyncHandler(async (req,res)=>{
    const {gameId} = req.params;

    const today = new Date();

    today.setHours(0,0,0,0);

    const data = await GameMetrics.findOne({
        gameId,
        date: today,
    }).lean();

    sendResponse(res, {
        message: "Todays game matrix",
        status: 200,
        data : data,
        success: true,
    })

}));


gameMatrixRoute.get("/:gameId/last7days", authenticateAdmin, asyncHandler(async (req, res) => {

    const { gameId } = req.params;

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const data = await GameMetrics.find({
        gameId,
        date: { $gte: last7Days }
    }).sort({ date: 1 }).lean();

    sendResponse(res, {
        message: "Last sevenDays game matrix",
        status: 200,
        data : data,
        success: true,
    });
}));


gameMatrixRoute.get("/:gameId/range", authenticateAdmin, asyncHandler(async (req, res) => {

    const { gameId } = req.params;
    let  { start, end } = req.query;

    const today = new Date();
    today.setHours(0,0,0,0);

    // Default: last 7 days
    if (!start && !end) {
        end = new Date(today);
        start = new Date(today);
        start.setDate(start.getDate() - 7);
    }

    // If only start provided → end = today
    if (start && !end) {
        end = new Date(today);
    }

    // Convert to Date objects safely
    start = new Date(start);
    end = new Date(end);

    // Normalize times
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    const data = await GameMetrics.find({
        gameId,
        date: {
            $gte: new Date(start),
            $lte: new Date(end)
        }
    }).sort({ date: 1 }).lean();

    sendResponse(res, {
        message: `game Matrix info from ${start} to ${end}`,
        status: 200,
        data : data,
        success: true,
    });
}));

gameMatrixRoute.post("/runaggregation",  authenticateAdmin, asyncHandler(async (req, res) => {

    await aggregateDailyMetrics();

    sendResponse(res, {
        message: `Data Processed.`,
        status: 200,
        success: true,
    });
}));


export {gameMatrixRoute}