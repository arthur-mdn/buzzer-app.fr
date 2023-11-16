//server.js
require('dotenv').config();
const config = require('./others/config');
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
        origin: config.clientUrl,  // Remplacez par l'URL de votre client, ici c'est l'URL par défaut de create-react-app
        methods: ["GET", "POST"]
    }
});

database.connect();
app.use(cors());
app.use(express.json());
async function setAllUsersOffline() {
    try {
        const servers = await GameServer.find();
        for (const server of servers) {
            server.players.forEach(player => {
                player.state = 'offline';
            });
            await server.save();
        }
        console.log("all servers members set to offline");
    } catch (error) {
        console.error("Error setting users to offline:", error);
    }
}
setAllUsersOffline();

app.use(userRoutes);
app.use(gameRoutes);
gameSockets(io);

server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
