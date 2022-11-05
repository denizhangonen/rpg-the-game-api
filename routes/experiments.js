const express = require('express');

const { body } = require('express-validator/check');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const experimentsController = require('../controllers/EXPERIMENTS');

router.get('/:id/checkLevelUp', isAuth, experimentsController.checkLvlUp);

module.exports = router;

