const express = require('express');

const { body } = require('express-validator');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const monsterController = require('../controllers/Monster');

router.post('/', isAuth, monsterController.createMonster);

router.get('/getMonsters', isAuth, monsterController.getMonsters);

router.get('/getMonstersByMap/:map', isAuth, monsterController.getMonstersByMap);

router.get('/getMonsterById/:monsterId', isAuth, monsterController.getMonsterDetails);

module.exports = router;

