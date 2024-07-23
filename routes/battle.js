const express = require('express');

const { body } = require('express-validator'); // Update import

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const battleController = require('../controllers/Battle');

router.post('/createBattle', isAuth, battleController.createBattle);

router.post('/:battleId/attack', isAuth, battleController.attack);

// New endpoints for 1v1 battles
// Endpoint to create a new 1v1 battle
router.post('/1vs1/create', isAuth, battleController.create1vs1Battle);

// Endpoint to perform an action in the 1v1 battle
router.post(
  '/1vs1/:battleId/action',
  isAuth,
  battleController.perform1vs1Action
);

// Endpoint to get the current state of the 1v1 battle
router.get(
  '/1vs1/:battleId/state',
  isAuth,
  battleController.get1vs1BattleState
);

module.exports = router;

