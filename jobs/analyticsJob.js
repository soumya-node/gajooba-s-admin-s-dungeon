import { Analytics } from "../models/analytics.js";
import { GameMetrics } from "../models/gameMatrics.js";

const aggregateDailyMetrics = async () => {

    const today = new Date();
    today.setHours(0,0,0,0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const result = await Analytics.aggregate([
        {
            $match: {
                createdAt: { $gte: today, $lt: tomorrow }
            }
        },
        {
            $group: {
                _id: "$gameId",

                installs: {
                    $sum: {
                        $cond: [{ $eq: ["$eventType", "install"] }, 1, 0]
                    }
                },

                sessions: {
                    $sum: {
                        $cond: [{ $eq: ["$eventType", "session_start"] }, 1, 0]
                    }
                },

                crashes: {
                    $sum: {
                        $cond: [{ $eq: ["$eventType", "crash"] }, 1, 0]
                    }
                },

                users: { $addToSet: "$userId" }
            }
        }
    ]);

    for (let data of result) {
        await GameMetrics.updateOne(
            { gameId: data._id, date: today },
            {
                $set: {
                    installs: data.installs,
                    sessions: data.sessions,
                    crashes: data.crashes,
                    dau: data.users.length,
                }
            },
            { upsert: true }
        );
    }
};


export {aggregateDailyMetrics}