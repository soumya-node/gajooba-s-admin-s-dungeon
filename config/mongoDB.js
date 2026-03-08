import mongoose from "mongoose";
import {configDotenv} from "dotenv";

configDotenv();

async function connect(){
    await mongoose.connect(process.env.MONGO_URI);
}

export {connect}