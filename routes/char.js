const express = require('express');

const { body } = require('express-validator/check');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const charController = require('../controllers/Char');

router.get('/:id', isAuth, charController.getCharDetails);

router.post('/:id/sendToFarming', isAuth, charController.sendToFarming);

router.get('/:id/status', isAuth, charController.checkCharStatus);

router.post('/', isAuth, charController.createChar);

module.exports = router;

