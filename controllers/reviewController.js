const Product = require("../models/Product");
const Review = require("../models/Reviews");
const { reviewSchema } = require("./validation/reviewValidation");

const addReview = async (req, res) => {
  try {
    const { error, value } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const userId = req.user.id;
    const { productId, rating, comment } = value;

    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        msg: "You already reviewed this product",
      });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
    });


    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: review.id },
    });

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Recalculate rating
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;

    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews;

    product.numReviews = numReviews;
    product.rating = Number(avgRating.toFixed(1));

    await product.save();

    res.json({
      success: true,
      msg: "Review added successfully",
      data: review,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: `Server error ${err.message}` });
  }
};
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email");

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: userId
    });

    if (!review) {
      return res.status(404).json({
        msg: "Review not found or not yours"
      });
    }

    // Optional: update product rating after deleting review
    const product = await Product.findById(review.product);
    if (product) {
      const reviews = await Review.find({ product: product._id });
      const numReviews = reviews.length;
      product.numReviews = numReviews;
      product.rating = numReviews
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews).toFixed(1)
        : 0;
      await product.save();
    }

    res.json({
      success: true,
      msg: "Review deleted"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Find review by _id and user
    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });

    if (!review) {
      return res.status(404).json({
        msg: "Review not found or not yours"
      });
    }

    // Update fields if provided
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Update product rating
    const product = await Product.findById(review.product);
    if (product) {
      const reviews = await Review.find({ product: product._id });
      const numReviews = reviews.length;
      product.numReviews = numReviews;
      product.rating = numReviews
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews).toFixed(1)
        : 0;
      await product.save();
    }

    res.json({
      success: true,
      msg: "Review updated",
      data: review
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  deleteReview,
  updateReview
};