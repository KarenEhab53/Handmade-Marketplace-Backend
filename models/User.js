const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: String,
  buildingNumber: String,
  apartmentNumber: String,
  city: String,
  governorate: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    phone: {
      type: [String],
      validate: {
        validator: function (phones) {
          return phones.every((phone) => /^01[0-2,5]{1}[0-9]{8}$/.test(phone));
        },
        message: "Please use a valid Egyptian phone number (e.g. 01xxxxxxxxx)",
      },
    },
    address: [addressSchema],
    profileImage: {
      type: String,
      default: "default.png",
    },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
