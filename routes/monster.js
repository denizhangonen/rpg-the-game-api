const express = require('express');

const { body } = require('express-validator/check');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const monsterController = require('../controllers/Monster');

router.post('/', isAuth, monsterController.createMonster);

module.exports = router;

