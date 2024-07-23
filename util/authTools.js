const jwt = require('jsonwebtoken');
const AUTH_CONFIG = require('../config/auth');

exports.generateToken = (email, userId, charId) => {
  const token = jwt.sign(
    { email: email, userId: userId, charId: charId },
    AUTH_CONFIG.TOKEN_SECRET,
    {
      expiresIn: '9999h',
    }
  );
  return token;
};

exports.participationTokenForQuickQuote = (quoteId, participantId, email) => {
  const token = jwt.sign(
    { quoteId, participantId, email },
    AUTH_CONFIG.TOKEN_SECRET,
    {
      expiresIn: '999999h',
    }
  );
  return token;
};

