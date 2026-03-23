require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true,
  }),
);
async function dbconnection() {
  try {
    await mongoose.connect(
      process.env.DB_URL || "mongodb://127.0.0.1:27017/handmadeMarketplace",
    );
    console.log("MOngoose connected successfully");
  } catch (err) {
    console.log("error in mongoose connection: ", err);
  }
}
dbconnection()
app.use("/uploads", express.static("uploads"));
//call routes
const userRoutes=require("./routes/userRoutes")
app.use("/api",userRoutes)
const productRoutes=require("./routes/productRoutes")
app.use("/api",productRoutes)
const cartRoute=require("./routes/cartRoutes")
app.use("/api",cartRoute)
const checkoutRouter=require("./routes/checkoutRoutes")
app.use("/api",checkoutRouter)
const reviewRoutes=require("./routes/reviewRoutes")
app.use("/api",reviewRoutes)

const port=process.env.PORT||3000
app.listen(port,console.log(`working in port ${port}`));

