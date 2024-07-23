const express = require('express');

const { body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/Auth');

router.post(
  '/login',
  [
    body('email').trim().isLength({ min: 1 }),
    body('password').trim().isLength({ min: 1 }),
  ],
  authController.login
);

module.exports = router;
