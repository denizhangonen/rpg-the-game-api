const express = require('express');

const { body } = require('express-validator/check');

const router = express.Router();

const charController = require('../controllers/Char');

router.get(
    '/:id',
    (req, res, next) => {
        console.log('route : charController.getCharDetails');
        next()
    },
    charController.getCharDetails
  );

router.post(
  '/',
  charController.createChar
);

module.exports = router;
