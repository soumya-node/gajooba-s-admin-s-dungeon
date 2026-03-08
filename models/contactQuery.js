import mongoose from "mongoose";
const contactQuerySchema = new mongoose.Schema(
    {
        email : { type : String , require : true , lowercase : true},
        subject : { type : String , required : true},
        message : { type : String , required : true},
    },
    {
        timestamps : true 
    }
);
const ContactQuery =  mongoose.model("contactQuery",contactQuerySchema);

export { ContactQuery }