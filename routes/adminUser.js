import express from "express";
import { authenticateAdmin } from "../middlewares/adminAuth.js";
import {asyncHandler} from "../utils/asyncErrorHandler.js"
import { Game } from "../models/game.js";
import { sendResponse } from "../utils/responce.js";
import mongoose from "mongoose";
import axios from "axios";

const adminUserRoute = express.Router({mergeParams: true});


adminUserRoute.get('/:gameId/:option', authenticateAdmin, asyncHandler(async (req,res)=>{
    let objectId = new mongoose.Types.ObjectId(req.params.gameId);
    let option = req.params.option;
    let { page = 1, limit = 5} = req.query;
    let game = await Game.findById(objectId);


    if(!['all', 'active', 'inactive'].includes(option)){
        sendResponse(res, {
            message: "No a valid user filter option",
            success: false,
            status: 404,
        });
    }


    if(!game || !game.serverbaseUrl){
        sendResponse(res, {
            message: !game ? "No such game found" : "No base server url found for this game.",
            success: false,
            status: 404
        });
    }

    if(!game.adminToken){
        sendResponse(res, {
            message: "Sign up as admin in this game!",
            success: false,
            status: 404
        });
    }

    let result = await axios.get(`${game.serverbaseUrl}/user/userType/all?page=${page}&limit=${limit}`, {
        headers : {
            Authorization : `Bearer ${game.adminToken}`,
        }
    });
    let data = result.data;
    sendResponse(res, {
        message: "Data fetched successfuly",
        status: 200,
        success : true,
        data,
    });
}));


adminUserRoute.patch('/:gameId/:userId/block/:value', authenticateAdmin, asyncHandler(async (req,res)=>{

    let gameObjectId = new mongoose.Types.ObjectId(req.params.gameId);
    let value = req.params.value == 'true' ? true : false ;
    let userObjectId = new mongoose.Types.ObjectId(req.params.userId);

    let game = await Game.findById(gameObjectId);

    if(!game || !game.serverbaseUrl){
        sendResponse(res, {
            message: !game ? "No such game found" : "No base server url found for this game.",
            success: false,
            status: 404
        });
    }

    if(!game.adminToken){
        sendResponse(res, {
            message: "Sign up as admin in this game!",
            success: false,
            status: 404
        });
    }

    await axios.patch(`${game.serverbaseUrl}/user/${userObjectId}/block/${value}`, {} ,{
        headers: {
            Authorization : `Bearer ${game.adminToken}`,
        }
    });

    sendResponse(res, {
        message : value ? "User got unblocked" : "User got bolcked",
        success : true,
        status : 200,
    });
    
}));



export {adminUserRoute}