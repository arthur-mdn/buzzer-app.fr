// gameSockets.js
const GameServer = require("../models/GameServer");
const { verifyToken } = require('../others/jwtUtils');
const { retryOnVersionError, safeSocketOn } = require('../others/mongoUtils');
const User = require("../models/User");

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('a user connected');

        const token = socket.handshake.query.token;

        try {
            const data = verifyToken(token);
            socket.userId = data.userId;
        } catch {
            socket.disconnect();
            return;
        }

        const safeOn = (event, handler, errorMessage) => safeSocketOn(socket, event, handler, errorMessage);

        async function setUserStateInServers(user, state) {
            const servers = await GameServer.find({
                'players.user': user._id,
                status: { $ne: 'del' }
            });
            for (const server of servers) {
                const player = server.players.find(p => p.user.equals(user._id));
                if (player) {
                    player.state = state;
                    await retryOnVersionError(() => server.save());
                    const populatedServer = await GameServer.findById(server._id).populate('players.user');
                    io.to(server.code).emit('playersUpdate', populatedServer);
                }
            }
        }

        async function handleUserDisconnect(socketId) {
            const user = await User.findOne({ socketId });
            if (user) {
                await setUserStateInServers(user, 'offline');
            } else {
                console.log("user not found");
            }
        }

        async function handleAnswer(userId, serverCode, accept = true, bonus = false) {
            return retryOnVersionError(async () => {
                const server = await GameServer.findOne({
                    code: serverCode,
                    status: { $ne: 'del' }
                }).populate('players.user').populate('buzzOrder');
                if (!server) {
                    return null;
                }

                if (accept) {
                    const player = server.players.find(p => p.user?.userId === userId);
                    if (player) {
                        player.score += bonus
                            ? (server.options.answerPoint + 1)
                            : server.options.answerPoint;
                        if (player.score >= server.options.winPoint) {
                            server.gameStatus = 'win';
                            player.wins += 1;
                            await server.save();
                            return GameServer.findOne({ code: serverCode }).populate('players.user').populate('buzzOrder');
                        }
                    }
                } else if (server.options.deductPointOnWrongAnswer) {
                    const player = server.players.find(p => p.user?.userId === userId);
                    if (player) {
                        player.score -= 1;
                    }
                }

                if (accept) {
                    server.buzzOrder = [];
                } else {
                    server.buzzOrder = server.buzzOrder.filter(buzzedUser => {
                        const buzzedUserId = buzzedUser.userId ?? buzzedUser.toString();
                        return buzzedUserId !== userId;
                    });
                }

                if (server.buzzOrder.length === 0) {
                    server.gameStatus = (!accept && server.options.autoRestartAfterDecline)
                        ? 'inProgress'
                        : 'waiting';
                }

                await server.save();
                return server;
            });
        }

        safeOn('updateSocketId', async ({ userId }) => {
            const user = await User.findOne({ userId });
            if (!user) {
                return;
            }

            if (user.socketId && io.sockets.sockets.has(user.socketId)) {
                io.sockets.sockets.get(user.socketId).emit('forceDisconnect');
                await setUserStateInServers(user, 'offline');
            }

            user.socketId = socket.id;
            await user.save();
            socket.emit('socketIdUpdated');
        }, 'An error occurred while updating the socket');

        safeOn('joinServer', async ({ serverCode }) => {
            if (!serverCode) {
                socket.emit('serverError', { message: "Server code is required" });
                return;
            }

            const server = await GameServer.findOne({
                code: serverCode,
                status: { $ne: 'del' }
            }).populate('players.user').populate('buzzOrder');

            if (!server) {
                socket.emit('serverError', { message: "Server does not exist" });
                return;
            }

            const user = await User.findOne({ socketId: socket.id });
            if (!user) {
                socket.emit('serverError', { message: "User not found" });
                return;
            }

            if (!Array.isArray(server.players)) {
                server.players = [];
            }

            const existingPlayerIndex = server.players.findIndex(player => player.user?.userId === user.userId);

            if (existingPlayerIndex !== -1) {
                server.players[existingPlayerIndex].state = 'online';
            } else if (user.userId === server.hostId) {
                server.players.push({ user, state: 'online', role: 'host' });
            } else {
                server.players.push({ user, state: 'online', role: 'user' });
            }

            server.players = server.players.filter((player, index, self) =>
                index === self.findIndex((p) => (
                    p.user?.userId === player.user?.userId && p.user?.socketId === player.user?.socketId
                ))
            );

            await retryOnVersionError(() => server.save());
            socket.join(serverCode);
            io.to(serverCode).emit('playersUpdate', server);
        }, 'An error occurred while joining the server');

        socket.on('joinRoom', (serverCode) => {
            if (serverCode) {
                socket.join(serverCode);
            }
        });

        safeOn('startGame', async ({ serverCode }) => {
            await retryOnVersionError(async () => {
                const server = await GameServer.findOne({ code: serverCode, status: { $ne: 'del' } });
                if (!server) {
                    return;
                }
                server.gameStatus = 'inProgress';
                server.buzzOrder = [];
                await server.save();
            });
            io.to(serverCode).emit('gameStarted');
        }, 'An error occurred while starting the game');

        safeOn('newGame', async ({ serverCode }) => {
            const server = await retryOnVersionError(async () => {
                const doc = await GameServer.findOne({
                    code: serverCode,
                    status: { $ne: 'del' }
                }).populate('players.user').populate('buzzOrder');
                if (!doc) {
                    return null;
                }
                doc.gameStatus = 'waiting';
                doc.buzzOrder = [];
                doc.players.forEach(player => {
                    player.score = 0;
                });
                await doc.save();
                return GameServer.findOne({ code: serverCode, status: { $ne: 'del' } })
                    .populate('players.user').populate('buzzOrder');
            });
            if (server) {
                io.to(serverCode).emit('gameReStarted', { server });
            }
        }, 'An error occurred while restarting the game');

        safeOn('cancelGame', async ({ serverCode }) => {
            await retryOnVersionError(async () => {
                const server = await GameServer.findOne({ code: serverCode, status: { $ne: 'del' } });
                if (!server) {
                    return;
                }
                server.gameStatus = 'waiting';
                server.buzzOrder = [];
                await server.save();
            });
            io.to(serverCode).emit('gameCancelled');
        }, 'An error occurred while cancelling the game');

        safeOn('buzz', async ({ serverCode }) => {
            console.log("buzz serve");

            await retryOnVersionError(async () => {
                const user = await User.findOne({ socketId: socket.id });
                if (!user) {
                    console.error("No user found for socket ID:", socket.id);
                    return;
                }

                const server = await GameServer.findOne({
                    code: serverCode,
                    status: { $ne: 'del' }
                }).populate('buzzOrder');

                if (server && (server.gameStatus === 'inProgress' || server.gameStatus === 'buzzed')) {
                    const userIdString = user._id.toString();
                    if (!server.buzzOrder.some(buzzedUser => buzzedUser._id.toString() === userIdString)) {
                        server.buzzOrder.push(user._id);
                        server.gameStatus = 'buzzed';
                        await server.save();
                    }
                }
            });

            const serverUpdated = await GameServer.findOne({
                code: serverCode,
                status: { $ne: 'del' }
            }).populate('buzzOrder');
            if (serverUpdated) {
                io.to(serverCode).emit('playerBuzzed', { server: serverUpdated });
            }
        }, 'An error occurred while processing the buzz event');

        safeOn('acceptAnswer', async ({ userId, serverCode }) => {
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
        }, 'An error occurred while accepting the answer');

        safeOn('acceptAnswerBonus', async ({ userId, serverCode }) => {
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
        }, 'An error occurred while accepting the answer');

        safeOn('declineAnswer', async ({ userId, serverCode }) => {
            console.log("decline");
            const server = await handleAnswer(userId, serverCode, false);
            if (!server) {
                return;
            }
            io.to(serverCode).emit('answerDeclined', { server });
        }, 'An error occurred while declining the answer');

        safeOn('userLeaving', async () => {
            console.log('user disconnected leaving');
            await handleUserDisconnect(socket.id);
        }, 'An error occurred while handling user leave');

        safeOn('disconnect', async () => {
            console.log('user disconnected');
            await handleUserDisconnect(socket.id);
        }, 'An error occurred while handling disconnect');

        safeOn('updateServerOptions', async ({ serverCode, newOptions }) => {
            const server = await GameServer.findOne({ code: serverCode, status: { $ne: 'del' } });
            if (!server) {
                socket.emit('serverError', { message: "Server not found" });
                return;
            }
            server.options = newOptions;
            await retryOnVersionError(() => server.save());
            io.to(serverCode).emit('serverOptionsUpdated', server.options);
        }, 'An error occurred while updating server options');

        safeOn('updateUserProfile', async ({ userPicture }) => {
            await User.findOneAndUpdate({ socketId: socket.id }, { $set: { userPicture } });
            const newUser = await User.findOne({ socketId: socket.id });
            if (!newUser) {
                socket.emit('serverError', { message: "User not found" });
                return;
            }
            socket.emit('updateProfile', {
                newUserRole: newUser.userRole,
                newUserName: newUser.userName,
                newUserPicture: newUser.userPicture,
                newUserTheme: newUser.userTheme
            });
        }, 'An error occurred while updating the profile');

        safeOn('updateUserTheme', async ({ userTheme }) => {
            await User.findOneAndUpdate({ socketId: socket.id }, { $set: { userTheme } });
            const newUser = await User.findOne({ socketId: socket.id });
            if (!newUser) {
                socket.emit('serverError', { message: "User not found" });
                return;
            }
            socket.emit('updateProfile', {
                newUserRole: newUser.userRole,
                newUserName: newUser.userName,
                newUserPicture: newUser.userPicture,
                newUserTheme: newUser.userTheme
            });
        }, 'An error occurred while updating the theme');

        safeOn('kickPlayer', async ({ serverCode, playerId }) => {
            const server = await retryOnVersionError(async () => {
                const doc = await GameServer.findOne({
                    code: serverCode,
                    status: { $ne: 'del' }
                }).populate('players.user');
                if (!doc) {
                    return null;
                }

                const user = await User.findOne({ userId: socket.userId });
                if (!user || (user.userId !== doc.hostId && user.userRole !== 'admin')) {
                    return null;
                }

                const playerIndex = doc.players.findIndex(p => p.user?.userId === playerId);
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
            if (kickedUser?.socketId && io.sockets.sockets.has(kickedUser.socketId)) {
                io.sockets.sockets.get(kickedUser.socketId).emit('kickServer');
            }

            io.to(serverCode).emit('playersUpdate', server);
        }, 'An error occurred while kicking the player');

        safeOn('resetScores', async ({ serverCode }) => {
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
        }, 'An error occurred while resetting scores');

        safeOn('delServer', async ({ serverCode }) => {
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
        }, 'An error occurred while deleting the server');

        safeOn('adminForceDisconnect', async () => {
            const user = await User.findOne({ userId: socket.userId });
            if (user?.userRole === 'admin') {
                io.sockets.sockets.forEach(s => {
                    s.emit('adminForceDisconnect');
                    s.disconnect(true);
                });
            }
        }, 'An error occurred during admin force disconnect');

        safeOn('adminForceResetProfilPictures', async () => {
            const user = await User.findOne({ userId: socket.userId });
            if (user?.userRole === 'admin') {
                const userPicture = { smiley: "1", color: "#999" };
                await User.updateMany({}, { $set: { userPicture } });
            }
        }, 'An error occurred during admin profile reset');

        socket.on('ping-server', (startTime) => {
            socket.emit('pong-server', { startTime, endTime: Date.now() });
        });
    });
};
