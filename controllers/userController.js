const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken")
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
    console.log(err); // ✅ this will show the real error in terminal
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
module.exports = {
  addUser,
  login
};
