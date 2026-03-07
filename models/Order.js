const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Card"],
      default: "Cash",
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
