const express = require("express");
const router = express.Router();

const { addProduct } = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Use array to accept single or multiple images under "profileImage"
router.post(
  "/addproduct",
  protect,
  isAdmin,
  upload.array("profileImage", 5),
  addProduct,
);

module.exports = router;
