const express = require('express');

const { body } = require('express-validator/check');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const itemController = require('../controllers/Item');

router.post('/', isAuth, itemController.createItems);

module.exports = router;

