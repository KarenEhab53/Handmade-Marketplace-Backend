const express = require("express");
const router = express.Router();
const { addUser, login,getAllusers,getAdmins } = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");
router.post("/register", upload.single("profileImage"), addUser);
router.post("/login", login);
router.get("/allUsers",getAllusers)
router.get("/allAdmins",getAdmins)
module.exports = router;
