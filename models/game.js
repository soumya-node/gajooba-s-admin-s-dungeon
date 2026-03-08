import mongoose from "mongoose";

let gameSchema = new mongoose.Schema({
    name: String,
    image: String,
    imagePublicId: String,
    playStoreLink: String,
    appStoreLink: String,
    serverbaseUrl: String,
    active: {
        type: Boolean,
        default: true,
    },
    description: String,
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },

    apk: String,
    apkPublicId: String,
    version: String,
    adminToken: String,
});

let Game = mongoose.model('Game', gameSchema);

export {Game};