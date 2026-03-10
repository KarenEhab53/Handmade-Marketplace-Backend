const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "user not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

    await user.save();
    await sendEmail(user.email, "Password reset OTP", `Your OTP is ${otp}`);
    res.json({
      success: true,
      msg: "OTP Sent to email",
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// verifyOtp.js
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const user = await User.findOne({
      otp,
      otpExpire: { $gt: Date.now() }, // OTP not expired
    });
    if (!user) return res.status(400).json({ msg: "Invalid or expired OTP" });

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: "10m" }
    );

    // Clear OTP
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      msg: "OTP verified, use token in header to reset password",
      resetToken,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    if (!authHeader)
      return res.status(400).json({ msg: "Reset token missing in header" });

    const token = authHeader.split(' ')[1]; // Bearer <reset token >
    if (!token) return res.status(400).json({ msg: "Invalid token format" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword)
      return res.status(400).json({ msg: "Password fields are required" });
    if (password !== confirmPassword)
      return res.status(400).json({ msg: "Passwords do not match" });

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, msg: "Password reset successfully" });
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(400).json({ msg: "Reset token expired" });
    res.status(500).json({ msg: err.message });
  }
};
module.exports = {
  forgetPassword,
  verifyOtp,
  resetPassword,
};