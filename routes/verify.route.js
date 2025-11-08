const express = require("express");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const router = express.Router();

// Temporary in-memory OTP store
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📤 Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required");

  const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "ChatZoom Email Verification",
    html: `<h3>Your OTP Code: <b>${otp}</b></h3><p>Use this to verify your ChatZoom account.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("OTP sent successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send OTP.");
  }
});

// ✅ Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    res.status(200).send("Email verified successfully!");
  } else {
    res.status(400).send("Invalid OTP or expired.");
  }
});

module.exports = router;
