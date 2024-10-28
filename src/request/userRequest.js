const { celebrate, Joi } = require('celebrate');

const userRequest = {
  createUser: celebrate({
    body: Joi.object().keys({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  }),
  updateUser: celebrate({
    body: Joi.object().keys({
      id: Joi.number().optional(),
      name: Joi.string(),
      lastname: Joi.string(),
      email: Joi.string().email(),
      isAdmin: Joi.boolean(),
      username: Joi.string(),
      role: Joi.string(),
      companyId: Joi.number(),
      active: Joi.boolean(),
    }),
  }),
  loginUser: celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
};

module.exports = userRequest;