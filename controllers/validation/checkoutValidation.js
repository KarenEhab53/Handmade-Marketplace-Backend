const Joi = require("joi");

const checkoutSchema = Joi.object({
  address: Joi.object({
    street: Joi.string().min(3).required(),
    buildingNumber: Joi.string().required(),
    apartmentNumber: Joi.string().allow("", null),
    city: Joi.string().required(),
    governorate: Joi.string().required(),
  }).required(),

  paymentMethod: Joi.string()
    .valid("cash", "card")
    .required(),

  phone: Joi.string()
    .pattern(/^01[0125][0-9]{8}$/)
    .required().messages({
    "string.pattern.base": "Invalid Egyptian phone number",
    "any.required": "Phone is required",
  })
});
const adminStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
    .required(),
});
const userStatusSchema = Joi.object({
  status: Joi.string()
    .valid( "cancelled")
    .required(),
});

module.exports = {checkoutSchema,adminStatusSchema,userStatusSchema};