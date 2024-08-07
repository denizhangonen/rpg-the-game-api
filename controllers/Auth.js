const { validationResult } = require('express-validator');

const AUTH_TOOLS = require('../util/authTools');
const customError = require('../util/customError');

const User = require('../models/User');
const Char = require('../models/Char');

exports.login = async (req, res, next) => {
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

    const char = await Char.findOne({ userId: user._id });

    const token = AUTH_TOOLS.generateToken(email, user._id, char._id);

    console.log('login req user:', user);

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

