const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    profileImage: { type: [String], default: ["default.png"] },
    stock: { type: Number, required: true, min: 0, default: 1 },
    rating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["in the stock", "out of stock"],
      default: "in the stock",
    },
    category: { type: String, required: true },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
      },
    ],
  },
  { timestamps: true },
);
const Product=mongoose.model("Product",productSchema);
module.exports=Product;