// Lobby.js: This model will represent a lobby. It will include fields like lobbyId, players (array of Player objects), game (a Game object), and status (waiting, in-game).

const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    default: "waiting",
  },
  // other game-related fields
});

const Lobby = mongoose.model('Lobby', lobbySchema);

module.exports = Lobby;
