const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const User = require('../models/User');

module.exports = {
  parseUserId: req => {
    const token = req.header('Authorization').split(' ')[1];
    return jwt.verify(token, process.env.SECRET).user;
  },
  requireAccess: (req, res, next) => {
    try {
      const token = req.header('Authorization').split(' ')[1];
      const userId = jwt.verify(token, process.env.SECRET).user;

      User.findById(userId, (err, match) => {
        if (match) {
          next();
        } else {
          res.sendStatus(404);
        }
      });
    } catch (err) {
      res.sendStatus(403);
    }
  },
  validateSignup: (req, res, next) => {
    try {
      const error = Joi.object({
        password: Joi.string()
          .pattern(/^[a-zA-Z0-9]{6,32}$/)
          .required()
          .error(
            new Error('Password must contain 6 to 32 alphanumeric characters.'),
          ),
        repeatPassword: Joi.any()
          .valid(Joi.ref('password'))
          .required()
          .error(new Error('Passwords do not match.')),
      }).validate({
        password: req.body.password,
        repeatPassword: req.body.repeatPassword,
      }).error;

      if (error) {
        res.status(406).send({
          stage: 'Validation',
          message: error.message,
        });
      } else {
        next();
      }
    } catch (err) {}
  },
  validateSignin: (req, res, next) => {
    try {
      const error = Joi.object({
        password: Joi.string()
          .pattern(/^[a-zA-Z0-9]{6,32}$/)
          .required()
          .error(
            new Error('Password must contain 6 to 32 alphanumeric characters.'),
          ),
      }).validate({
        password: req.body.password,
      }).error;

      if (error) {
        res.status(406).send({
          stage: 'Validation',
          message: error.message,
        });
      } else {
        next();
      }
    } catch (err) {}
  },
};
