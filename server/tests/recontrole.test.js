const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const ORIGINAL_ENV = { ...process.env };

describe('recontrole guards', () => {
    before(() => {
        process.env.JWT_SECRET = 'a'.repeat(32);
        process.env.DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/buzzer-test';
        delete require.cache[require.resolve('../others/config')];
    });

    after(() => {
        process.env = { ...ORIGINAL_ENV };
        delete require.cache[require.resolve('../others/config')];
    });

    it('rejects known JWT_SECRET placeholders', () => {
        process.env.JWT_SECRET = 'REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS';
        delete require.cache[require.resolve('../others/config')];
        const config = require('../others/config');
        assert.throws(() => config.assertConfig(), /placeholder|example/i);
        process.env.JWT_SECRET = 'a'.repeat(32);
        delete require.cache[require.resolve('../others/config')];
    });

    it('rejects known ADMIN_PASSWORD placeholder', () => {
        process.env.JWT_SECRET = 'a'.repeat(32);
        process.env.ADMIN_PASSWORD = 'SET_A_PASSWORD_FOR_THE_USER_TO_GET_ADMIN_PRIVILEGES_PLEASE_CHANGE_IT';
        delete require.cache[require.resolve('../others/config')];
        const config = require('../others/config');
        assert.throws(() => config.assertConfig(), /ADMIN_PASSWORD|placeholder|example/i);
        delete process.env.ADMIN_PASSWORD;
        delete require.cache[require.resolve('../others/config')];
    });

    it('filters socket events by serverCode', () => {
        const { eventMatchesServer } = require('../others/eventMatchesServer');
        assert.equal(eventMatchesServer({ serverCode: 'AAA' }, 'AAA'), true);
        assert.equal(eventMatchesServer({ server: { code: 'BBB' } }, 'AAA'), false);
        assert.equal(eventMatchesServer({ code: 'AAA' }, 'AAA'), true);
        assert.equal(eventMatchesServer({}, 'AAA'), false);
        assert.equal(eventMatchesServer({ serverCode: 'BBB' }, 'AAA'), false);
    });

    it('limits expensive socket events in memory', () => {
        const { createSocketRateLimiter } = require('../others/socketRateLimit');
        const allow = createSocketRateLimiter({ windowMs: 10_000, max: 3 });
        assert.equal(allow('socket-1:buzz'), true);
        assert.equal(allow('socket-1:buzz'), true);
        assert.equal(allow('socket-1:buzz'), true);
        assert.equal(allow('socket-1:buzz'), false);
        assert.equal(allow('socket-2:buzz'), true);
    });
});

describe('atomic buzz uniqueness', () => {
    const hasDb = Boolean(process.env.BUZZER_INTEGRATION_DB || process.env.DB_URI);
    let User;
    let GameServer;

    before(async () => {
        if (!hasDb) {
            return;
        }
        try {
            await mongoose.connect(process.env.BUZZER_INTEGRATION_DB || process.env.DB_URI, {
                serverSelectionTimeoutMS: 2000,
            });
            User = require('../models/User');
            GameServer = require('../models/GameServer');
        } catch {
            // Skip when Mongo is unreachable (CI without a DB service).
        }
    });

    after(async () => {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    });

    it('keeps a single buzzOrder entry under concurrent buzz updates', async (t) => {
        if (mongoose.connection.readyState !== 1) {
            t.skip('MongoDB unavailable');
            return;
        }

        const suffix = Date.now().toString(36);
        const host = await User.create({
            userId: `host-${suffix}`,
            userName: 'Host',
            userPicture: { smiley: 1, color: '#999' },
            userTheme: { background: 'default' },
        });
        const player = await User.create({
            userId: `player-${suffix}`,
            userName: 'Player',
            userPicture: { smiley: 2, color: '#999' },
            userTheme: { background: 'default' },
        });

        const code = `T${suffix}`.slice(0, 8).toUpperCase();
        const server = await GameServer.create({
            name: 'Concurrent buzz',
            code,
            hostId: host.userId,
            gameStatus: 'inProgress',
            players: [
                { user: host._id, state: 'online', role: 'host', score: 0, wins: 0 },
                { user: player._id, state: 'online', role: 'user', score: 0, wins: 0 },
            ],
            buzzOrder: [],
            blason: { blason: 1 },
        });

        try {
            const results = await Promise.all(
                Array.from({ length: 8 }, () => GameServer.findOneAndUpdate(
                    {
                        _id: server._id,
                        status: { $ne: 'del' },
                        gameStatus: { $in: ['inProgress', 'buzzed'] },
                        players: { $elemMatch: { user: player._id, role: { $ne: 'host' } } },
                        buzzOrder: { $nin: [player._id] },
                    },
                    {
                        $push: { buzzOrder: player._id },
                        $set: {
                            gameStatus: 'buzzed',
                            'players.$[p].state': 'online',
                        },
                    },
                    {
                        returnDocument: 'after',
                        arrayFilters: [{ 'p.user': player._id }],
                    }
                ))
            );

            const updatedCount = results.filter(Boolean).length;
            assert.equal(updatedCount, 1);

            const refreshed = await GameServer.findById(server._id).lean();
            const playerEntries = refreshed.buzzOrder
                .map((id) => String(id))
                .filter((id) => id === String(player._id));
            assert.equal(playerEntries.length, 1);
        } finally {
            await GameServer.deleteOne({ _id: server._id });
            await User.deleteMany({ _id: { $in: [host._id, player._id] } });
        }
    });
});
