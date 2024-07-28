const Monster = require('../models/Monster');
const Char = require('../models/Char');

const GENERAL_ENUMS = require('../shared/enums/generalEnums');

const Battle = require('../models/Battle');
const CharSkill = require('../models/CharSkill');
const Player1vs1 = require('../models/Player1vs1');

exports.get1vs1BattleState = async (battleId, charId) => {
  const battle = await Player1vs1.findById(battleId);
  if (!battle) {
    const error = new Error('Battle not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure the user requesting the battle state is one of the players
  if (
    ![battle.player1.toString(), battle.player2.toString()].includes(charId)
  ) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  return battle;
};

exports.create1vs1Battle = async (player1Id, player2Id) => {
  const player1 = await Char.findById(player1Id);
  const player2 = await Char.findById(player2Id);

  if (!player1 || !player2) {
    const error = new Error('Invalid players');
    error.statusCode = 400;
    throw error;
  }

  const player1Health = player1.hp;
  const player2Health = player2.hp;

  const newBattle = new Player1vs1({
    player1: player1Id,
    player2: player2Id,
    player1Health: player1Health,
    player2Health: player2Health,
    player1MaxHealth: player1Health, // Set max health
    player2MaxHealth: player2Health, // Set max health
    currentTurn: player1Id,
    actions: [],
    status: 'ongoing',
  });

  const savedBattle = await newBattle.save();

  return savedBattle;
};

exports.perform1vs1Action = async (battleId, playerId, actionType, value) => {
  const battle = await Player1vs1.findById(battleId);
  if (!battle) {
    const error = new Error('Battle not found');
    error.statusCode = 404;
    throw error;
  }

  if (battle.status !== 'ongoing' || !battle.currentTurn.equals(playerId)) {
    const error = new Error('Invalid action');
    error.statusCode = 400;
    throw error;
  }

  const modifiedValue = actionType === 'heal' ? 3 : 5;

  // Process the action
  battle.processAction(playerId, actionType, modifiedValue);

  const updatedBattle = await battle.save();

  return updatedBattle;
};

