require('dotenv').config();
const { registerProcessErrorHandlers } = require('./others/mongoUtils');
const config = require('./others/config');

registerProcessErrorHandlers();

try {
    config.assertConfig();
} catch (error) {
    console.error('Invalid server configuration:', error.message);
    process.exit(1);
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const gameSockets = require('./sockets/gameSockets');
const database = require('./others/database');
const GameServer = require("./models/GameServer");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.clientUrl
    }
});

// Needed for correct client IPs behind Traefik/reverse proxies (rate limits).
app.set('trust proxy', 1);

app.use(cors({
    origin: config.clientUrl,
    credentials: true
}));
app.use(express.json());

async function setAllUsersOffline() {
    try {
        await GameServer.updateMany(
            { status: { $ne: 'del' } },
            { $set: { 'players.$[].state': 'offline' } }
        );
        console.log("all servers members set to offline");
    } catch (error) {
        console.error('Failed to set users offline:', error);
    }
}

async function clampNegativeScores() {
    try {
        const result = await GameServer.updateMany(
            { status: { $ne: 'del' }, 'players.score': { $lt: 0 } },
            { $set: { 'players.$[p].score': 0 } },
            { arrayFilters: [{ 'p.score': { $lt: 0 } }] }
        );
        if (result.modifiedCount > 0) {
            console.log(`clamped negative scores on ${result.modifiedCount} server(s)`);
        }
    } catch (error) {
        console.error('Failed to clamp negative scores:', error);
    }
}

async function start() {
    try {
        await database.connect();
        await setAllUsersOffline();
        await clampNegativeScores();

        app.use(userRoutes);
        app.use(gameRoutes);

        app.use((err, req, res, next) => {
            console.error('Express error:', err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Internal Server Error' });
            }
        });

        gameSockets(io);

        server.on('error', (err) => {
            console.error('HTTP server error:', err);
        });

        server.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
