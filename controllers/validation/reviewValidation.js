const Joi = require("joi");

const reviewSchema = Joi.object({
  productId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow("").optional()
});

module.exports = { reviewSchema };