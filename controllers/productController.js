const Product = require("../models/Product");
const {addProductSchema,updateProductSchema}=require("./validation/productValidation")
const addProduct = async (req, res) => {
  try {
    const { error, value } = addProductSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        msg: "Validation error",
        errors: error.details.map((e) => e.message),
      });
    }

    const {
      name,
      description,
      price,
      stock,
      status = "in the stock",
      category,
      reviews = [],
    } = value;

    let profileImages;

    if (req.files && req.files.length > 0) {
      profileImages = req.files.map(
        (file) =>
          `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      );
    } else {
      profileImages = [
        `${req.protocol}://${req.get("host")}/uploads/default.png`,
      ];
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      status,
      category,
      reviews,
      profileImage: profileImages,
    });

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
    const { error, value } = updateProductSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        msg: "Validation error",
        errors: error.details.map((e) => e.message),
      });
    }
    //get product from product id
    const product = await Product.findById( id );
    //check that product found
    if (!product) return res.status(404).json({ msg: "product not found" });
    //req.body
     Object.assign(product, value);
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
const deleteProduct=async(req,res)=>{
  try {
    //check for id from url
    const { id } = req.params;
    //check for product found
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ msg: "product not found" });
  
    res.status(200).json({
      success: true,
      msg: "product deleted successfully",
    });
  } catch (error) {
     res.status(500).json({ msg: "Server error", error: error.message });
  }
  

}
module.exports = { addProduct, allProduct, updateProduct ,deleteProduct};
