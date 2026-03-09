const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  phone: Joi.array()
    .items(Joi.string().pattern(/^01[0-2,5]{1}[0-9]{8}$/))
    .min(1)
    .required()
    .messages({
      "string.pattern.base":
        "Please use a valid Egyptian phone number (e.g. 01xxxxxxxxx)",
    }),
  address: Joi.array().items(
    Joi.object({
      street: Joi.string().allow(""),
      buildingNumber: Joi.string().allow(""),
      apartmentNumber: Joi.string().allow(""),
      city: Joi.string().allow(""),
      governorate: Joi.string().allow(""),
      isDefault: Joi.boolean().default(false),
    }),
  ),
  profileImage: Joi.string().default("default.png"),
  role: Joi.string().valid("admin", "user").default("user"),
});

module.exports = registerSchema;
