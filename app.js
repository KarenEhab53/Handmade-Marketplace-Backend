require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");

const app = express();
app.use(express.json());

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

const port=process.env.PORT||3000
app.listen(port,console.log(`working in port ${port}`));

