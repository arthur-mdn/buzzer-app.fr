const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('./config');

function getSecret() {
    const secret = getJwtSecret();
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return secret;
}

function generateToken(payload) {
    return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

function verifyToken(token) {
    return jwt.verify(token, getSecret());
}

module.exports = { generateToken, verifyToken };
