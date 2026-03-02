const Product = require("../models/Product");

const addProduct = async (req, res) => {
  try {
    //validate data from req.body
    const {
      name,
      description,
      price,
      stock,
      rating = 0,
      status = "in the stock",
      category,
      reviews = [],
    } = req.body;

    //  Validate required fields
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    if (!["in the stock", "out of stock"].includes(status)) {
      return res
        .status(400)
        .json({ msg: "Status must be 'in the stock' or 'out of stock'" });
    }

    // Handle images (single or multiple)
    let profileImages;
    if (req.files && req.files.length > 0) {
      profileImages = req.files.map(
        (file) =>
          `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      );
    } else {
      // Default image if no file uploaded
      profileImages = [
        `${req.protocol}://${req.get("host")}/uploads/default.png`,
      ];
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      rating,
      status,
      category,
      reviews,
      profileImage: profileImages,
    });

    // Return success json
    res.status(201).json({
      msg: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
const allProduct = async (req, res) => {
  try {
    //req to find all products
    const products = await Product.find();

    //check if no products found
    if (!products) return res.status(404).json({ msg: "products not found" });
    //count products
    const count = await Product.countDocuments();

    res.status(200).json({
      success: true,
      msg: "products fetched successfully",
      totalProducts: count,
      data: products,
    });
  } catch (error) {
    console.log(err);
    res.status(500).json({ msg: "Server Error", err: error });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    //get product from product id
    const product = await Product.findById( id );
    //check that product found
    if (!id) return res.status(404).json({ msg: "product not found" });
    //req.body
    const { name, description, price, stock, status, category } = req.body;
    //check the role of admin who can update
    if (req.user && req.user.role == "admin") {
      if (name) product.name = name;
      if (description) product.description = description;
      if (price) product.price = price;
      if (stock) product.stock = stock;
      if (status) product.status = status;
      if (category) product.category = category;
    }
    if (req.files && req.files.length > 0 && req.user.role === "admin") {
      product.profileImage = req.files.map(
        (file) =>
          `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      );
    }
    await product.save();
    res.status(200).json({
      success: true,
      msg: "product updated successfully",
      data: product,
    });
    //update data
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
module.exports = { addProduct, allProduct, updateProduct };
