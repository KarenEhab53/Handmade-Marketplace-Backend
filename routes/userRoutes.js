const express = require("express");
const router = express.Router();
const { addUser, login,getAllusers } = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");
router.post("/register", upload.single("profileImage"), addUser);
router.post("/login", login);
router.get("/allUsers",getAllusers)
module.exports = router;
