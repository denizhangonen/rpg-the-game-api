const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const player1v1Schema = new Schema({
  player1: {
    type: Schema.Types.ObjectId,
    ref: 'Char',
    required: true,
  },
  player2: {
    type: Schema.Types.ObjectId,
    ref: 'Char',
    required: true,
  },
  player1Health: {
    type: Number,
    required: true,
    default: 100,
  },
  player2Health: {
    type: Number,
    required: true,
    default: 100,
  },
  player1MaxHealth: {
    type: Number,
    required: true,
  },
  player2MaxHealth: {
    type: Number,
    required: true,
  },
  currentTurn: {
    type: Schema.Types.ObjectId,
    ref: 'Char',
    required: true,
  },
  actions: [
    {
      player: {
        type: Schema.Types.ObjectId,
        ref: 'Char',
        required: true,
      },
      actionType: {
        type: String,
        enum: ['attack', 'heal', 'pass'],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  status: {
    type: String,
    enum: ['ongoing', 'finished'],
    default: 'ongoing',
  },
  winner: {
    type: Schema.Types.ObjectId,
    ref: 'Char',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

player1v1Schema.methods.processAction = function (playerId, actionType, value) {
  if (this.status !== 'ongoing') {
    throw new Error('Battle is already finished');
  }

  const isPlayer1 = this.player1.equals(playerId);
  const opponent = isPlayer1 ? 'player2' : 'player1';
  const opponentHealth = isPlayer1 ? 'player2Health' : 'player1Health';
  const playerHealth = isPlayer1 ? 'player1Health' : 'player2Health';

  const maxHealth = isPlayer1 ? this.player1MaxHealth : this.player2MaxHealth;

  switch (actionType) {
    case 'attack':
      this[opponentHealth] = Math.max(0, this[opponentHealth] - value);
      break;
    case 'heal':
      this[playerHealth] = Math.min(maxHealth, this[playerHealth] + value);
      break;
    case 'pass':
      // Do nothing
      break;
    default:
      throw new Error('Invalid action type');
  }

  this.actions.push({ player: playerId, actionType, value });

  // Check for end of battle
  if (this[opponentHealth] <= 0) {
    this.status = 'finished';
    this.winner = playerId;
  } else if (this[playerHealth] <= 0) {
    this.status = 'finished';
    this.winner = this[opponent];
  } else {
    // Switch turn
    this.currentTurn = this[opponent];
  }

  this.updatedAt = Date.now();
};

module.exports = mongoose.model('Player1vs1', player1v1Schema);
