const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('./config');

const ACCESS_TOKEN_TTL = '90d';
const REFRESH_TOKEN_TTL = '365d';

function getSecret() {
    const secret = getJwtSecret();
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return secret;
}

function generateAccessToken(payload) {
    return jwt.sign({ ...payload, typ: 'access' }, getSecret(), { expiresIn: ACCESS_TOKEN_TTL });
}

function generateRefreshToken(payload) {
    return jwt.sign({ ...payload, typ: 'refresh' }, getSecret(), { expiresIn: REFRESH_TOKEN_TTL });
}

function generateTokenPair(payload) {
    return {
        token: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}

function generateToken(payload) {
    return generateAccessToken(payload);
}

function verifyAccessToken(token) {
    const data = jwt.verify(token, getSecret());
    if (data.typ === 'refresh') {
        throw new Error('Refresh token cannot be used as access token');
    }
    return data;
}

function verifyRefreshToken(token) {
    const data = jwt.verify(token, getSecret());
    if (data.typ !== 'refresh') {
        throw new Error('Invalid refresh token');
    }
    return data;
}

function verifyToken(token) {
    return verifyAccessToken(token);
}

module.exports = {
    generateToken,
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyToken,
    verifyAccessToken,
    verifyRefreshToken,
    ACCESS_TOKEN_TTL,
    REFRESH_TOKEN_TTL,
};
