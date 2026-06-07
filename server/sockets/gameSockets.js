// gameSockets.js
const GameServer = require("../models/GameServer");
const { generateToken, verifyToken } = require('../others/jwtUtils');
const { retryOnVersionError } = require('../others/mongoUtils');
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
                        await retryOnVersionError(() => server.save());
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

                    await retryOnVersionError(() => server.save());
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
            try {
                await retryOnVersionError(async () => {
                    const server = await GameServer.findOne({ code: serverCode,
                        status: { $ne: 'del' } });
                    if (!server) {
                        return;
                    }
                    server.gameStatus = 'inProgress';
                    server.buzzOrder = [];
                    await server.save();
                });
                io.to(serverCode).emit('gameStarted');
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while starting the game" });
            }
        });
        socket.on('newGame', async ({ serverCode }) => {
            try {
                const server = await retryOnVersionError(async () => {
                    const doc = await GameServer.findOne({ code: serverCode,
                        status: { $ne: 'del' } }).populate('players.user').populate('buzzOrder');
                    if (!doc) {
                        return null;
                    }
                    doc.gameStatus = 'waiting';
                    doc.buzzOrder = [];
                    doc.players.forEach(player => {
                        player.score = 0;
                    });
                    await doc.save();
                    return GameServer.findOne({ code: serverCode,
                        status: { $ne: 'del' } }).populate('players.user').populate('buzzOrder');
                });
                if (server) {
                    io.to(serverCode).emit('gameReStarted', { server });
                }
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while restarting the game" });
            }
        });


        socket.on('cancelGame', async ({ serverCode }) => {
            try {
                await retryOnVersionError(async () => {
                    const server = await GameServer.findOne({ code: serverCode,
                        status: { $ne: 'del' } });
                    if (!server) {
                        return;
                    }
                    server.gameStatus = 'waiting';
                    server.buzzOrder = [];
                    await server.save();
                });
                io.to(serverCode).emit('gameCancelled');
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while cancelling the game" });
            }
        });


        socket.on('buzz', async ({ serverCode }) => {
            try {
                console.log("buzz serve");

                await retryOnVersionError(async () => {
                    const user = await User.findOne({ socketId: socket.id });
                    if (!user) {
                        console.error("No user found for socket ID:", socket.id);
                        return;
                    }

                    const server = await GameServer.findOne({ code: serverCode,
                        status: { $ne: 'del' } }).populate('buzzOrder');

                    if (server && (server.gameStatus === 'inProgress' || server.gameStatus === 'buzzed')) {
                        const userIdString = user._id.toString();
                        if (!server.buzzOrder.some(buzzedUser => buzzedUser._id.toString() === userIdString)) {
                            server.buzzOrder.push(user._id);
                            server.gameStatus = 'buzzed';
                            await server.save();
                        }
                    }
                });

                const serverUpdated = await GameServer.findOne({ code: serverCode,
                    status: { $ne: 'del' } }).populate('buzzOrder');
                if (serverUpdated) {
                    io.to(serverCode).emit('playerBuzzed', { server: serverUpdated });
                }
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while processing the buzz event" });
            }
        });


        socket.on('acceptAnswer', async ({ userId, serverCode }) => {
            try {
                console.log("accept");
                const server = await handleAnswer(userId, serverCode, true);
                if (!server) {
                    return;
                }
                if (server.gameStatus === "win") {
                    io.to(serverCode).emit('answerWon', { server });
                } else {
                    io.to(serverCode).emit('answerAccepted', { server });
                }
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while accepting the answer" });
            }
        });
        socket.on('acceptAnswerBonus', async ({ userId, serverCode }) => {
            try {
                console.log("accept with bonus");
                const server = await handleAnswer(userId, serverCode, true, true);
                if (!server) {
                    return;
                }
                if (server.gameStatus === "win") {
                    io.to(serverCode).emit('answerWon', { server });
                } else {
                    io.to(serverCode).emit('answerAccepted', { server });
                }
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while accepting the answer" });
            }
        });

        socket.on('declineAnswer', async ({ userId, serverCode }) => {
            try {
                console.log("decline");
                const server = await handleAnswer(userId, serverCode, false);
                if (!server) {
                    return;
                }
                io.to(serverCode).emit('answerDeclined', { server });
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while declining the answer" });
            }
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
            return retryOnVersionError(async () => {
                const server = await GameServer.findOne({ code: serverCode,
                    status: { $ne: 'del' } }).populate('players.user').populate('buzzOrder');
                if (!server) {
                    return null;
                }

                if (accept) {
                    const player = server.players.find(p => p.user.userId === userId);
                    if (player) {
                        if (bonus) {
                            player.score += (server.options.answerPoint + 1);
                        } else {
                            player.score += server.options.answerPoint;
                        }
                        if (player.score >= server.options.winPoint) {
                            server.gameStatus = 'win';
                            player.wins += 1;
                            await server.save();
                            return GameServer.findOne({ code: serverCode }).populate('players.user').populate('buzzOrder');
                        }
                    }
                } else if (server.options.deductPointOnWrongAnswer) {
                    const player = server.players.find(p => p.user.userId === userId);
                    if (player) {
                        player.score -= 1;
                    }
                }

                if (accept) {
                    server.buzzOrder = [];
                } else {
                    server.buzzOrder = server.buzzOrder.filter(buzzedUser => buzzedUser.userId !== userId);
                }

                if (server.buzzOrder.length === 0) {
                    if (!accept && server.options.autoRestartAfterDecline) {
                        server.gameStatus = 'inProgress';
                    } else {
                        server.gameStatus = 'waiting';
                    }
                }

                await server.save();
                return server;
            });
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
                await retryOnVersionError(() => server.save());

                // Informer tous les clients connectés au serveur des nouvelles options
                io.to(serverCode).emit('serverOptionsUpdated', server.options);
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while updating server options" });
            }
        });


        socket.on('updateUserProfile', async ({ userPicture }) => {
            try {
                // Mettre à jour l'image et la couleur de profil de l'utilisateur dans MongoDB
                await User.findOneAndUpdate({ socketId: socket.id }, { $set: { userPicture } });
                const newUser = await User.findOne({ socketId: socket.id });
                socket.emit('updateProfile', { newUserRole:newUser.userRole, newUserName: newUser.userName, newUserPicture: newUser.userPicture, newUserTheme: newUser.userTheme });
            } catch (error) {
                console.error(error);
                // Gérer l'erreur ici, par exemple, envoyer un message d'erreur au client-old
            }
        });


        socket.on('updateUserTheme', async ({ userTheme }) => {
            try {
                await User.findOneAndUpdate({ socketId: socket.id }, { $set: { userTheme } });
                const newUser = await User.findOne({ socketId: socket.id });
                socket.emit('updateProfile', { newUserRole:newUser.userRole, newUserName: newUser.userName, newUserPicture: newUser.userPicture, newUserTheme: newUser.userTheme });
            } catch (error) {
                console.error(error);
            }
        });


        socket.on('kickPlayer', async ({ serverCode, playerId }) => {
            try {
                const server = await retryOnVersionError(async () => {
                    const doc = await GameServer.findOne({ code: serverCode,
                        status: { $ne: 'del' } }).populate('players.user');
                    if (!doc) {
                        return null;
                    }

                    const user = await User.findOne({ userId: socket.userId });
                    if (!user || (user.userId !== doc.hostId && user.userRole !== 'admin')) {
                        return null;
                    }

                    const playerIndex = doc.players.findIndex(p => p.user.userId === playerId);
                    if (playerIndex === -1) {
                        return null;
                    }

                    doc.players.splice(playerIndex, 1);
                    await doc.save();
                    return doc;
                });

                if (!server) {
                    return;
                }

                const kickedUser = await User.findOne({ userId: playerId });
                if (kickedUser && io.sockets.sockets.has(kickedUser.socketId)) {
                    io.sockets.sockets.get(kickedUser.socketId).emit('kickServer');
                }

                io.to(serverCode).emit('playersUpdate', server);
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while kicking the player" });
            }
        });


        socket.on('resetScores', async ({ serverCode }) => {
            try {
                const server = await retryOnVersionError(async () => {
                    const doc = await GameServer.findOne({
                        code: serverCode,
                        status: { $ne: 'del' }
                    }).populate('players.user').populate('buzzOrder');
                    if (!doc) {
                        return null;
                    }

                    const user = await User.findOne({ userId: socket.userId });
                    if (!user || (user.userId !== doc.hostId && user.userRole !== 'admin')) {
                        return null;
                    }

                    doc.gameStatus = 'waiting';
                    doc.buzzOrder = [];
                    doc.players.forEach(player => {
                        player.score = 0;
                    });
                    await doc.save();
                    return doc;
                });

                if (server) {
                    io.to(serverCode).emit('gameReStarted', { server });
                }
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while resetting scores" });
            }
        });


        socket.on('delServer', async ({ serverCode, playerId }) => {
            try {
                const deleted = await retryOnVersionError(async () => {
                    const doc = await GameServer.findOne({
                        code: serverCode,
                        status: { $ne: 'del' }
                    }).populate('players.user');
                    if (!doc) {
                        return false;
                    }

                    const user = await User.findOne({ userId: socket.userId });
                    if (!user || (user.userId !== doc.hostId && user.userRole !== 'admin')) {
                        return false;
                    }

                    doc.status = 'del';
                    await doc.save();
                    return true;
                });

                if (deleted) {
                    io.to(serverCode).emit('serverDeleted');
                }
            } catch (error) {
                console.error(error);
                socket.emit('serverError', { message: "An error occurred while deleting the server" });
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
