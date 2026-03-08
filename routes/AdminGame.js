import express from "express";
import { Game } from "../models/game.js";
import { sendResponse } from "../utils/responce.js";
import { asyncHandler } from "../utils/asyncErrorHandler.js";
import { uploadToCloudinary } from "../services/cloudImageUpload.js";
import { deleteFromCloudinary } from "../services/cloudImageDelete.js";
import { upload } from "../config/multer.js";
import { deleteFile } from "../services/cloudApkDelete.js";
import { uploadApk } from "../services/cloudApkUpload.js";
import { authenticateAdmin } from "../middlewares/adminAuth.js";
import { Admin } from "../models/admin.js";
import axios from "axios";
import mongoose from "mongoose";

let gameRoute = express.Router({mergeParams: true});

gameRoute.post('/new', authenticateAdmin, upload.single("image"), asyncHandler(async (req, res) => {
    let { name, playStoreLink, appStoreLink, serverbaseUrl, description } = req.body;
    if (!name || !serverbaseUrl || !description) {
        return sendResponse(res, {
            status: 404,
            message: "Missing required fields",
            success: false,
        });
    }
    let imageData = null;
    if (req.file) {
        const result = await uploadToCloudinary(req.file);
        imageData = {
            url: result.secure_url,
            public_id: result.public_id,
        };
    }
    let newGame = new Game({
        name,
        image: imageData?.url || "",
        imagePublicId: imageData?.public_id || "",
        playStoreLink,
        appStoreLink,
        serverbaseUrl,
        description,
    });
    let data = await newGame.save();
    return sendResponse(res, {
        message: "Game created successfully",
        success: true,
        data,
        status: 200
    });
}));

gameRoute.delete('/:id', authenticateAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) {
        sendResponse(res, {
            status: 404,
            message: "Game not found",
            success: false,
        });
    }
    if (game.imagePublicId) {
        await deleteFromCloudinary(game.imagePublicId);
    }
    let data = await Game.findByIdAndDelete(id);
    sendResponse(res, {
        message: "Game deleted successfully",
        success: true,
        data,
        status: 200
    });

}));

gameRoute.patch("/:id/apk/upload", authenticateAdmin, upload.single("apk"), asyncHandler(async (req,res)=>{
    let gameId = req.params.id;
    let {version} = req.body; 
    const game = await Game.findById(gameId);
    if(!game){
        sendResponse(res, {
            message: "No Game Found.",
            status: 400,
            success: false,
        });
    }
    if(!req.file){
        sendResponse(res, {
            message: "No APk file found in request.",
            status: 400,
            success: false,
        });
    }
    if(game.apkPublicId){
        await deleteFile(game.apkPublicId);
    }
    const apkData = await uploadApk(req.file);
    game.apk = apkData.url;
    game.apkPublicId = apkData.public_id;
    game.version = version;
    await game.save();
    sendResponse(res,{
        message: "Apk file is uploaded",
        status : 200,
        success: true,
        data: game
    });
}));

gameRoute.delete('/:id/apk/delete', authenticateAdmin, asyncHandler(async (req,res)=>{
    const id = req.params.id;
    const game = await Game.findById(id);
    if (!game) {
        return sendResponse(res, {
            status: 404,
            message: "Game not found",
            success: false,
        });
    }
    if (game.apkPublicId) {
        await deleteFile(game.apkPublicId);
    }
    game.apk = "";
    game.apkPublicId = "";
    game.version  = "00";
    await game.save();
    return sendResponse(res, {
        status: 200,
        message: "APK deleted successfully",
        success: true,
        data: game
    });
}))

gameRoute.patch('/:id/image', authenticateAdmin, upload.single("image"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) {
        return sendResponse(res, {
            status: 404,
            message: "Game not found",
            success: false,
        });
    }
    if (req.file) {
        if (game.imagePublicId) {
            await deleteFromCloudinary(game.imagePublicId);
        }
        const imageData = await uploadToCloudinary(req.file);
        game.image = imageData.url;
        game.imagePublicId = imageData.public_id;
    }
    await game.save();
    return sendResponse(res, {
        message: "Game updated successfully",
        success: true,
        data: game,
        status: 200,
    });
}));

