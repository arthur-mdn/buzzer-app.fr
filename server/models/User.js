// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
        default: 'Unknown'
    },
    creation: {
        type: Date,
        default: Date.now
    },
    socketId: {
        type: String,
        default: null
    },
    userRole: {
        type: String,
        required: true,
        default: "user"
    },
});

module.exports = mongoose.model('User', userSchema);

