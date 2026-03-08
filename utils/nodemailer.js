import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";

configDotenv();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendQueryResEmail = async (email, subject, responce)=>{
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Responce on " + subject,
        html: responce,
    });
}


const sendOtp = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Admin Signup OTP",
    text: `Your OTP is ${otp}`
  });
};

export { sendQueryResEmail, sendOtp};