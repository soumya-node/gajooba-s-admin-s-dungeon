import express from "express";
import { Admin } from "../models/admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOtp } from "../utils/generateOtp.js";
import { AdminOTP } from "../models/adminOtp.js";
import { sendOtp } from "../utils/nodemailer.js";

const adminSignRoute = express.Router({mergeParams: true});


adminSignRoute.post("/request-otp", async (req, res) => {

  const { email } = req.body;

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const otp = generateOtp();

  await AdminOTP.deleteMany({ email });

  await AdminOTP.create({
    email,
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 min
  });

  await sendOtp(email, otp);

  res.json({ message: "OTP sent to email" });
});


adminSignRoute.post("/verify-otp/signup", async (req, res) => {

  const { email, otp, name, password } = req.body;

  const record = await AdminOTP.findOne({ email });

  if (!record) {
    return res.status(400).json({ message: "OTP not found" });
  }

  if (record.expiresAt < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    name: name,
    email: record.email,
    password: hashedPassword
  });

  await AdminOTP.deleteMany({ email });

  const token = jwt.sign(
    { adminId: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    message: "Signup successful",
    token
  });

});


adminSignRoute.post("/signIn", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { adminId: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({ token });
});

export {adminSignRoute};