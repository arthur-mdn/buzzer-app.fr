// models/GameServer.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerSchema = new Schema({
    userId: String,
    score: Number,
    state: String, // par exemple, 'waiting', 'buzzed', 'answered'
});

const GameServerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    hostId: {
        type: String, // ceci stocke l'ID de l'hôte
        required: true,
    },
    gameStatus: {
        type: String, // ceci stocke l'ID de l'hôte
        required: true,
        default: "waiting"
    },
    players: [
        {
            userId: String,
            socketId: String,
            state: String,  // 'joined', 'buzzed', etc.
            role: {
                type: String,
                required: true,
                default: "user"
            }
        }
    ],
    buzzOrder: [{
        type: String, // ou mongoose.Schema.Types.ObjectId si vous référencez des objets utilisateur
    }],
    // autres champs comme l'état du jeu, les joueurs, etc.
});

module.exports = mongoose.model('GameServer', GameServerSchema);

