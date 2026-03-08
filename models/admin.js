import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: String,
  name: String,
  email: { 
    type: String, 
    unique: true },
  password: String,
}, {
    timestamps: true
});

const Admin = mongoose.model("Admin", adminSchema);


export {Admin}