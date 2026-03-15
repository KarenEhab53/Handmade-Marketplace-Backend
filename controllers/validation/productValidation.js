const Joi = require("joi");

const addProductSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(3).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0),
  status: Joi.string()
    .valid("in the stock", "out of stock")
    .default("in the stock"),

  category: Joi.string().required(),

  reviews: Joi.array().items(
    Joi.object({
      user: Joi.string().hex().length(24).required(),
      rating: Joi.number().min(1).max(5),
      comment: Joi.string().allow("").optional(),
    }),
  ),
});
const updateProductSchema = Joi.object({
  name: Joi.string().min(3),
  description: Joi.string().min(3),
  price: Joi.number().positive(),
  stock: Joi.number().integer().min(0),
  status: Joi.string().valid("in the stock", "out of stock"),
  category: Joi.string(),

  reviews: Joi.array().items(
    Joi.object({
      user: Joi.string().hex().length(24),
      rating: Joi.number().min(1).max(5),
      comment: Joi.string().allow("").optional(),
    }),
  ),
});
module.exports = {
  addProductSchema,
  updateProductSchema
};
