const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userName: {
        type: String,
        required: true,
        default: 'Unknown',
        trim: true,
        maxlength: 32,
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
        default: "user",
        enum: ['user', 'admin'],
    },
    userPicture: {
        smiley: {
            type: Number,
            default: 1
        },
        color: {
            type: String,
            default: "#999"
        }
    },
    userTheme: {
        background: {
            type: String,
            default: "default",
            required: true
        }
    }
});

module.exports = mongoose.model('User', userSchema);
