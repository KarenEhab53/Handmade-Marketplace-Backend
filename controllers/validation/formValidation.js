const Joi = require("joi");

const formSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  comment: Joi.string().min(3).required()
});

module.exports = { formSchema }; 