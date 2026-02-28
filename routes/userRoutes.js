const express = require("express");
const router = express.Router();
const { addUser, login } = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");
router.post("/register", upload.single("profileImage"), addUser);
router.post("/login", login);
module.exports = router;
