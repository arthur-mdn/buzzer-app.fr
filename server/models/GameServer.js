const mongoose = require('mongoose');
const { Schema } = mongoose;

const GameServerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 64,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    hostId: {
        type: String,
        required: true,
    },
    gameStatus: {
        type: String,
        required: true,
        default: "waiting",
        enum: ['waiting', 'inProgress', 'buzzed', 'win'],
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
                default: "offline",
                enum: ['online', 'offline'],
            },
            score: {
                type: Number,
                required: true,
                default: 0,
                min: 0,
            },
            wins: {
                type: Number,
                required: true,
                default: 0,
                min: 0,
            },
            role: {
                type: String,
                required: true,
                default: "user",
                enum: ['host', 'user'],
            }
        }
    ],
    buzzOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    blason: {
        blason: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        }
    },
    options: {
        autoRestartAfterDecline: {
            type: Boolean,
            required: true,
            default: true
        },
        answerPoint: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
            max: 100,
        },
        winPoint: {
            type: Number,
            required: true,
            default: 10,
            min: 1,
            max: 1000,
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
    },
    status: {
        type: String,
        required: true,
        default: "ok",
        enum: ['ok', 'del'],
    }
}, { timestamps: true });

module.exports = mongoose.model('GameServer', GameServerSchema);
