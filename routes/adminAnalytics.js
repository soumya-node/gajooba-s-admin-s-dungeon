import express from "express";
import { asyncHandler } from "../utils/asyncErrorHandler.js";
import { gameAnalytics } from "../services/analytics.js";
import { sendResponse } from "../utils/responce.js";
import { calculateRetention } from "../services/analytics.js";
import { authenticateAdmin } from "../middlewares/adminAuth.js";

const adminAnalyticsRoute = express.Router({mergeParams: true});

adminAnalyticsRoute.get("/:gameId", authenticateAdmin, asyncHandler(async (req,res)=>{
    const gameId = req.params.gameId;

    const data = await gameAnalytics(gameId);


    sendResponse(res,{
        message: "Install, Daily and Monthy Active Users data",
        status : 200,
        data: data,
        success: true,
    });
}));

adminAnalyticsRoute.get('/:gameId/retention', authenticateAdmin, asyncHandler(async (req,res)=>{
    const {gameId} = req.params;
    const {date} = req.query;

    if(!date){
        sendResponse(res,{
            message: "Install date required!",
            status: 400,
            success: false,
        });
    }

    const data = await calculateRetention(gameId, date);

    sendResponse(res, {
        message: "Calculatioin Succesfull",
        status: 200,
        data: data,
        success: true,
    });
}))

export {adminAnalyticsRoute}