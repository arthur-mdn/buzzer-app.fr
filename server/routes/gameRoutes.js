const express = require('express');
const GameServer = require('../models/GameServer');
const router = express.Router();
const { generateUniqueCode, authenticateToken } = require('../others/utils');
const { verifyToken } = require('../others/jwtUtils');
const { USER_PUBLIC_FIELDS } = require('../others/userPublicFields');
const { sanitizeOptions } = require('../others/sanitizeOptions');

router.get('/server/:serverCode', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ success: false, message: "No token provided." });

        try {
            const data = verifyToken(token);
            const { serverCode } = req.params;

            const server = await GameServer.findOne({
                code: serverCode,
                status: { $ne: 'del' }
            })
                .populate({ path: 'players.user', select: USER_PUBLIC_FIELDS })
                .populate({ path: 'buzzOrder', select: USER_PUBLIC_FIELDS });

            if (!server) {
                return res.status(404).json({ success: false, message: "Server not found" });
            }

            let role = 'participant';
            if (data.userId === server.hostId) {
                role = 'host';
            }

            res.json({
                success: true,
                server,
                role
            });
        } catch (err) {
            res.status(403).json({ success: false, message: "Invalid token." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.post('/create-server', authenticateToken, async (req, res) => {
    try {
        const { serverName, options = {}, selectedImageIndex } = req.body;
        if (typeof serverName !== 'string' || !serverName.trim() || serverName.trim().length > 64) {
            return res.status(400).json({ success: false, message: "Invalid server name" });
        }

        const serverCode = generateUniqueCode();
        const server = new GameServer({
            name: serverName.trim(),
            code: serverCode,
            hostId: req.userId,
            gameStatus: "waiting",
            players: [],
            blason: {
                blason: selectedImageIndex
            },
            options: sanitizeOptions(options)
        });
        await server.save();
        res.json(server);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
