const { validationResult } = require('express-validator/check');

const AUTH_TOOLS = require('../util/authTools');
const customError = require('../util/customError');

const User = require('../models/User');

exports.login = async (req, res, next) => {
  console.log('Got a login req!!');
  const errors = validationResult(req);
  // Check if any errors exists
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'validation failed', errors: errors });
  }

  const { email, password } = req.body;

  try {    
    const user = await User.findOne({ email: email });    
    if (!user) {
      const error = customError.dError('Wrong username or password.', 401);
      throw error;
    }
    if (user.password !== password) {
      const error = customError.dError('Wrong username or password.', 401);
      throw error;
    }

    const token = AUTH_TOOLS.generateToken(email, user._id);

    // return response
    res.status(200).json({
      token: token,
      userId: user._id.toString(),
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
