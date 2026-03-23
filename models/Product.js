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
   
  },
  { timestamps: true },
);
const Product=mongoose.model("Product",productSchema);
module.exports=Product;