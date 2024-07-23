const express = require('express');

const { body } = require('express-validator');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const experimentsController = require('../controllers/EXPERIMENTS');

router.get('/:id/checkLevelUp', isAuth, experimentsController.checkLvlUp);

router.post('/initTurnBasedCombat', isAuth, experimentsController.initTurnBasedCombat);

router.post('/checkFarmResults', isAuth, experimentsController.checkFarmResults);


module.exports = router;

