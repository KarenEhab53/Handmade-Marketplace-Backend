const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { checkoutSchema, adminStatusSchema, userStatusSchema } = require("./validation/checkoutValidation");

// Checkout
const checkoutFromCart = async (req, res) => {
  try {
    const { error } = checkoutSchema.validate(req.body);
    if (error)
      return res.status(400).json({ success: false, msg: error.details[0].message });

    const { address, paymentMethod, phone } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, msg: "Cart is empty" });

    let totalPrice = 0;
    const orderItems = [];

    for (let item of cart.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(400).json({
          success: false,
          msg: `Not enough stock for product ID ${item.productId}`,
        });
      }

      totalPrice += updatedProduct.price * item.quantity;

      orderItems.push({
        productId: updatedProduct.id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        quantity: item.quantity,
      });
    }

    const order = new Order({
userId,
      items: orderItems,
      totalPrice,
      address,
      paymentMethod,
      phone,
    });

    await order.save();

    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      msg: "Order placed successfully from cart",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// Admin status update
const updateAdminStatus = async (req, res) => {
  try {
    const { error, value } = adminStatusSchema.validate(req.body);
    if (error)
      return res.status(400).json({ success: false, msg: error.details[0].message });

    const { orderId } = req.params;
    const { status } = value;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, msg: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ success: true, msg: "Order status updated", data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// User status update
const updateUserStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const userId = req.user.id;

    // ✅ أهم سطر: يجيب الأوردر لو بتاع اليوزر بس
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: "Order not found or not yours"
      });
    }

    // 🔐 المستخدم يقدر يعمل cancel بس
    if (status !== "cancelled") {
      return res.status(403).json({
        success: false,
        msg: "You can only cancel your order"
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      msg: "Order cancelled successfully",
      data: order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};
const getAllOrdersAdmin=async (req,res) => {
    try {
              const orders = await Order.find() .populate("userId", "name email phone address") 
      .populate("items.productId", "name price"); 

    res.json({
      success: true,
      count: orders.length,
      data: orders
    })
    } catch (error) {
         console.error(error);
    res.status(500).json({
      success: false,
      msg: `Server error ${error.message}`
    });
    }
}
const getAllOrdersUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
      .populate("items.productId", "name price");

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: `Server error ${error.message}`
    });
  }
};
module.exports = { checkoutFromCart, updateAdminStatus, updateUserStatus, getAllOrdersAdmin,getAllOrdersUser };