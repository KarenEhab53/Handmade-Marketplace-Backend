const express = require("express");
const router = express.Router();
const { addUser } = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", upload.single("profileImage"), addUser);

module.exports = router;
