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
        username: Joi.string(),
        email: Joi.string().email(),
        password: Joi.string().min(6),
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