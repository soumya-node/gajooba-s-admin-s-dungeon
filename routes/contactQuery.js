import express from "express";
import { authenticateAdmin } from "../middlewares/adminAuth.js";
import { ContactQuery } from "../models/contactQuery.js";
import { sendQueryResEmail } from "../utils/nodemailer.js";

const contactQueryrRouter = express.Router();

contactQueryrRouter.post("/createQuery" , async (req, res)=>{
    try {
        const { email ,subject, message } = req.body;
        if(!email || !subject || !message){
            return res.status(400).json({
                message : "some required field are missing",
            });
        }
        const newQuery = new ContactQuery({
                email ,
                subject ,               
                message ,
            });
        await newQuery.save();
        res.status(201).json({
            message:"new query created succcessfully",
            data : newQuery
        });
    } catch (error) {
        res.status(500).json({
            message: "something went wrong, please try later!",
            error : error.message
        });
    }
});


contactQueryrRouter.get("/getAllquery", authenticateAdmin, async (req , res)=>{
    try {
        const { page = 1 , limit = 10, search = ""} = req.query;
        const filter = {
            $or : [
                { email : {$regex : search , $options : "i"}},
                { subject : {$regex : search , $options : "i"}},
            ]
        }
        const queries = await ContactQuery.find(filter).sort({createdAt :-1}).skip((page - 1 )*limit).limit(Number(limit));
        const totalCount =await ContactQuery.countDocuments(filter);
        res.status(200).json({
            totalCount ,
            data : queries
        });
    } catch (error) {
        res.status(500).json({
            message: "something went wrong, please try later!", 
            error : error.message
        })
    }
});



contactQueryrRouter.get("/getById/:id", authenticateAdmin, async (req,res)=>{
    try {
        const query = await ContactQuery.findById(req.params.id);
        if(!query){
            return res.status(404).json({
                message : "query not found"
            });
        }
        res.status(200).json(query);
    } catch (error) {
        res.status(500).json({
            success : "something went wrong, please try later!",
            message : error.message
        });
    }
});
contactQueryrRouter.delete("/deleteById/:id", authenticateAdmin, async ( req,res )=>{
    try {
        await ContactQuery.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message : "Query deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "something went wrong, please try later!",
            error: error.message
        });
    }
});


contactQueryrRouter.post("/admin/response", authenticateAdmin, async (req,res)=>{
    const { userMailId, subject, responce } = req.body;
    if(!userMailId || !subject || !responce){
        res.status(400).json({
            message: "some fields are missing!",
        });
    }
    sendQueryResEmail(userMailId, subject, responce);
    res.status(200).json({
        message: "Email sent to user",
    });
});

export {contactQueryrRouter} ;                      