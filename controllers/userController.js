const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const addUser = async (req, res) => {
  try {
    const { name, email, password, phone = [], address, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "Missing data" });

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
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Missing Data" });
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
    if (!req.body) req.body = {};
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const { name, phone, address } = req.body;

    // Update name
    if (name) user.name = name;

    // Add phones
    if (phone && Array.isArray(phone)) {
      phone.forEach((p) => {
        if (!user.phone.includes(p)) {
          // optional: avoid duplicates
          user.phone.push(p);
        }
      });
    }

  // Add addresses
    if (address && Array.isArray(address)) {
      address.forEach((addr) => {
        const { street, buildingNumber, city, governorate } = addr;
        if (street && buildingNumber && city && governorate) {
          user.address.push({
            street,
            buildingNumber,
            city,
            governorate,
          });
        }
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      msg: "User updated successfully",
      data: user,
    });
  } catch (error) {
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
  updateUser
};
