const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: "product not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    // check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        msg: `Only ${product.stock} left in stock`,
      });
    }

    // check if product exists in cart
    const existProduct = cart.items.findIndex((item) =>
      item.productId.equals(productId),
    );

    if (existProduct > -1) {
      const newQuantity = cart.items[existProduct].quantity + quantity;
      if (newQuantity > product.stock) {
        return res
          .status(400)
          .json({
            success: false,
            msg: `Only ${product.stock} items available in stock`,
          });
      }
      cart.items[existProduct].quantity = newQuantity;
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          msg: `Only ${product.stock} items available in stock`,
        });
      }
      cart.items.push({
        productId,
        quantity,
        price: product.price,
      });
    }
    await cart.save();

    res.status(201).json({
      success: true,
      msg: "product added to cart successfully",
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: `server error ${error.message}` });
  }
};
const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // correct

    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price profileImages",
    );

    if (!cart)
      return res.status(404).json({ success: false, msg: "Cart not found" });

    res.status(200).json({
      success: true,
      msg: "Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      msg: `Server error: ${error.message}`,
    });
  }
};
const deleteItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // ✅ Find cart first
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    // ✅ Check the item actually exists in the cart (no Product lookup needed)
    const itemExists = cart.items.some(
      (item) => item.productId?.toString() === productId,
    );
    if (!itemExists)
      return res.status(404).json({ msg: "Item not found in cart" });

    // ✅ Remove the item
    cart.items = cart.items.filter(
      (item) => item.productId?.toString() !== productId,
    );

    // ✅ Recalculate total (only once)
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    await cart.save();

    res.status(200).json({
      success: true,
      msg: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: `Server error: ${error.message}` });
  }
};
const deleteCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOneAndDelete({userId});
    if (!cart) return res.status(404).json({ msg: "cart not found" });

    res.status(200).json({
      success: true,
      msg: "Cart deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: `Server error: ${error.message}` });
  }
};
module.exports = {
  addToCart,
  getCart,
  deleteItem,deleteCart
};
