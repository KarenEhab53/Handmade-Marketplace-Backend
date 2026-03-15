const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema ,loginSchema,updateUserSchema} = require("./validation/registerSchema");
const fs = require("fs");
const path = require("path");
const addUser = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      //Joi will not stop at the first error; it will collect all validation errors.
      abortEarly: false,
      // Joi will remove any extra fields from req.body that are not defined in the schema.
      stripUnknown: true,
    });
    if(error){
      return res.status(400).json({
        msg:error.details.map((err)=>err.message)
      })
    }
    const { name, email, password, phone = [], address, role } = value;

    const existUser = await User.findOne({ email });
    if (existUser) return res.status(409).json({ msg: "User Already Exist" });

    const hashpassword = await bcrypt.hash(password, 10);

    const profileImage = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : `${req.protocol}://${req.get("host")}/uploads/default.png`;

    const user = await User.create({
      name,
      email,
      password: hashpassword,
      phone,
      address,
      role,
      profileImage,
    });

    res.status(201).json({
      success: true,
      msg: "User Created Successfully",
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
const login = async (req, res) => {
  try {
    //validate req.body
    const {error,value}=loginSchema.validate(req.body,{
      abortEarly:false,
      stripUnknown:true
    })
    const { email, password } = value;
    //check user exist                   password is invisible by default in every query
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    //check password hashed
    const decodepass = await bcrypt.compare(password, user.password);
    if (!decodepass) return res.json({ msg: "wrong password " });
    //generate jwt
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    res.status(200).json({
      success: true,
      msg: "user login successfully",
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        profileImage: user.profileImage,
      },
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
const getAllusers = async (req, res) => {
  try {
    //get users from database
    const users = await User.find();

    //check if users exist
    if (!users) return res.status(404).json({ msg: "No users found" });

    //count users
    const count = await User.countDocuments();
    //send response
    res.status(200).json({
      success: true,
      msg: "users fetched successfully",
      count: count,
      data: users,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
const getAdmins = async (req, res) => {
  try {
    //get user bosed on role admin
    const users = await User.findOne({ role: "admin" });
    if (!users) return res.status(404).json({ msg: "No admins found" });
    const count = await User.countDocuments();
    res.status(200).json({
      success: true,
      msg: "Admins fetched successfully",
      totalAdmins: count,
      data: users,
    });
  } catch (error) {
    console.log(err);
    res.status(500).json({ msg: "Server Error", err: error });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ msg: "user not found" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
const deleteMyAccount = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      success: true,
      msg: "Your account has been deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg: "Server Error",
      error: error.message,
    });
  }
};const updateUser = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = updateUserSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        msg: "Validation error",
        errors: error.details.map((e) => e.message),
      });
    }

    // Destructure validated fields
    let { name, phone, address } = value;

    // Parse strings if sent via form-data
    if (typeof phone === "string") phone = JSON.parse(phone);
    if (typeof address === "string") address = JSON.parse(address);

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // ------------------------
    // Update basic fields
    // ------------------------
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    // ------------------------
    // Update addresses
    // ------------------------
    if (Array.isArray(address)) {
      address.forEach((addr) => {
        // Ensure only one default
        if (addr.isDefault) {
          user.address.forEach((a) => (a.isDefault = false));
        }

        if (addr._id) {
          // Update existing address
          const existing = user.address.id(addr._id);
          if (existing) {
            existing.street = addr.street ?? existing.street;
            existing.buildingNumber =
              addr.buildingNumber ?? existing.buildingNumber;
            existing.apartmentNumber =
              addr.apartmentNumber ?? existing.apartmentNumber;
            existing.city = addr.city ?? existing.city;
            existing.governorate = addr.governorate ?? existing.governorate;
            existing.isDefault =
              typeof addr.isDefault === "boolean"
                ? addr.isDefault
                : existing.isDefault;
          } else {
            // _id not found → add as new
            user.address.push(addr);
          }
        } else {
          // New address → add
          user.address.push(addr);
        }
      });
    }

    // ------------------------
    // Update profile image if uploaded
    // ------------------------
    if (req.file) {
      user.profileImage = `${req.protocol}://${req.get(
        "host",
      )}/uploads/${req.file.filename}`;
    }

    // Save updated user
    await user.save();

    res.status(200).json({
      success: true,
      msg: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Server Error",
      error: error.message,
    });
  }
};
module.exports = {
  addUser,
  login,
  getAllusers,
  getAdmins,
  deleteUser,
  deleteMyAccount,
  updateUser,
};
