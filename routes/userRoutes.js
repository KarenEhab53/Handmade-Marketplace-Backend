const express = require("express");
const router = express.Router();
const {
  addUser,
  login,
  getAllusers,
  getAdmins,
  deleteUser,
  deleteMyAccount,
  updateUser,
} = require("../controllers/userController");
const {forgetPassword,verfiyOtp,resetPassword}=require("../controllers/forgotPassController")
const upload = require("../middleware/uploadMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const protect = require("../middleware/authMiddleware");
router.post("/register", upload.single("profileImage"), addUser);
router.post("/login", login);
router.get("/allUsers", getAllusers);
router.get("/allAdmins", getAdmins);
router.delete("/deleteuser/:id", protect, isAdmin, deleteUser);
router.delete("/deleteMyaccount", protect, deleteMyAccount);
router.put("/updateUser", protect, updateUser);
router.post("/forgot-password", forgetPassword);
router.post("/verify-otp", verfiyOtp);
router.post("/reset-password", resetPassword);
module.exports = router;
