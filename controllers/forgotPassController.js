const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require('bcrypt');
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

const verfiyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({
      otp,
      otpExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.otpVerified = true;
    await user.save();

    res.json({
      success: true,
      msg: "OTP verified",
      userId: user._id, // ✅ return this
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ otpVerified: true });
    if (!user) return res.status(403).json({ msg: "OTP not verified" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpVerified = undefined;

    await user.save();

    res.json({ success: true, msg: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
module.exports={
    forgetPassword,
    verfiyOtp,resetPassword
}