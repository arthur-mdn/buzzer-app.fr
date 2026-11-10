const mongoose = require('mongoose');
const { Schema } = mongoose;

const THEME_BACKGROUNDS = [
    'default',
    'blue',
    'dark',
    'light',
    'gradient',
    'green',
    'purple',
    'yellow',
    'dark-green',
];

const USER_LANGUAGES = ['fr', 'en', 'es', 'de', 'zh', 'ru'];

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
            default: 1,
            min: 1,
            max: 30,
        },
        color: {
            type: String,
            default: "#999",
            match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
        }
    },
    userTheme: {
        background: {
            type: String,
            default: "default",
            required: true,
            enum: THEME_BACKGROUNDS,
            maxlength: 32,
        }
    },
    userLanguage: {
        type: String,
        default: 'fr',
        required: true,
        enum: USER_LANGUAGES,
        maxlength: 8,
    },
});

module.exports = mongoose.model('User', userSchema);
module.exports.USER_LANGUAGES = USER_LANGUAGES;
