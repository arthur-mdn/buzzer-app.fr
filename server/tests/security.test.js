const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const ORIGINAL_ENV = { ...process.env };
const OLD_HARDCODED_SECRET = 'R08U5T_789324985_7897ezaouc' + 'secret';

describe('security hardening', () => {
    before(() => {
        process.env.JWT_SECRET = 'a'.repeat(32);
        process.env.DB_URI = 'mongodb://127.0.0.1:27017/buzzer-test';
        delete require.cache[require.resolve('../others/config')];
        delete require.cache[require.resolve('../others/jwtUtils')];
    });

    after(() => {
        process.env = { ...ORIGINAL_ENV };
        delete require.cache[require.resolve('../others/config')];
        delete require.cache[require.resolve('../others/jwtUtils')];
    });

    it('rejects missing JWT_SECRET', () => {
        delete process.env.JWT_SECRET;
        delete require.cache[require.resolve('../others/config')];
        const config = require('../others/config');
        assert.throws(() => config.assertConfig(), /JWT_SECRET/);
        process.env.JWT_SECRET = 'a'.repeat(32);
        delete require.cache[require.resolve('../others/config')];
    });

    it('signs and verifies tokens with env secret', () => {
        delete require.cache[require.resolve('../others/jwtUtils')];
        const { generateToken, verifyToken } = require('../others/jwtUtils');
        const token = generateToken({ userId: 'user-1' });
        const payload = verifyToken(token);
        assert.equal(payload.userId, 'user-1');
    });

    it('rejects tokens signed with another secret', () => {
        delete require.cache[require.resolve('../others/jwtUtils')];
        const jwt = require('jsonwebtoken');
        const { verifyToken } = require('../others/jwtUtils');
        const forged = jwt.sign({ userId: 'admin' }, OLD_HARDCODED_SECRET);
        assert.throws(() => verifyToken(forged));
    });

    it('never grants admin when ADMIN_PASSWORD is unset', () => {
        const { isAdminRegistration } = require('../others/sanitizeOptions');
        assert.equal(isAdminRegistration(undefined, null), false);
        assert.equal(isAdminRegistration('', null), false);
        assert.equal(isAdminRegistration(undefined, undefined), false);
    });

    it('grants admin only for exact non-empty password match', () => {
        const { isAdminRegistration } = require('../others/sanitizeOptions');
        assert.equal(isAdminRegistration('secret', 'secret'), true);
        assert.equal(isAdminRegistration('wrong', 'secret'), false);
        assert.equal(isAdminRegistration('', 'secret'), false);
    });

    it('normalizes usernames and rejects invalid values', () => {
        const { normalizeUserName } = require('../others/sanitizeOptions');
        assert.equal(normalizeUserName('  Alice  '), 'Alice');
        assert.equal(normalizeUserName(''), null);
        assert.equal(normalizeUserName('a'.repeat(33)), null);
        assert.equal(normalizeUserName(123), null);
    });

    it('clamps server options', () => {
        const { sanitizeOptions } = require('../others/sanitizeOptions');
        const options = sanitizeOptions({
            answerPoint: -5,
            winPoint: 99999,
            deductPointOnWrongAnswer: 1,
            isPublic: 'yes',
        });
        assert.equal(options.answerPoint, 1);
        assert.equal(options.winPoint, 1000);
        assert.equal(options.deductPointOnWrongAnswer, true);
        assert.equal(options.isPublic, true);
    });
});
