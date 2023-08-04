// Game.js: This model will represent a game instance. It will include fields like gameId, player1, player2, dealer, deck, discardPile, currentTurn, winner, gameStatus (ongoing, ended), and score.

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deck: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
  }],
  discardPile: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
  }],
  currentTurn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  gameStatus: {
    type: String,
    enum: ['ongoing', 'ended'],
    default: 'ongoing',
  },
  score: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
