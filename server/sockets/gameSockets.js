const GameServer = require("../models/GameServer");
const { verifyToken } = require('../others/jwtUtils');
const { retryOnVersionError, safeSocketOn } = require('../others/mongoUtils');
const User = require("../models/User");
const { USER_PUBLIC_FIELDS } = require('../others/userPublicFields');
const { sanitizeOptions } = require('../others/sanitizeOptions');
const { allowExpensiveSocketEvent } = require('../others/socketRateLimit');
const presence = require('../others/presence');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('a user connected');

        const token = socket.handshake.query.token;

        try {
            const data = verifyToken(token);
            if (typeof data.userId !== 'string' || !data.userId) {
                socket.disconnect();
                return;
            }
            socket.userId = data.userId;
            presence.registerSocket(socket.id, {
                userId: data.userId,
                userName: 'Unknown',
                userRole: 'user',
            });
            User.findOne({ userId: data.userId })
                .select('userName userRole userPicture')
                .lean()
                .then((user) => {
                    if (!user) {
                        return;
                    }
                    presence.updateSocketProfile(socket.id, {
                        userName: user.userName,
                        userRole: user.userRole,
                        userPicture: user.userPicture,
                    });
                })
                .catch(() => {});
        } catch {
            socket.disconnect();
            return;
        }

        const safeOn = (event, handler, errorMessage) => safeSocketOn(socket, event, handler, errorMessage);

        function rateLimited(eventName, handler) {
            return async (...args) => {
                if (!allowExpensiveSocketEvent(socket.id, eventName)) {
                    socket.emit('serverError', { message: 'Too many requests, slow down' });
                    return;
                }
                return handler(...args);
            };
        }

        function populateServer(query) {
            return query
                .populate({ path: 'players.user', select: USER_PUBLIC_FIELDS })
                .populate({ path: 'buzzOrder', select: USER_PUBLIC_FIELDS });
        }

        function watchRoom(serverCode) {
            return `watch:${serverCode}`;
        }

        async function emitPlayersUpdate(serverCode, serverId) {
            const populatedServer = await populateServer(GameServer.findById(serverId)).lean();
            if (populatedServer) {
                io.to(serverCode).emit('playersUpdate', populatedServer);
                io.to(watchRoom(serverCode)).emit('playersUpdate', populatedServer);
            }
            return populatedServer;
        }

        function getPlayerUserId(player) {
            return player?.user?._id?.toString?.() ?? player?.user?.toString?.() ?? null;
        }

        function dedupePlayersByUser(players = []) {
            const byUser = new Map();

            for (const player of players) {
                const id = getPlayerUserId(player);
                if (!id) {
                    continue;
                }

                const existing = byUser.get(id);
                if (!existing) {
                    byUser.set(id, player);
                    continue;
                }

                existing.score = Math.max(existing.score || 0, player.score || 0);
                existing.wins = Math.max(existing.wins || 0, player.wins || 0);
                if (player.state === 'online') {
                    existing.state = 'online';
                }
                if (player.role === 'host') {
                    existing.role = 'host';
                }
            }

            return Array.from(byUser.values());
        }

        async function cleanupDuplicatePlayers(serverId) {
            return retryOnVersionError(async () => {
                const doc = await GameServer.findById(serverId);
                if (!doc || !Array.isArray(doc.players)) {
                    return doc;
                }

                const deduped = dedupePlayersByUser(doc.players);
                if (deduped.length !== doc.players.length) {
                    doc.players = deduped;
                    await doc.save();
                }
                return doc;
            });
        }

        async function setUserStateInServers(user, state) {
            const servers = await GameServer.find({
                'players.user': user._id,
                status: { $ne: 'del' }
            }).select('_id code');

            for (const server of servers) {
                const updated = await GameServer.findOneAndUpdate(
                    {
                        _id: server._id,
                        'players.user': user._id,
                        status: { $ne: 'del' }
                    },
                    { $set: { 'players.$.state': state } },
                    { new: true }
                ).select('_id code');

                if (updated) {
                    await cleanupDuplicatePlayers(updated._id);
                    await emitPlayersUpdate(updated.code, updated._id);
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

        async function getAuthenticatedUser() {
            if (typeof socket.userId !== 'string' || !socket.userId) {
                return null;
            }
            return User.findOne({ userId: socket.userId });
        }

        async function assertAdmin() {
            const user = await getAuthenticatedUser();
            if (!user || user.userRole !== 'admin') {
                return null;
            }
            return user;
        }

        async function buildAdminOverview() {
            const [activeServers, gamesInProgress] = await Promise.all([
                GameServer.countDocuments({ status: { $ne: 'del' } }),
                GameServer.countDocuments({
                    status: { $ne: 'del' },
                    gameStatus: { $in: ['inProgress', 'buzzed'] },
                }),
            ]);

            return {
                connectedSockets: presence.getSocketCount(),
                onlineUsers: presence.getOnlineUserIds().size,
                activeServers,
                gamesInProgress,
            };
        }

        async function assertHostOrAdmin(serverCode) {
            const user = await getAuthenticatedUser();
            if (!user) {
                return null;
            }

            const server = await GameServer.findOne({
                code: serverCode,
                status: { $ne: 'del' }
            });
            if (!server) {
                return null;
            }

            if (user.userId !== server.hostId && user.userRole !== 'admin') {
                return null;
            }

            return { user, server };
        }

        async function handleAnswer(answeredUserId, serverCode, accept = true, bonus = false) {
            if (typeof answeredUserId !== 'string' || !answeredUserId) {
                return null;
            }

            return retryOnVersionError(async () => {
                const server = await populateServer(GameServer.findOne({
                    code: serverCode,
                    status: { $ne: 'del' },
                    gameStatus: 'buzzed'
                }));

                if (!server || !Array.isArray(server.buzzOrder) || server.buzzOrder.length === 0) {
                    return null;
                }

                const firstBuzzed = server.buzzOrder[0];
                if (!firstBuzzed || firstBuzzed.userId !== answeredUserId) {
                    return null;
                }

                if (accept) {
                    const player = server.players.find(p => p.user?.userId === answeredUserId);
                    if (player) {
                        player.score += bonus
                            ? (server.options.answerPoint + 1)
                            : server.options.answerPoint;
                        if (player.score >= server.options.winPoint) {
                            server.gameStatus = 'win';
                            player.wins += 1;
                            server.buzzOrder = [];
                            await server.save();
                            return populateServer(GameServer.findOne({ code: serverCode }));
                        }
                    }
                    server.buzzOrder = [];
                    server.gameStatus = 'waiting';
                } else {
                    if (server.options.deductPointOnWrongAnswer) {
                        const player = server.players.find(p => p.user?.userId === answeredUserId);
                        if (player) {
                            player.score = Math.max(0, player.score - 1);
                        }
                    }

                    server.buzzOrder = server.buzzOrder.filter((buzzedUser) => {
                        return buzzedUser.userId !== answeredUserId;
                    });

                    if (server.buzzOrder.length === 0) {
                        server.gameStatus = server.options.autoRestartAfterDecline
                            ? 'inProgress'
                            : 'waiting';
                    }
                }

                await server.save();
                return populateServer(GameServer.findOne({ code: serverCode }));
            });
        }

        safeOn('updateSocketId', async () => {
            const user = await getAuthenticatedUser();
            if (!user) {
                return;
            }

            if (user.socketId && user.socketId !== socket.id && io.sockets.sockets.has(user.socketId)) {
                io.sockets.sockets.get(user.socketId).emit('forceDisconnect');
                await setUserStateInServers(user, 'offline');
            }

            user.socketId = socket.id;
            await user.save();
            presence.updateSocketProfile(socket.id, {
                userName: user.userName,
                userRole: user.userRole,
                userPicture: user.userPicture,
            });
            socket.emit('socketIdUpdated');
        }, 'An error occurred while updating the socket');

        safeOn('joinServer', rateLimited('joinServer', async ({ serverCode }) => {
            if (!serverCode || typeof serverCode !== 'string') {
                socket.emit('serverError', { message: "Server code is required" });
                return;
            }

            const user = await getAuthenticatedUser();
            if (!user) {
                socket.emit('serverError', { message: "User not found" });
                return;
            }

            user.socketId = socket.id;
            await user.save();

            let server = await GameServer.findOneAndUpdate(
                {
                    code: serverCode,
                    status: { $ne: 'del' },
                    'players.user': user._id
                },
                { $set: { 'players.$.state': 'online' } },
                { new: true }
            ).select('_id code hostId');

            if (!server) {
                const existing = await GameServer.findOne({
                    code: serverCode,
                    status: { $ne: 'del' }
                }).select('_id code hostId');

                if (!existing) {
                    socket.emit('serverError', { message: "Server does not exist" });
                    return;
                }

                server = await GameServer.findOneAndUpdate(
                    {
                        _id: existing._id,
                        status: { $ne: 'del' },
                        players: { $not: { $elemMatch: { user: user._id } } }
                    },
                    {
                        $push: {
                            players: {
                                user: user._id,
                                state: 'online',
                                role: user.userId === existing.hostId ? 'host' : 'user'
                            }
                        }
                    },
                    { new: true }
                ).select('_id code');

                if (!server) {
                    server = await GameServer.findOneAndUpdate(
                        {
                            _id: existing._id,
                            status: { $ne: 'del' },
                            'players.user': user._id
                        },
                        { $set: { 'players.$.state': 'online' } },
                        { new: true }
                    ).select('_id code');
                }
            }

            if (!server) {
                socket.emit('serverError', { message: "Server does not exist" });
                return;
            }

            await cleanupDuplicatePlayers(server._id);
            socket.join(serverCode);
            presence.addJoinedServer(socket.id, serverCode);
            await emitPlayersUpdate(serverCode, server._id);
        }), 'An error occurred while joining the server');

        safeOn('observeServer', rateLimited('observeServer', async ({ serverCode } = {}) => {
            if (!serverCode || typeof serverCode !== 'string') {
                socket.emit('serverError', { message: 'Server code is required' });
                return;
            }

            const user = await assertAdmin();
            if (!user) {
                socket.emit('serverError', { message: 'Not authorized' });
                return;
            }

            const server = await GameServer.findOne({
                code: serverCode,
                status: { $ne: 'del' },
            }).select('code');

            if (!server) {
                socket.emit('serverError', { message: 'Server does not exist' });
                return;
            }

            socket.join(serverCode);
            presence.addObserver(serverCode, socket.id);
            socket.emit('observeStarted', { serverCode });
        }), 'An error occurred while observing the server');

        safeOn('unobserveServer', async ({ serverCode } = {}) => {
            if (!serverCode || typeof serverCode !== 'string') {
                return;
            }
            socket.leave(serverCode);
            presence.removeObserver(serverCode, socket.id);
            presence.removeJoinedServer(socket.id, serverCode);
        }, 'An error occurred while unobserving the server');

        safeOn('watchServer', async (payload) => {
            const serverCode = typeof payload === 'string' ? payload : payload?.serverCode;
            if (!serverCode || typeof serverCode !== 'string') {
                return;
            }

            const user = await getAuthenticatedUser();
            if (!user) {
                return;
            }

            const server = await GameServer.findOne({
                code: serverCode,
                status: { $ne: 'del' },
                $or: [
                    { 'options.isPublic': true },
                    { 'players.user': user._id },
                    { hostId: user.userId }
                ]
            }).select('code');

            if (server) {
                socket.join(watchRoom(serverCode));
            }
        }, 'An error occurred while watching the server');

        safeOn('unwatchServer', async (payload) => {
            const serverCode = typeof payload === 'string' ? payload : payload?.serverCode;
            if (!serverCode || typeof serverCode !== 'string') {
                return;
            }
            socket.leave(watchRoom(serverCode));
        }, 'An error occurred while unwatching the server');

        safeOn('startGame', async ({ serverCode }) => {
            const auth = await assertHostOrAdmin(serverCode);
            if (!auth) {
                socket.emit('serverError', { message: "Not authorized" });
                return;
            }

            const updated = await retryOnVersionError(async () => {
                const server = await GameServer.findOne({ code: serverCode, status: { $ne: 'del' } });
                if (!server) {
                    return null;
                }
                server.gameStatus = 'inProgress';
                server.buzzOrder = [];
                await server.save();
                return server;
            });

            if (updated) {
                io.to(serverCode).emit('gameStarted', { serverCode });
            }
        }, 'An error occurred while starting the game');

        safeOn('newGame', async ({ serverCode }) => {
            const auth = await assertHostOrAdmin(serverCode);
            if (!auth) {
                socket.emit('serverError', { message: "Not authorized" });
                return;
            }

            const server = await retryOnVersionError(async () => {
                const doc = await populateServer(GameServer.findOne({
                    code: serverCode,
                    status: { $ne: 'del' }
                }));
                if (!doc) {
                    return null;
                }
                doc.gameStatus = 'waiting';
                doc.buzzOrder = [];
                doc.players.forEach(player => {
                    player.score = 0;
                });
                await doc.save();
                return populateServer(GameServer.findOne({ code: serverCode, status: { $ne: 'del' } }));
            });
            if (server) {
                io.to(serverCode).emit('gameReStarted', { serverCode, server });
            }
        }, 'An error occurred while restarting the game');

        safeOn('cancelGame', async ({ serverCode }) => {
            const auth = await assertHostOrAdmin(serverCode);
            if (!auth) {
                socket.emit('serverError', { message: "Not authorized" });
                return;
            }

            const updated = await retryOnVersionError(async () => {
                const server = await GameServer.findOne({ code: serverCode, status: { $ne: 'del' } });
                if (!server) {
                    return null;
                }
                server.gameStatus = 'waiting';
                server.buzzOrder = [];
                await server.save();
                return server;
            });

            if (updated) {
                io.to(serverCode).emit('gameCancelled', { serverCode });
            }
        }, 'An error occurred while cancelling the game');

        safeOn('buzz', rateLimited('buzz', async ({ serverCode }) => {
            const user = await getAuthenticatedUser();
            if (!user) {
                socket.emit('serverError', { message: "Utilisateur introuvable" });
                return;
            }

            if (!serverCode || typeof serverCode !== 'string') {
                return;
            }

            const updated = await GameServer.findOneAndUpdate(
                {
                    code: serverCode,
                    status: { $ne: 'del' },
                    gameStatus: { $in: ['inProgress', 'buzzed'] },
                    players: { $elemMatch: { user: user._id, role: { $ne: 'host' } } },
                    buzzOrder: { $nin: [user._id] },
                },
                {
                    $push: { buzzOrder: user._id },
                    $set: {
                        gameStatus: 'buzzed',
                        'players.$[p].state': 'online',
                    },
                },
                {
                    returnDocument: 'after',
                    arrayFilters: [{ 'p.user': user._id }],
                }
            );

            if (!updated) {
                return;
            }

            const serverUpdated = await populateServer(GameServer.findById(updated._id));
            if (serverUpdated) {
                io.to(serverCode).emit('playerBuzzed', { serverCode, server: serverUpdated });
            }
        }), 'An error occurred while processing the buzz event');

        safeOn('acceptAnswer', async ({ userId, serverCode }) => {
            const auth = await assertHostOrAdmin(serverCode);
            if (!auth) {
                socket.emit('serverError', { message: "Not authorized" });
                return;
            }

            const server = await handleAnswer(userId, serverCode, true);
            if (!server) {
                return;
            }
            if (server.gameStatus === "win") {
                io.to(serverCode).emit('answerWon', { serverCode, server });
            } else {
                io.to(serverCode).emit('answerAccepted', { serverCode, server });
            }
        }, 'An error occurred while accepting the answer');

        safeOn('acceptAnswerBonus', async ({ userId, serverCode }) => {
            const auth = await assertHostOrAdmin(serverCode);
            if (!auth) {
                socket.emit('serverError', { message: "Not authorized" });
                return;
            }

            const server = await handleAnswer(userId, serverCode, true, true);
            if (!server) {
                return;
            }
            if (server.gameStatus === "win") {
                io.to(serverCode).emit('answerWon', { serverCode, server });
            } else {
                io.to(serverCode).emit('answerAccepted', { serverCode, server });
            }
        }, 'An error occurred while accepting the answer');

        safeOn('declineAnswer', async ({ userId, serverCode }) => {
            const auth = await assertHostOrAdmin(serverCode);
            if (!auth) {
                socket.emit('serverError', { message: "Not authorized" });
                return;
            }

            const server = await handleAnswer(userId, serverCode, false);
            if (!server) {
                return;
            }
            io.to(serverCode).emit('answerDeclined', { serverCode, server });
        }, 'An error occurred while declining the answer');

        safeOn('userLeaving', async ({ serverCode } = {}) => {
            console.log('user disconnected leaving');
            if (serverCode) {
                socket.leave(serverCode);
                presence.removeJoinedServer(socket.id, serverCode);
                presence.removeObserver(serverCode, socket.id);
            }
            await handleUserDisconnect(socket.id);
        }, 'An error occurred while handling user leave');

        safeOn('disconnect', async () => {
            console.log('user disconnected');
            presence.unregisterSocket(socket.id);
            await handleUserDisconnect(socket.id);
        }, 'An error occurred while handling disconnect');

        safeOn('updateServerOptions', rateLimited('updateServerOptions', async ({ serverCode, newOptions }) => {
            const auth = await assertHostOrAdmin(serverCode);
            if (!auth) {
                socket.emit('serverError', { message: "Not authorized" });
                return;
            }

            const options = sanitizeOptions(newOptions);
            const server = await retryOnVersionError(async () => {
                const doc = await GameServer.findOne({ code: serverCode, status: { $ne: 'del' } });
                if (!doc) {
                    return null;
                }
                doc.options = options;
                await doc.save({ validateBeforeSave: true });
                return doc;
            });

            if (!server) {
                socket.emit('serverError', { message: "Server not found" });
                return;
            }

            io.to(serverCode).emit('serverOptionsUpdated', { serverCode, options: server.options });
        }), 'An error occurred while updating server options');

        safeOn('updateUserProfile', async ({ userPicture }) => {
            const user = await getAuthenticatedUser();
            if (!user) {
                socket.emit('serverError', { message: "User not found" });
                return;
            }

            await User.findOneAndUpdate(
                { userId: user.userId },
                { $set: { userPicture } },
                { runValidators: true }
            );
            const newUser = await User.findOne({ userId: user.userId });
            if (!newUser) {
                socket.emit('serverError', { message: "User not found" });
                return;
            }
            presence.updateSocketProfile(socket.id, {
                userName: newUser.userName,
                userRole: newUser.userRole,
                userPicture: newUser.userPicture,
            });
            socket.emit('updateProfile', {
                newUserRole: newUser.userRole,
                newUserName: newUser.userName,
                newUserPicture: newUser.userPicture,
                newUserTheme: newUser.userTheme
            });
        }, 'An error occurred while updating the profile');

        safeOn('updateUserTheme', async ({ userTheme }) => {
            const user = await getAuthenticatedUser();
            if (!user) {
                socket.emit('serverError', { message: "User not found" });
                return;
            }

            await User.findOneAndUpdate(
                { userId: user.userId },
                { $set: { userTheme } },
                { runValidators: true }
            );
            const newUser = await User.findOne({ userId: user.userId });
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
                const doc = await populateServer(GameServer.findOne({
                    code: serverCode,
                    status: { $ne: 'del' }
                }));
                if (!doc) {
                    return null;
                }

                const user = await getAuthenticatedUser();
                if (!user || (user.userId !== doc.hostId && user.userRole !== 'admin')) {
                    return null;
                }

                const playerIndex = doc.players.findIndex(p => p.user?.userId === playerId);
                if (playerIndex === -1) {
                    return null;
                }

                doc.players.splice(playerIndex, 1);
                doc.players = dedupePlayersByUser(doc.players);
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

            await emitPlayersUpdate(serverCode, server._id);
        }, 'An error occurred while kicking the player');

        safeOn('resetScores', async ({ serverCode }) => {
            const auth = await assertHostOrAdmin(serverCode);
            if (!auth) {
                socket.emit('serverError', { message: "Not authorized" });
                return;
            }

            const server = await retryOnVersionError(async () => {
                const doc = await populateServer(GameServer.findOne({
                    code: serverCode,
                    status: { $ne: 'del' }
                }));
                if (!doc) {
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
                io.to(serverCode).emit('gameReStarted', { serverCode, server });
            }
        }, 'An error occurred while resetting scores');

        safeOn('delServer', async ({ serverCode }) => {
            const deleted = await retryOnVersionError(async () => {
                const doc = await GameServer.findOne({
                    code: serverCode,
                    status: { $ne: 'del' }
                });
                if (!doc) {
                    return false;
                }

                const user = await getAuthenticatedUser();
                if (!user || (user.userId !== doc.hostId && user.userRole !== 'admin')) {
                    return false;
                }

                doc.status = 'del';
                await doc.save();
                return true;
            });

            if (deleted) {
                io.to(serverCode).emit('serverDeleted', { serverCode });
                io.to(watchRoom(serverCode)).emit('serverDeleted', { serverCode });
            }
        }, 'An error occurred while deleting the server');

        safeOn('adminForceDisconnect', rateLimited('adminForceDisconnect', async () => {
            const user = await assertAdmin();
            if (user) {
                io.sockets.sockets.forEach(s => {
                    s.emit('adminForceDisconnect');
                    s.disconnect(true);
                });
            }
        }), 'An error occurred during admin force disconnect');

        safeOn('adminForceResetProfilPictures', rateLimited('adminForceResetProfilPictures', async () => {
            const user = await assertAdmin();
            if (user) {
                const userPicture = { smiley: 1, color: "#999" };
                await User.updateMany({}, { $set: { userPicture } });
            }
        }), 'An error occurred during admin profile reset');

        safeOn('adminGetOverview', rateLimited('adminGetOverview', async () => {
            const user = await assertAdmin();
            if (!user) {
                socket.emit('serverError', { message: 'Not authorized' });
                return;
            }
            const overview = await buildAdminOverview();
            socket.emit('adminOverview', overview);
        }), 'An error occurred while fetching admin overview');

        safeOn('adminGetSockets', rateLimited('adminGetSockets', async () => {
            const user = await assertAdmin();
            if (!user) {
                socket.emit('serverError', { message: 'Not authorized' });
                return;
            }
            const liveIds = new Set(io.sockets.sockets.keys());
            const sockets = presence.listSockets().filter((entry) => {
                if (liveIds.has(entry.socketId)) {
                    return true;
                }
                presence.unregisterSocket(entry.socketId);
                return false;
            });
            socket.emit('adminSockets', { sockets });
        }), 'An error occurred while fetching admin sockets');

        safeOn('adminDisconnectSocket', rateLimited('adminDisconnectSocket', async ({ socketId } = {}) => {
            const user = await assertAdmin();
            if (!user) {
                socket.emit('serverError', { message: 'Not authorized' });
                return;
            }
            if (!socketId || typeof socketId !== 'string') {
                return;
            }
            const target = io.sockets.sockets.get(socketId);
            if (target) {
                target.emit('forceDisconnect');
                target.disconnect(true);
            }
            if (socketId !== socket.id && socket.connected) {
                const liveIds = new Set(io.sockets.sockets.keys());
                const sockets = presence.listSockets().filter((entry) => {
                    if (liveIds.has(entry.socketId)) {
                        return true;
                    }
                    presence.unregisterSocket(entry.socketId);
                    return false;
                });
                socket.emit('adminSockets', { sockets });
            }
        }), 'An error occurred while disconnecting a socket');

        socket.on('ping-server', (startTime) => {
            socket.emit('pong-server', { startTime });
        });
    });
};
