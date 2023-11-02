// jwtUtils.js
const jwt = require('jsonwebtoken');

const SECRET_KEY = "R08U5T_789324985_7897ezaouc';";

function generateToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '365d' }); // expire en 1 jour
}

function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY);
}

module.exports = { generateToken, verifyToken };
