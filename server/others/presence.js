const socketPresence = new Map();
const observersByServer = new Map();

function registerSocket(socketId, { userId, userName, userRole, userPicture }) {
    socketPresence.set(socketId, {
        socketId,
        userId,
        userName: userName || 'Unknown',
        userRole: userRole || 'user',
        userPicture: userPicture || null,
        connectedAt: Date.now(),
        serverCodes: [],
        observing: [],
    });
}

function updateSocketProfile(socketId, { userName, userRole, userPicture } = {}) {
    const entry = socketPresence.get(socketId);
    if (!entry) {
        return;
    }
    if (typeof userName === 'string') {
        entry.userName = userName;
    }
    if (typeof userRole === 'string') {
        entry.userRole = userRole;
    }
    if (userPicture !== undefined) {
        entry.userPicture = userPicture || null;
    }
}

function unregisterSocket(socketId) {
    const entry = socketPresence.get(socketId);
    if (entry) {
        for (const code of entry.observing || []) {
            removeObserver(code, socketId);
        }
    }
    socketPresence.delete(socketId);
}

function setJoinedServers(socketId, serverCodes) {
    const entry = socketPresence.get(socketId);
    if (!entry) {
        return;
    }
    entry.serverCodes = Array.from(new Set(serverCodes.filter(Boolean)));
}

function addJoinedServer(socketId, serverCode) {
    const entry = socketPresence.get(socketId);
    if (!entry || !serverCode) {
        return;
    }
    if (!entry.serverCodes.includes(serverCode)) {
        entry.serverCodes.push(serverCode);
    }
}

function removeJoinedServer(socketId, serverCode) {
    const entry = socketPresence.get(socketId);
    if (!entry || !serverCode) {
        return;
    }
    entry.serverCodes = entry.serverCodes.filter((code) => code !== serverCode);
}

function addObserver(serverCode, socketId) {
    if (!observersByServer.has(serverCode)) {
        observersByServer.set(serverCode, new Set());
    }
    observersByServer.get(serverCode).add(socketId);

    const entry = socketPresence.get(socketId);
    if (entry && !entry.observing.includes(serverCode)) {
        entry.observing.push(serverCode);
    }
}

function removeObserver(serverCode, socketId) {
    const set = observersByServer.get(serverCode);
    if (set) {
        set.delete(socketId);
        if (set.size === 0) {
            observersByServer.delete(serverCode);
        }
    }

    const entry = socketPresence.get(socketId);
    if (entry) {
        entry.observing = entry.observing.filter((code) => code !== serverCode);
    }
}

function listSockets() {
    return Array.from(socketPresence.values()).map((entry) => ({
        socketId: entry.socketId,
        userId: entry.userId,
        userName: entry.userName,
        userRole: entry.userRole,
        userPicture: entry.userPicture,
        connectedAt: entry.connectedAt,
        serverCodes: [...entry.serverCodes],
        observing: [...entry.observing],
    }));
}

function getConnectedAtForUser(userId) {
    let earliest = null;
    for (const entry of socketPresence.values()) {
        if (entry.userId === userId) {
            if (earliest == null || entry.connectedAt < earliest) {
                earliest = entry.connectedAt;
            }
        }
    }
    return earliest;
}

function getOnlineUserIds() {
    return new Set(Array.from(socketPresence.values()).map((entry) => entry.userId));
}

function getSocketCount() {
    return socketPresence.size;
}

module.exports = {
    registerSocket,
    updateSocketProfile,
    unregisterSocket,
    setJoinedServers,
    addJoinedServer,
    removeJoinedServer,
    addObserver,
    removeObserver,
    listSockets,
    getConnectedAtForUser,
    getOnlineUserIds,
    getSocketCount,
};
