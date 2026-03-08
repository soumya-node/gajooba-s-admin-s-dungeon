import mongoose from "mongoose";

const adminOtpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiresAt: Date
}, { timestamps: true });

const AdminOTP = mongoose.model("AdminOTP", adminOtpSchema);

export { AdminOTP };