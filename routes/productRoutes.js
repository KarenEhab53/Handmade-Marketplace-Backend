const express = require("express");
const router = express.Router();
const {
  addProduct,
  allProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/addproduct",
  protect,
  isAdmin,
  upload.array("profileImage", 5),
  addProduct,
);
router.get("/allproducts", allProduct);
router.put(
  "/updateproduct/:id",
  protect,
  isAdmin,
  upload.array("profileImage"),
  updateProduct,
);
router.delete("/deleteproduct/:id", protect, isAdmin, deleteProduct);
module.exports = router;
