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
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            state: {
                type: String,
                required: true,
                default: "offline"
            },
            score: {
                type: Number,
                required: true,
                default: 0
            },
            wins: {
                type: Number,
                required: true,
                default: 0
            },
            role: {
                type: String,
                required: true,
                default: "user"
            }
        }
    ],
    buzzOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    blason:{
        blason:{
            type: Number,
            required:true,
            default: 1
        } // anticipate a future blason object with color and blason number
    },
    options: {
        autoRestartAfterDecline: {
            type: Boolean,
            required:true,
            default: true
        },
        answerPoint: {
            type: Number,
            required:true,
            default: 1
        },
        winPoint: {
            type: Number,
            required:true,
            default: 10
        },
        deductPointOnWrongAnswer: {
            type: Boolean,
            required: true,
            default: false
        },
        isPublic: {
            type: Boolean,
            required: true,
            default: false
        }
    }
});

module.exports = mongoose.model('GameServer', GameServerSchema);

