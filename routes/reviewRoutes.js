const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  addReview,
  getProductReviews,
  deleteReview,
  updateReview
} = require("../controllers/reviewController");

router.post("/addreview", auth, addReview);

// ✅ get reviews for product
router.get("/review/:productId", getProductReviews);

// ✅ delete review
router.delete("/review/:reviewId", auth, deleteReview);

// ✅ update review
router.put("/review/:reviewId", auth, updateReview);

module.exports = router;