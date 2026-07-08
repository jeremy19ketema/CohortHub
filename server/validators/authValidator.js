const Joi = require('joi');
module.exports = {
  registerSchema: Joi.object({ email: Joi.string().email().required(), password: Joi.string().min(8).max(128).required(), firstName: Joi.string().min(2).max(50).required(), lastName: Joi.string().min(2).max(50).required() }),
  loginSchema: Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() }),
  refreshTokenSchema: Joi.object({ refreshToken: Joi.string().required() }),
};