// gameSockets.js
const GameServer = require("../models/GameServer");
const { generateToken, verifyToken } = require('../others/jwtUtils');
const User = require("../models/User");

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('a user connected');

        const token = socket.handshake.query.token;

        // Vérifiez le JWT ici. Si le JWT est invalide, déconnectez le socket.
        try {
            const data = verifyToken(token);
            socket.userId = data.userId;
        } catch {
            socket.disconnect();  // Déconnectez le socket si le JWT est invalide
            return;
        }


        async function setUserStateInServers(user, state) {
            try {
                const servers = await GameServer.find({ 'players.user': user._id ,
                    status: { $ne: 'del' }});
                for (const server of servers) {
                    const player = server.players.find(player => player.user.equals(user._id));
                    if (player) {
                        player.state = state;
                        await server.save();
                        const populatedServer = await GameServer.findById(server._id).populate('players.user');
                        io.to(server.code).emit('playersUpdate', populatedServer); // Informer tous les clients dans la salle
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }



        socket.on('updateSocketId', async ({ userId }) => {
            try {
                const user = await User.findOne({ userId: userId });
                if (user) {
                    // Informer l'ancien socket de se déconnecter
                    // console.log(user)
                    // console.log(io.sockets)
                    if (user.socketId && io.sockets.sockets.has(user.socketId)) {
                        io.sockets.sockets.get(user.socketId).emit('forceDisconnect');
                        await setUserStateInServers(user, 'offline');
                    }

                    // Mettre à jour l'ID du socket pour l'utilisateur
                    user.socketId = socket.id;
                    await user.save();
                    socket.emit('socketIdUpdated');
                }
            } catch (error) {
                console.error(error);
            }
        });


        socket.on('joinServer', async ({ serverCode }) => {
            try {
                // console.log(socket.id)
                const server = await GameServer.findOne({ code: serverCode,
                    status: { $ne: 'del' } }).populate('players.user').populate('buzzOrder');

                if (!server) {
                    socket.emit('serverError', { message: "Server does not exist" });
                    return;
                }

                // Récupérez le nom d'utilisateur de la collection User
                const user = await User.findOne({ socketId: socket.id });
                if(user){
                    // Si server.players n'est pas un tableau ou n'existe pas, initialisez-le comme un tableau vide
                    if (!Array.isArray(server.players)) {
                        server.players = [];
                    }

                    // Vérifiez si l'utilisateur est déjà dans la liste des joueurs
                    const existingPlayerIndex = server.players.findIndex(player => player.user.userId === user.userId);

                    if (existingPlayerIndex !== -1) {
                        // console.log('euh')

                        server.players[existingPlayerIndex].state = 'online';
                    } else {
                        // console.log('là')

                        if(user.userId === server.hostId){
                            server.players.push({ user: user, state: 'online', role: 'host' });
                        } else {
                            // console.log('ici')
                            server.players.push({ user: user, state: 'online', role: 'user' });
                        }
                    }
                    // console.log(server.players)

                    server.players = server.players.filter((player, index, self) =>
                            index === self.findIndex((p) => (
                                p.user.userId === player.user.userId && p.user.socketId === player.user.socketId
                            ))
                    );
                    // console.log(server.players)

                    await server.save();
                    socket.join(serverCode);
                    // console.log(server.players)
                    io.to(serverCode).emit('playersUpdate', server);
                }


            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while joining the server" });
            }
        });

        socket.on('joinRoom', (serverCode) => {
            socket.join(serverCode);
        });



        socket.on('startGame', async ({ serverCode }) => {
            const server = await GameServer.findOne({ code: serverCode,
                status: { $ne: 'del' } });
            if (!server) {
                // Gérer l'erreur de serveur non trouvé
            } else {
                server.gameStatus = 'inProgress';
                server.buzzOrder = [];
                await server.save();
                io.to(serverCode).emit('gameStarted');
            }
        });
        socket.on('newGame', async ({ serverCode }) => {
            const server = await GameServer.findOne({ code: serverCode,
                status: { $ne: 'del' } }).populate('players.user').populate('buzzOrder');
            if (!server) {
                // Gérer l'erreur de serveur non trouvé
            } else {
                server.gameStatus = 'waiting';
                server.buzzOrder = [];

                // Réinitialisez les scores de tous les joueurs à zéro
                server.players.forEach(player => {
                    player.score = 0;
                });

                await server.save();
                io.to(serverCode).emit('gameReStarted', { server: server});
            }
        });


        socket.on('cancelGame', async ({ serverCode }) => {
            const server = await GameServer.findOne({ code: serverCode,
                status: { $ne: 'del' } });
            if (!server) {
                // Gérer l'erreur de serveur non trouvé
                return;
            }

            server.gameStatus = 'waiting';
            server.buzzOrder = [];
            await server.save();

            // Informer tous les clients dans la salle des mises à jour
            io.to(serverCode).emit('gameCancelled');
        });


        socket.on('buzz', async ({ serverCode }) => {
            try {
                console.log("buzz serve")

                // Récupérez l'utilisateur en fonction de son socket.id
                const user = await User.findOne({ socketId: socket.id });
                if (!user) {
                    console.error("No user found for socket ID:", socket.id);
                    return;
                }

                // Récupérez le serveur en question
                const server = await GameServer.findOne({ code: serverCode,
                    status: { $ne: 'del' } }).populate('buzzOrder');

                if (server && (server.gameStatus === 'inProgress' || server.gameStatus === 'buzzed')) {

                    // Ajouter le userId de l'utilisateur à la fin de buzzOrder s'il n'est pas déjà présent
                    const userIdString = user._id.toString();
                    if (!server.buzzOrder.some(buzzedUser => buzzedUser._id.toString() === userIdString)) {
                        server.buzzOrder.push(user._id);
                        server.gameStatus = 'buzzed';
                        await server.save();
                    }

                    // Informer l'hôte et potentiellement les autres joueurs
                    const serverUpdated = await GameServer.findOne({ code: serverCode,
                        status: { $ne: 'del' } }).populate('buzzOrder');
                    io.to(serverCode).emit('playerBuzzed', { server: serverUpdated });
                }
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while processing the buzz event" });
            }
        });


        socket.on('acceptAnswer', async ({ userId, serverCode }) => {
            console.log("accept")
            const server = await handleAnswer(userId, serverCode, true);
            if(server.gameStatus === "win"){
                // Informer tous les clients dans la salle des mises à jour
                io.to(serverCode).emit('answerWon', { server: server });
            }else{
                // Informer tous les clients dans la salle des mises à jour
                io.to(serverCode).emit('answerAccepted', { server: server });
            }

        });
        socket.on('acceptAnswerBonus', async ({ userId, serverCode }) => {
            console.log("accept with bonus")
            const server = await handleAnswer(userId, serverCode, true, true);
            if(server.gameStatus === "win"){
                // Informer tous les clients dans la salle des mises à jour
                io.to(serverCode).emit('answerWon', { server: server });
            }else{
                // Informer tous les clients dans la salle des mises à jour
                io.to(serverCode).emit('answerAccepted', { server: server });
            }

        });

        socket.on('declineAnswer', async ({ userId, serverCode }) => {
            console.log("decline")
            const server = await handleAnswer(userId, serverCode, false);
            // console.log(server)
            // Informer tous les clients dans la salle des mises à jour
            io.to(serverCode).emit('answerDeclined', { server: server });
        });
        async function handleUserDisconnect(socketId) {
            try {
                const user = await User.findOne({ socketId: socketId });
                if (user) {
                    await setUserStateInServers(user, 'offline');
                } else {
                    console.log("user not found");
                }
            } catch (error) {
                console.error(error);
            }
        }

        async function handleAnswer(userId, serverCode, accept = true, bonus = false) {
            const server = await GameServer.findOne({ code: serverCode,
                status: { $ne: 'del' } }).populate('players.user').populate('buzzOrder');
            if (!server) {
                // Gérer l'erreur de serveur non trouvé
                return;
            }

            // Si la réponse est acceptée, augmentez le score du joueur.
            if (accept) {
                const player = server.players.find(p => p.user.userId === userId);
                if (player) {
                    if(bonus){
                        player.score += (server.options.answerPoint + 1); // Augmentez le score du joueur avec le point bonus
                    }else{
                        player.score += server.options.answerPoint; // Augmentez le score du joueur
                    }
                    if (player.score >= server.options.winPoint) {
                        server.gameStatus = 'win'; // Le joueur a atteint le seuil de victoire
                        player.wins += 1;
                        await server.save();
                        return GameServer.findOne({code: serverCode}).populate('players.user').populate('buzzOrder');
                    }
                }
            }else{
                if(server.options.deductPointOnWrongAnswer) {
                    const player = server.players.find(p => p.user.userId === userId);
                    if (player) {
                        player.score -= 1; // Déduire le score du joueur
                    }
                }
            }
            if(accept){
                server.buzzOrder = [];
            }else{
                server.buzzOrder = server.buzzOrder.filter(buzzedUser => buzzedUser.userId !== userId);
            }

            // Si buzzOrder est vide, changez le statut du jeu en 'waiting'
            if (server.buzzOrder.length === 0) {
                if(!accept && server.options.autoRestartAfterDecline){
                    server.gameStatus = 'inProgress';

                }else{

                    server.gameStatus = 'waiting';

                }
            }
            await server.save();
            return server;
        }



        socket.on('userLeaving', async () => {
            console.log('user disconnected leaving');
            await handleUserDisconnect(socket.id);
        });

        socket.on('disconnect', async () => {
            console.log('user disconnected');
            await handleUserDisconnect(socket.id);
        });




        socket.on('updateServerOptions', async ({ serverCode, newOptions }) => {
            try {
                const server = await GameServer.findOne({ code: serverCode,
                    status: { $ne: 'del' } });

                if (!server) {
                    socket.emit('serverError', { message: "Server not found" });
                    return;
                }
                // Mettre à jour les options du serveur
                server.options = newOptions;
                await server.save();

                // Informer tous les clients connectés au serveur des nouvelles options
                io.to(serverCode).emit('serverOptionsUpdated', server.options);
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while updating server options" });
            }
        });


        socket.on('updateUserProfile', async ({ userPicture }) => {
            try {
                console.log(userPicture);
                // Mettre à jour l'image et la couleur de profil de l'utilisateur dans MongoDB
                await User.findOneAndUpdate({ socketId: socket.id }, { $set: { userPicture } });
                // Vous pouvez envoyer une réponse au client si nécessaire
                const newUser = await User.findOne({ socketId: socket.id });

                console.log(newUser)
                socket.emit('updateProfile', { newUserRole:newUser.userRole, newUserName: newUser.userName, newUserPicture: newUser.userPicture });
            } catch (error) {
                console.error(error);
                // Gérer l'erreur ici, par exemple, envoyer un message d'erreur au client
            }
        });


        socket.on('kickPlayer', async ({ serverCode, playerId }) => {
            const server = await GameServer.findOne({ code: serverCode,
                status: { $ne: 'del' } }).populate('players.user');
            if (!server) {
                // Gérer l'erreur de serveur non trouvé
                return;
            }

            // Vérifier si l'utilisateur actuel est l'hôte ou un admin
            const user = await User.findOne({ userId: socket.userId });
            if (user && (user.userId === server.hostId || user.userRole === 'admin')) {
                const playerIndex = server.players.findIndex(p => p.user.userId === playerId);
                if (playerIndex !== -1) {
                    // Expulser le joueur
                    server.players.splice(playerIndex, 1);
                    await server.save();

                    // Déconnecter le socket du joueur expulsé
                    const kickedUser = await User.findOne({ userId: playerId });
                    if (kickedUser && io.sockets.sockets.has(kickedUser.socketId)) {
                        io.sockets.sockets.get(kickedUser.socketId).emit('kickServer');
                    }

                    // Informer tous les clients dans la salle des mises à jour
                    io.to(serverCode).emit('playersUpdate', server);
                }
            }
        });


        socket.on('resetScores', async ({ serverCode }) => {
            const server = await GameServer.findOne({
                code: serverCode,
                status: { $ne: 'del' }
            }).populate('players.user').populate('buzzOrder');

            if (!server) {
                return;
            }
            const user = await User.findOne({ userId: socket.userId });
            if (user && (user.userId === server.hostId || user.userRole === 'admin')) {
                server.gameStatus = 'waiting';
                server.buzzOrder = [];

                // Réinitialisez les scores de tous les joueurs à zéro
                server.players.forEach(player => {
                    player.score = 0;
                });

                await server.save();
                io.to(serverCode).emit('gameReStarted', { server: server});
            }
        });


        socket.on('delServer', async ({ serverCode, playerId }) => {
            const server = await GameServer.findOne({
                code: serverCode,
                status: { $ne: 'del' }
            }).populate('players.user');

            if (!server) {
                return;
            }
            const user = await User.findOne({ userId: socket.userId });
            if (user && (user.userId === server.hostId || user.userRole === 'admin')) {
                server.status = 'del';
                await server.save();
                io.to(serverCode).emit('serverDeleted');
            }
        });



        socket.on('adminForceDisconnect', () => {
            // Assurez-vous que seul un admin peut déclencher cet événement
            User.findOne({ userId: socket.userId }).then(user => {
                if (user && user.userRole === 'admin') {
                    io.sockets.sockets.forEach(s => {
                        s.emit('adminForceDisconnect');
                        s.disconnect(true);
                    });
                }
            }).catch(err => {
                console.error(err);
            });
        });

        socket.on('adminForceResetProfilPictures', async () => {
            try {
                const user = await User.findOne({ userId: socket.userId });
                if (user && user.userRole === 'admin') {
                    const userPicture = { smiley: "1", color: "#999" };
                    await User.updateMany({}, { $set: { userPicture } });
                    // Vous pouvez également envoyer une confirmation ou une notification aux utilisateurs ici si nécessaire
                }
            } catch (err) {
                console.error(err);
            }
        });


        socket.on('ping-server', (startTime) => {
            socket.emit('pong-server', {startTime:startTime, endTime:Date.now()});
        });

    });
};
