import mongoose from "mongoose"
import { Analytics } from "../models/analytics.js";

const gameAnalytics = async (gameId)=>{
    const objectId = new mongoose.Types.ObjectId(gameId);

    const installs = await Analytics.countDocuments({gameId: objectId, eventType: 'install'});

    const today = new Date();
    today.setHours(0,0,0,0);

    const dau /* Daily Active Users */ = await Analytics.distinct("userId", {
        gameId: objectId,
        eventType: 'session_start',
        createdAt: {$gte : today}
    });

    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);

    const mau /* Monthly Active Users */ = await Analytics.distinct("userId", {
        gameId: objectId,
        eventType: 'session_start',
        createdAt: {$gte : lastMonth}
    });

    return {
        installs,
        dau: dau.length,
        mau: mau.length,
    }

}

export const calculateRetention = async (gameId, installDate)=>{
    const objectId = new mongoose.Types.ObjectId(gameId);

    const startDate = new Date(installDate);
    startDate.setHours(0,0,0,0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const installs = await Analytics.find({
        gameId: objectId,
        eventType: "install",
        createdAt: {$gte: startDate, $lt: endDate}
    }).distinct("userId");

    if(installs.length === 0){
        return {
            totalInstalls: 0,
            day1Retention: 0,
            day7Retention: 0,
        }
    }

    const day1Start = new Date(startDate);
    day1Start.setDate(day1Start.getDate() + 1);

    const day1End = new Date(day1Start);
    day1End.setDate(day1End.getDate() + 1);

    const day7Start = new Date(startDate);
    day7Start.setDate(day7Start.getDate() + 7);

    const day7End = new Date(day7Start);
    day7End.setDate(day7End.getDate() + 1);

    const [day7Users, day1Users] = await Promise.all([
        Analytics.find({
            gameId : objectId,
            eventType: "session_start",
            userId : {$in : installs},
            createdAt : {$gte: day7Start, $lt: day7End}
        }).distinct("userId"),
        Analytics.find({
            gameId: objectId,
            eventType: "session_start",
            userId : {$in : installs},
            createdAt : {$gte: day1Start, $lt: day1End}
        }).distinct("userId")
    ]);

    return {
        totalInstalls: installs.length,
        day1Retention: ((day1Users.length / installs.length) * 100).toFixed(2),
        day7Retention: ((day7Users.length / installs.length) * 100).toFixed(2),
    }

}

export const getDailyInstalls = async (gameId) => {
    return await Analytics.aggregate([
        {
            $match: {
                gameId: new mongoose.Types.ObjectId(gameId),
                eventType: "install"
            }
        },
        {
            $group: {
                _id: {
                    day: { $dayOfMonth: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.month": 1, "_id.day": 1 } }
    ]);
};

export {gameAnalytics}