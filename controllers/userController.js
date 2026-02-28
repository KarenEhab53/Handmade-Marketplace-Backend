const User = require("../models/User");
const bcrypt = require("bcrypt");

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
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

module.exports = {
  addUser,
};
