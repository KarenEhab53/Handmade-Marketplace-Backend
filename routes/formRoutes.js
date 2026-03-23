const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const {isAdmin} = require("../middleware/adminMiddleware");
const auth = require("../middleware/authMiddleware");
const {createForm,getAllForms} = require("../controllers/formController");

// POST /api/contact
router.post("/createform", upload.single("file"), createForm);

// GET /api/contact
router.get("/getForms",auth,isAdmin, getAllForms);

module.exports = router;