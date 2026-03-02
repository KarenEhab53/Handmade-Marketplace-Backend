const express = require("express");
const router = express.Router();

const { addProduct,allProduct,updateProduct } = require("../controllers/productController");
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
router.get("/allproducts",allProduct);
router.put(
  "/updateproduct/:id",
  protect,
  isAdmin,
  upload.array("profileImage", 5),
  updateProduct,
);
module.exports = router;
