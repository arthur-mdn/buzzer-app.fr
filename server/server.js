//server.js
require('dotenv').config();
const { registerProcessErrorHandlers, retryOnVersionError } = require('./others/mongoUtils');
const config = require('./others/config');

registerProcessErrorHandlers();
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

app.use(cors({
    origin: config.clientUrl,
    credentials: true
}));
app.use(express.json());

async function setAllUsersOffline() {
    try {
        const servers = await GameServer.find();
        for (const server of servers) {
            server.players.forEach(player => {
                player.state = 'offline';
            });
            try {
                await retryOnVersionError(() => server.save());
            } catch (error) {
                console.error(`Failed to set users offline for server ${server.code}:`, error);
            }
        }
        console.log("all servers members set to offline");
    } catch (error) {
        console.error('Failed to set users offline:', error);
    }
}

async function start() {
    try {
        await database.connect();
        await setAllUsersOffline();

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
