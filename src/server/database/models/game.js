const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    name: String,
    players: Array,
    playedCards: Array,
    pickStack: Array,
    currentPlayer: String,
    action: String,
    turn: Number,
    round: Number,
    quikPlay: Boolean,
    conf: Object,
    startTime: Number,
    roundStartTime: Number,
    lastTime: Number
});

module.exports = mongoose.model('Game', GameSchema);