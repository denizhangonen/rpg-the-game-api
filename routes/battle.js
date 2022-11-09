const express = require('express');

const { body } = require('express-validator/check');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const battleController = require('../controllers/Battle');

router.post('/createBattle', isAuth, battleController.createBattle);

module.exports = router;

