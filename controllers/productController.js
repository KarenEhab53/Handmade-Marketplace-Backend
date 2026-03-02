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

module.exports = { addProduct };
