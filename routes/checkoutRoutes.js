const express = require('express');
const router=express.Router();
const {checkoutFromCart,updateAdminStatus,updateUserStatus,getAllOrdersAdmin,getAllOrdersUser}=require("../controllers/orderController")
const auth=require("../middleware/authMiddleware")
const {isAdmin}=require("../middleware/adminMiddleware")
router.post("/checkout",auth,checkoutFromCart)
router.put("/admin/status/:orderId",auth, isAdmin, updateAdminStatus);
router.get("/allOrders",auth, isAdmin, getAllOrdersAdmin);
router.get("/allOrders/user",auth, getAllOrdersUser);
router.put("/user/status/:orderId", auth, updateUserStatus);
module.exports=router