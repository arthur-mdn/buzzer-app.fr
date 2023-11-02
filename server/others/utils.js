const {verifyToken} = require("./jwtUtils");

function generateUniqueCode() {
    const chars = '123456789abcdefghijkmnopqrstuvwxyz';
    return 'xxxx-xxxx-xxxx'.replace(/[x]/g, (c) => {
        const r = Math.floor(Math.random() * chars.length);
        return chars.charAt(r);
    });
}
function generateUserId(length = 128) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // Si aucun token n'est fourni

    try {
        const data = verifyToken(token);
        req.userId = data.userId; // Stockez l'userId pour y accéder dans les routes suivantes
        next();
    } catch {
        res.sendStatus(403); // Token non valide
    }
}

module.exports = {
    generateUniqueCode,
    generateUserId,
    authenticateToken
};

