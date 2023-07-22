// Lobby.js: This model will represent a lobby. It will include fields like lobbyId, players (array of Player objects), game (a Game object), and status (waiting, in-game).

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LobbySchema = new Schema({
  players: [{
    type: Schema.Types.ObjectId,
    ref: 'Player'
  }],
  status: {
    type: String,
    enum : ['waiting','playing'],
    default: 'waiting'
  }
});

module.exports = mongoose.model('Lobby', LobbySchema);
