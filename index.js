import express from "express";
import { gameRoute } from "./routes/AdminGame.js";
import { analyticsRoute } from "./routes/analytics.js";
import { adminAnalyticsRoute } from "./routes/adminAnalytics.js";
import { connect } from "./config/mongoDB.js";
import { aggregateDailyMetrics } from "./jobs/analyticsJob.js";
import { gameMatrixRoute } from "./routes/gameMetrix.js";
import { adminSignRoute } from "./routes/admin.js";
import { contactQueryrRouter } from "./routes/contactQuery.js";
import { adminUserRoute } from "./routes/adminUser.js";
import cron from "node-cron";

connect().then(()=>{
    console.log('database connected...');
}).catch((error)=>{
    console.log('db connection error', error);
});

cron.schedule("0 * * * *", async()=>{
    console.log("Running analytics job...");    
    await aggregateDailyMetrics();
});

let app = express();
let port = 8080;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/admin/game', gameRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/admin/analytics', adminAnalyticsRoute);
app.use('/api/admin/metrics', gameMatrixRoute);
app.use('/api/admin/sign', adminSignRoute);
app.use('/api/admin/contactquery', contactQueryrRouter);
app.use('/api/admin/users', adminUserRoute);

app.use((err, req, res, next)=>{
    console.log(err);
    res.status(500).json({
        data: null,
        success: false,
        message: err.message || "Internal Server Error",
    });

})

app.listen(port, ()=>{
    console.log(`port: ${port}`);
    console.log('Server Started Listeing...');
});