gameRoute.patch('/:id', authenticateAdmin, asyncHandler(async (req,res)=>{
    let id = req.params.id;
    let { name, playStoreLink, appStoreLink, serverbaseUrl, description } = req.body;
    let game = await Game.findById(id);
    if(!game){
        sendResponse(res, {
            message: "Game not found",
            success: false,
            status: 404
        });
    }
    game.name = name;
    game.playStoreLink = playStoreLink;
    game.appStoreLink = appStoreLink;
    game.serverbaseUrl = serverbaseUrl;
    game.description = description;
    await game.save();
    sendResponse(res, {
        message: "Game info updated",
        status: 200,
        success: true,
    })
}));

gameRoute.patch('/:id/active/:value', authenticateAdmin, asyncHandler(async (req,res)=>{
    let {value, id} = req.params;
    if(!['true', 'false'].includes(value)){
        sendResponse(res, {
            status: 400,
            message: "The value field requires valid value",
            success: false,
        });
    }
    value = value == 'true' ? true : false;
    let data = await Game.findByIdAndUpdate(id, {$set : {active : value}});
    sendResponse(res, {
        message : value ? "Game is active now": "Game is deactive now",
        status: 200,
        success: true,
    })
}));

gameRoute.post("/:id/reqest-otp", authenticateAdmin, asyncHandler(async (req,res)=>{

    let [admin, game] = await Promise.all([
        Admin.findById(req.admin.adminId), 
        Game.findById(new mongoose.Types.ObjectId(req.params.id))
    ]);

    if(!game || ! game.serverbaseUrl ){
        sendResponse(res,{
            message: !game ? "No such game found" : "No base url for the server is found for this route",
            success: false,
            status: 404
        })
    }
    await axios.post(`${game.serverbaseUrl}/admin/signup/send-otp`, {
        email : admin.email,
    });
    sendResponse(res, {
        message: "Otp send to your email " + admin.email,
        success: true,
        status: 200
    });
}));

gameRoute.post('/:id/request-otp-verify', authenticateAdmin, asyncHandler(async (req,res)=>{
    let {otp} = req.body;
    if(!otp) sendResponse(res, {
        message: "Otp is required to  verify email in this game as admin.",
        success: false,
        status: 404
    });

    let [admin, game] = await Promise.all([
        Admin.findById(req.admin.adminId), 
        Game.findById(new mongoose.Types.ObjectId(req.params.id))
    ]);

    if(!game || ! game.serverbaseUrl ){
        sendResponse(res,{
            message: !game ? "No such game found" : "No base url for the server is found for this route",
            success: false,
            status: 404
        })
    }

    await axios.post(`${game.serverbaseUrl}/admin/signup/verify-otp`,{
        email: admin.email,
        otp: otp,
    });

    sendResponse(res,{
        message: "verification successful",
        status: 200,
        success: true,
    });
}));

gameRoute.post('/:id/request-signup', authenticateAdmin, asyncHandler(async (req,res)=>{
    let [admin, game] = await Promise.all([
        Admin.findById(req.admin.adminId), 
        Game.findById(new mongoose.Types.ObjectId(req.params.id))
    ]);

    if(!password) sendResponse(res, {
        message: "password is required to signup in this game as admin.",
        success: false,
        status: 404
    });

    if(!game || ! game.serverbaseUrl ){
        sendResponse(res,{
            message: !game ? "No such game found" : "No base url for the server is found for this route",
            success: false,
            status: 404
        })
    }

    await axios.post(`${game.serverbaseUrl}/admin/signup/complete`,{
        email: admin.email,
        firstName: admin.name ,
        lastName: "From Gajooba.",
        password: admin.password,
        confirmPassword: admin.password,
    });

    let result = await axios.post(`${game.serverbaseUrl}/admin/login`, {
        email: admin.email,
        password: password,
    });

    game.adminToken = result.data.token;

    await game.save();

    sendResponse(res, {
        message: 'Token saved succesfuly.',
        succes: true,
        status : 200
    });

}));

gameRoute.post('/:id/request-signin', authenticateAdmin, asyncHandler(async (req,res)=>{
    let [admin, game] = await Promise.all([
        Admin.findById(req.admin.adminId), 
        Game.findById(new mongoose.Types.ObjectId(req.params.id))
    ]);
    if(!game || ! game.serverbaseUrl ){
        sendResponse(res,{
            message: !game ? "No such game found" : "No base url for the server is found for this route",
            success: false,
            status: 404
        })
    }
    let result = await axios.post(`${game.serverbaseUrl}/admin/login`, {
        email: admin.email,
        password: admin.password,
    });
    
    game.adminToken = result.data.token;

    sendResponse(res, {
        message: 'Token saved succesfuly.',
        succes: true,
        status : 200
    });

}))

export {gameRoute}