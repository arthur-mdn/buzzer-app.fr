// gameRoutes.js
const express = require('express');
const GameServer = require('../models/GameServer');
const router = express.Router();
const { generateUniqueCode, authenticateToken } = require('../others/utils');
const { verifyToken } = require('../others/jwtUtils');



router.get('/server/:serverCode', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ success: false, message: "No token provided." });

        try {
            const data = verifyToken(token);
            const { serverCode } = req.params;

            // Rechercher le serveur par code
            const server = await GameServer.findOne({ code: serverCode }).populate('players.user').populate('buzzOrder');

            if (!server) {
                return res.status(404).json({ success: false, message: "Server not found" });
            }

            // Déterminer le rôle
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
        res.status(500).json({ success: false,  message: "Internal Server Error" });
    }
});

router.post('/create-server', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ success: false, message: "No token provided." });

        try {
            const data = verifyToken(token);
            const { serverName, options, selectedImageIndex } = req.body;
            const serverCode = generateUniqueCode();

            const server = new GameServer({
                name: serverName,
                code: serverCode,
                hostId: data.userId,
                gameStatus: "waiting",
                players: [],
                blason:{
                    blason: selectedImageIndex
                },
                options: {
                    autoRestartAfterDecline: options.autoRestartAfterDecline || true,
                    answerPoint: options.answerPoint || 1,
                    winPoint: options.winPoint || 10,
                    deductPointOnWrongAnswer: options.deductPointOnWrongAnswer || false,
                    isPublic: options.isPublic || false,
                }
            });
            await server.save();
            res.json(server);
        }catch (err) {
            res.status(403).json({ success: false, message: "Invalid token." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = router;
