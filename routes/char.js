const express = require('express');

const { body } = require('express-validator/check');

const router = express.Router();

const isAuth = require("../middleware/is-auth")

const charController = require('../controllers/Char');

router.get(
    '/:id',
    isAuth,
    charController.getCharDetails
  );

router.post(
  '/',
  isAuth,
  charController.createChar
);

module.exports = router;
