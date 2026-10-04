function createSocketRateLimiter({ windowMs, max }) {
    const hits = new Map();

    return function allow(key) {
        const now = Date.now();
        const bucket = hits.get(key);

        if (!bucket || now - bucket.startedAt >= windowMs) {
            hits.set(key, { startedAt: now, count: 1 });
            return true;
        }

        if (bucket.count >= max) {
            return false;
        }

        bucket.count += 1;
        return true;
    };
}

const expensiveEventLimiter = createSocketRateLimiter({
    windowMs: 10_000,
    max: 20,
});

function allowExpensiveSocketEvent(socketId, eventName) {
    return expensiveEventLimiter(`${socketId}:${eventName}`);
}

module.exports = {
    createSocketRateLimiter,
    allowExpensiveSocketEvent,
};
