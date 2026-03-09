const express = require('express');
const router=express.Router();
const {addToCart,getCart,deleteItem,deleteCart}=require("../controllers/cartController")
const protect=require("../middleware/authMiddleware")
router.post("/addcart",protect,addToCart)
router.get("/getcart",protect,getCart)
router.delete("/deleteitem/:productId", protect, deleteItem);
router.delete("/deletecart", protect, deleteCart);
module.exports=router